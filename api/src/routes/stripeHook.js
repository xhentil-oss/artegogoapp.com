const express = require("express");
const { pool, query } = require("../db");
const stripe = require("../stripe");
const { applySubscription, record } = require("../subscriptionSync");

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════
 *  WEBHOOK-U I STRIPE-IT
 * ═══════════════════════════════════════════════════════════════
 *
 * ⚠️  KJO RRUGË NUK KA `requireAuth`, DHE NUK DUHET TË KETË.
 *
 *     Thirrësi është Stripe, jo një përdorues: nuk ka token dhe nuk ka si të
 *     ketë. Vendin e tokenit e zë nënshkrimi kriptografik i çdo kërkese, që
 *     `stripe.constructEvent` e verifikon para se të lexohet qoftë edhe një
 *     fushë e vetme. Pa `STRIPE_WEBHOOK_SECRET` kërkesa refuzohet — kurrë nuk
 *     kalon pa kontroll.
 *
 * ⚠️  MONTOHET ME `express.raw`, PARA `express.json` TE `app.js`.
 *     Nënshkrimi llogaritet mbi bajtët e saktë; një trup i analizuar dhe i
 *     rishkruar nuk përputhet më kurrë.
 *
 * ⚠️  PËRGJIGJET 200 EDHE PËR NJOFTIME QË NUK I NJOHIM.
 *     Stripe e përsërit çdo njoftim që nuk merr 200, me ndërprerje në rritje,
 *     për tri ditë. Një `404` për një lloj që nuk na intereson do të krijonte
 *     një radhë gabimesh te paneli i klientes dhe do ta fshihte ndër to
 *     njoftimin që vërtet dështoi.
 *
 *     E kundërta vlen për dështimet tona: aty përgjigjemi me 500 ME QËLLIM, që
 *     Stripe ta riprovojë. Një rinovim i humbur sepse databaza ishte poshtë
 *     për dhjetë sekonda do të thoshte dikush që paguan dhe nuk ka akses.
 */

/* Njoftimet që ndryshojnë aksesin. Të tjerat vetëm pranohen. */
const SUBSCRIPTION_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.trial_will_end",
]);

/**
 * A është zbatuar tashmë kjo ngjarje?
 *
 * `INSERT IGNORE` dhe numri i rreshtave të prekur: `0` do të thotë se çelësi
 * primar e ndaloi — pra njoftimi ka ardhur më parë. Kontrolli dhe shënimi janë
 * një veprim i vetëm, ndaj dy kopje të së njëjtës kërkesë në të njëjtin çast
 * nuk kalojnë të dyja.
 */
async function claimEvent(id, type) {
  const result = await query(
    `INSERT IGNORE INTO stripe_events (id, type) VALUES (?, ?)`,
    [id, type]
  );
  return (result?.affectedRows ?? 0) > 0;
}

/** Heq shënimin, që një dështim i mesit të mos e bllokojë riprovën e Stripe-it. */
async function releaseEvent(id) {
  await query(`DELETE FROM stripe_events WHERE id = ?`, [id]).catch(() => {});
}

/**
 * Lidh klientin e Stripe-it me llogarinë, nëse ende nuk është lidhur.
 *
 * Normalisht e bën rruga `/checkout` para se të dërgojë njeriun te Stripe. Kjo
 * është rrjeta e dytë, për abonimet e hapura me dorë nga paneli i Stripe-it:
 * pa lidhje, çdo njoftim i mëvonshëm për atë klient do të binte në boshllëk.
 */
async function linkCustomer(userId, customerId) {
  if (!userId || !customerId) return;
  await query(
    `UPDATE users SET stripe_customer_id = ?
      WHERE id = ? AND (stripe_customer_id IS NULL OR stripe_customer_id = '')`,
    [customerId, userId]
  );
}

/**
 * Prova mbaron pas dy ditësh — njoftimi që premton paywall-i.
 *
 * ⚠️  HAPI I DYTË I TIMELINE-IT ËSHTË PREMTIM, JO ZBUKURIM. Ekrani i shkruan
 *     njeriut "Të kujtojmë — njoftim në pajisje që prova po mbaron" para se ai
 *     të japë kartën. Pa këtë rresht, ai premtim nuk mbahej nga askush: Stripe
 *     e dërgon `trial_will_end` tri ditë para faturimit, dhe ne thjesht e
 *     hidhnim poshtë.
 *
 * ⚠️  DËSHTIMI NUK E RRËZON NJOFTIMIN. Një përdorues pa pajisje të regjistruar
 *     — ose Web Push i pakonfiguruar — nuk duhet ta bëjë webhook-un të kthejë
 *     500, sepse atëherë Stripe do ta riprovonte tri ditë me radhë dhe gjendja
 *     e abonimit do të mbetej e pashkruar.
 *
 * ⚠️  KOHA E TIJ NUK ËSHTË DITA E DYTË, DHE TEKSTI E MBAN PARASYSH.
 *
 *     Stripe e dërgon `trial_will_end` tri ditë para fundit të provës. Prova
 *     jonë zgjat pikërisht tri ditë, ndaj njoftimi niset në çastin që abonimi
 *     krijohet — jo ditën e dytë, siç e vizaton timeline-i i paywall-it.
 *
 *     Prandaj mesazhi NUK thotë "po mbaron": do të ishte i rremë ditën e parë.
 *     Thotë datën e saktë kur nis faturimi, e cila është e vërtetë sido që të
 *     mbërrijë. Një kujtesë e vërtetë ditën e dytë do të dilte nga puna jonë e
 *     përditshme e njoftimeve, jo nga ky webhook.
 */
async function remindTrialEnds(subscription) {
  const userId = subscription?.metadata?.user_id;
  if (!userId) return;

  const push = optional("../push");
  if (!push?.configured?.()) return;

  const ends = stripe.trialEnd(subscription);
  const dita = ends
    ? ends.toLocaleDateString("sq-AL", { day: "numeric", month: "long" })
    : null;

  await push
    .sendToUser(userId, {
      title: "Prova jote falas ka nisur",
      body: dita
        ? `Abonimi nis më ${dita}. Anuloje kurdo te Profili — nuk tarifohesh.`
        : "Anuloje kurdo te Profili para fundit të provës — nuk tarifohesh.",
      url: "/profili",
    })
    .catch((err) => console.warn(`[artegogo] kujtesa e provës nuk u dërgua: ${err?.message}`));
}

/** Ngarkim tolerant — i njëjti rregull si te `app.js`. */
function optional(path) {
  try {
    return require(path);
  } catch {
    return null;
  }
}

/**
 * Pagesa dështoi — regjistrohet, por aksesi nuk preket.
 *
 * Stripe e kalon abonimin te `past_due` dhe riprovon; aksesi bie vetëm kur ai
 * hiqet dorë dhe dërgon `customer.subscription.updated` me gjendjen e re. Pra
 * këtu shkruhet vetëm gjurma, që klientja ta shohë te historiku pse dikush u
 * ankua se "nuk më hyn më".
 */
async function noteFailedPayment(invoice, eventId) {
  const customer =
    typeof invoice?.customer === "string" ? invoice.customer : invoice?.customer?.id;
  if (!customer) return;

  const connection = await pool.getConnection();
  try {
    const [[user]] = await connection.query(
      `SELECT id FROM users WHERE stripe_customer_id = ?`,
      [customer]
    );
    if (!user) return;

    await record(connection, user.id, "payment_failed", {
      store: "stripe",
      price: Number.isFinite(Number(invoice?.amount_due))
        ? Number(invoice.amount_due) / 100
        : null,
      transactionId: eventId ?? null,
      source: "stripe_webhook",
      note: `tentativa ${invoice?.attempt_count ?? "?"}`,
    });
  } finally {
    connection.release();
  }
}

router.post("/", async (req, res) => {
  let event;
  try {
    event = stripe.constructEvent(req.body, req.get("stripe-signature"));
  } catch (err) {
    /* 400, jo 500: nuk ka kuptim ta riprovojë — nënshkrimi nuk do të bëhet i
       vlefshëm me kalimin e kohës. Shkaku shkruhet te log-u, jo te përgjigjja. */
    console.warn(`[artegogo] webhook i refuzuar: ${err?.code ?? err?.message}`);
    return res.status(400).json({ error: "Nënshkrimi nuk u pranua." });
  }

  let claimed = false;
  try {
    claimed = await claimEvent(event.id, event.type);
    if (!claimed) return res.json({ received: true, duplicate: true });

    const object = event.data?.object ?? {};

    if (SUBSCRIPTION_EVENTS.has(event.type)) {
      await applySubscription(object, { eventId: event.id });
      if (event.type === "customer.subscription.trial_will_end") {
        await remindTrialEnds(object);
      }
    } else if (event.type === "checkout.session.completed") {
      /*
       * Seanca e pagesës mbaroi. Abonimi vjen si identifikues, ndaj lexohet i
       * plotë: vetëm objekti i plotë i abonimit mban gjendjen, datat dhe
       * planin — seanca mban vetëm lidhjet.
       */
      await linkCustomer(
        object?.metadata?.user_id,
        typeof object?.customer === "string" ? object.customer : object?.customer?.id
      );

      const subId =
        typeof object?.subscription === "string"
          ? object.subscription
          : object?.subscription?.id;

      if (subId) {
        const subscription = await stripe.subscriptions.retrieve(subId);
        await applySubscription(subscription, { eventId: event.id });
      }
    } else if (event.type === "invoice.payment_failed") {
      await noteFailedPayment(object, event.id);
    }

    return res.json({ received: true });
  } catch (err) {
    /* Shënimi hiqet që riprova e Stripe-it të mos e gjejë ngjarjen "të kryer". */
    if (claimed) await releaseEvent(event.id);
    console.error(`[artegogo] webhook ${event?.type} dështoi:`, err?.message);
    return res.status(500).json({ error: "Njoftimi nuk u zbatua." });
  }
});

module.exports = router;
