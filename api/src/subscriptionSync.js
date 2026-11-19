const { pool } = require("./db");
const stripe = require("./stripe");

/**
 * ═══════════════════════════════════════════════════════════════
 *  PËRKTHIMI: abonimi i Stripe-it → rreshti i përdoruesit
 * ═══════════════════════════════════════════════════════════════
 *
 * ⚠️  KY SKEDAR ËSHTË I VETMI VEND QË SHKRUAN AKSESIN NGA STRIPE.
 *
 *     Webhook-u dhe kthimi i shfletuesit pas pagesës e thërrasin të njëjtin
 *     funksion me të njëjtin objekt. Po ta kishte secili përkthimin e vet, të
 *     dy do të devijonin — dhe devijimi do të dukej vetëm te njerëz që kanë
 *     paguar vërtet.
 *
 * ⚠️  GJENDJA MERRET NGA STRIPE, KURRË NUK LLOGARITET KËTU.
 *
 *     Deri tani `subscription_end_at` e shkruante serveri ynë me `NOW() +
 *     N ditë`. Me Stripe-in kjo do të ishte gabim: Stripe e di saktësisht kur
 *     mbaron periudha e paguar — me ditë mbetjeje nga ndryshimi i planit, me
 *     kupona, me rimbursime, me zonën kohore të faturimit. Ne e kopjojmë atë
 *     datë, nuk e rillogarisim.
 */

/**
 * Gjendjet e Stripe-it që japin akses.
 *
 * ⚠️  `past_due` HYN KËTU. Do të thotë se pagesa dështoi dhe Stripe po e
 *     riprovon (katër herë, brenda rreth dy javësh). Prerja e aksesit në ditën
 *     e parë do t'i mbyllte derën dikujt që thjesht ka ndërruar kartën — dhe
 *     shumica e atyre pagesave kalojnë te prova e dytë. Kur riprovat mbarojnë,
 *     Stripe e kalon te `canceled` ose `unpaid`, dhe aksesi bie atëherë.
 */
const PREMIUM_STATES = new Set(["trialing", "active", "past_due"]);

/* Çmimet te Stripe — vendosen te variablat e mjedisit, shih `stripe.js`. */
const PRICE_YEAR = () => (process.env.STRIPE_PRICE_YEAR || "").trim();
const PRICE_MONTH = () => (process.env.STRIPE_PRICE_MONTH || "").trim();

/**
 * Cili plan është ky abonim.
 *
 * Fillimisht nga `price_…`, sepse ai është marrëveshja e saktë. Nëse çmimet te
 * mjedisi mungojnë ose janë ndërruar, bie te cikli i faturimit — një abonim me
 * `interval: "year"` është vjetor, pavarësisht se cili `price` e mban.
 */
function planOf(subscription) {
  const id = stripe.priceId(subscription);
  if (id && id === PRICE_YEAR()) return "yearly";
  if (id && id === PRICE_MONTH()) return "monthly";

  const interval = subscription?.items?.data?.[0]?.price?.recurring?.interval;
  if (interval === "year") return "yearly";
  if (interval === "month") return "monthly";
  return null;
}

/**
 * Çmimi i paguar vërtet, në euro.
 *
 * Merret nga vetë abonimi, jo nga një tabelë te kodi: nëse klientja ndryshon
 * çmimin te Stripe, historiku ynë duhet të tregojë atë që u tarifua, jo atë që
 * dikur shkruanim ne.
 */
function priceEurOf(subscription) {
  const price = subscription?.items?.data?.[0]?.price;
  if (!price || price.currency !== "eur") return null;
  const amount = Number(price.unit_amount);
  return Number.isFinite(amount) ? amount / 100 : null;
}

/** `DATETIME` i MySQL-it nga një `Date`; `null` mbetet `null`. */
const sql = (date) =>
  date instanceof Date && !Number.isNaN(date.getTime())
    ? date.toISOString().slice(0, 19).replace("T", " ")
    : null;

/**
 * Gjendja jonë nga ajo e Stripe-it.
 *
 * ⚠️  `cancelled` NUK do të thotë "pa akses". Do të thotë "nuk rinovohet më".
 *     Aksesi varet nga `is_premium` dhe `subscription_end_at` — shih
 *     `hasPremium` te `auth.js`. Pikërisht këtë kërkoi klientja: kush anulon
 *     abonimin vjetor e mban deri në fund të vitit të paguar.
 */
function statusOf(subscription) {
  const state = subscription?.status;
  if (!PREMIUM_STATES.has(state)) return "expired";
  if (subscription?.cancel_at_period_end) return "cancelled";
  return state === "trialing" ? "trial" : "active";
}

/**
 * Çfarë ndodhi, duke krahasuar rreshtin para dhe pas.
 *
 * Historiku duhet të tregojë ngjarje, jo gjendje: "u anulua" ka kuptim, ndërsa
 * një rresht i ri për çdo njoftim të Stripe-it (disa për çdo rinovim) do ta
 * mbyste listën dhe do ta bënte të palexueshme pikërisht kur duhet më shumë —
 * te një mosmarrëveshje faturimi.
 *
 * @returns {string|null} `null` kur asgjë e rëndësishme nuk ndryshoi
 */
function eventFor(before, after) {
  const beforePremium = Boolean(before.is_premium);

  if (!beforePremium && after.premium) return after.status === "trial" ? "trial_started" : "verified";
  if (beforePremium && !after.premium) return "expired";
  if (!Boolean(before.cancel_at_period_end) && after.cancelAtEnd) return "cancelled";
  if (Boolean(before.cancel_at_period_end) && !after.cancelAtEnd) return "resumed";

  /* Rinovim: periudha u shty përpara pa ndryshuar asgjë tjetër. */
  const was = before.subscription_end_at ? new Date(before.subscription_end_at).getTime() : 0;
  const is = after.endAt ? after.endAt.getTime() : 0;
  if (is > was) return "renewed";

  return null;
}

/**
 * Regjistron një ngjarje abonimi.
 *
 * I përbashkët me `routes/subscription.js`: dy kopje të këtij `INSERT`-i do të
 * devijonin sapo tabela të marrë një kolonë të re, dhe njëra rrugë do të
 * pushonte së shkruari historik pa asnjë gabim.
 */
async function record(connection, userId, event, extra = {}) {
  await connection.query(
    `INSERT INTO subscription_events
       (user_id, event, store, plan, price_eur, transaction_id, source, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      event,
      extra.store ?? "none",
      extra.plan ?? null,
      extra.price ?? null,
      extra.transactionId ?? null,
      extra.source ?? "app",
      extra.note ?? null,
    ]
  );
}

/**
 * Gjen përdoruesin të cilit i përket ky abonim.
 *
 * ⚠️  DY RRUGË, ME RADHË TË QËLLIMSHME. `metadata.user_id` e vendosim vetë kur
 *     hapet seanca e pagesës dhe është e pagabueshme. `stripe_customer_id`
 *     është rrjeta e dytë: nëse metadata humbet — p.sh. abonimi krijohet me
 *     dorë nga paneli i Stripe-it — klienti e mban ende lidhjen.
 *
 *     Pa asnjërën, njoftimi hidhet poshtë në heshtje. Kjo është e saktë: një
 *     abonim pa përdorues nuk duhet t'i japë akses askujt.
 */
async function findUser(connection, subscription) {
  const fromMeta = subscription?.metadata?.user_id;
  if (fromMeta) {
    const [[user]] = await connection.query(
      `SELECT id, is_premium, subscription_status, subscription_end_at,
              cancel_at_period_end, trial_used_at, cancelled_at
         FROM users WHERE id = ? FOR UPDATE`,
      [fromMeta]
    );
    if (user) return user;
  }

  const customer =
    typeof subscription?.customer === "string"
      ? subscription.customer
      : subscription?.customer?.id;
  if (!customer) return null;

  const [[user]] = await connection.query(
    `SELECT id, is_premium, subscription_status, subscription_end_at,
            cancel_at_period_end, trial_used_at, cancelled_at
       FROM users WHERE stripe_customer_id = ? FOR UPDATE`,
    [customer]
  );
  return user ?? null;
}

/**
 * Shkruan gjendjen e një abonimi Stripe te rreshti i përdoruesit.
 *
 * ⚠️  `subscription_start_at` SHKRUHET GJITHMONË, pa `COALESCE`. Ajo fushë do
 *     të thotë "kur nisi abonimi që po shihet", jo "kur pagoi i pari herë".
 *     Po ta ruanim të vjetrën, dikush që mori dhuratën e dhjetorit dhe
 *     abonohet në shkurt do të shihte te profili datat e dhjetorit, dhe
 *     timeline-i i provës do të dilte i kaluar para se të niste. Stripe nuk e
 *     lëviz `start_date` me rinovimet, ndaj kjo mbetet e qëndrueshme.
 *
 * @param {object} subscription objekti `subscription` i Stripe-it
 * @param {{ source?: string, eventId?: string|null }} options
 * @returns {Promise<{ applied: boolean, userId?: string, event?: string|null, reason?: string }>}
 */
async function applySubscription(subscription, options = {}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const user = await findUser(connection, subscription);
    if (!user) {
      await connection.rollback();
      return { applied: false, reason: "user_not_found" };
    }

    const plan = planOf(subscription);
    const endAt = stripe.periodEnd(subscription);
    const trialEnd = stripe.trialEnd(subscription);
    const status = statusOf(subscription);
    const premium = PREMIUM_STATES.has(subscription?.status);
    const cancelAtEnd = Boolean(subscription?.cancel_at_period_end);

    const after = { status, premium, cancelAtEnd, endAt };
    const event = eventFor(user, after);

    /*
     * `cancelled_at` mban ÇASTIN e vendimit, jo gjendjen.
     *
     * Prandaj nuk rishkruhet kur ekziston: një njoftim i dytë për të njëjtin
     * anulim do ta zhvendoste datën përpara, dhe "kur e anulova unë?" — pyetja
     * e vetme që ka rëndësi te një ankesë — do të merrte përgjigje të gabuar.
     */
    const cancelledAt = cancelAtEnd ? (user.cancelled_at ?? new Date()) : null;

    /*
     * `trial_used_at` shënohet sapo Stripe hap një provë.
     *
     * Pa të, mjaftonte të anuloje brenda tri ditëve dhe të nisje një abonim të
     * ri për të marrë tri ditë të tjera falas — pa fund, me të njëjtën llogari.
     */
    const trialUsedAt =
      user.trial_used_at ?? (subscription?.status === "trialing" || trialEnd ? new Date() : null);

    await connection.query(
      `UPDATE users
          SET is_premium             = ?,
              subscription_status    = ?,
              subscription_plan      = COALESCE(?, subscription_plan),
              subscription_price_eur = COALESCE(?, subscription_price_eur),
              /* Pa COALESCE — shih shënimin mbi funksionin. */
              subscription_start_at  = ?,
              subscription_end_at    = ?,
              stripe_subscription_id = ?,
              cancel_at_period_end   = ?,
              cancelled_at           = ?,
              trial_used_at          = ?
        WHERE id = ?`,
      [
        premium ? 1 : 0,
        status,
        plan,
        priceEurOf(subscription),
        sql(subscription?.start_date ? new Date(subscription.start_date * 1000) : new Date()),
        sql(endAt),
        subscription?.id ?? null,
        cancelAtEnd ? 1 : 0,
        sql(cancelledAt),
        sql(trialUsedAt),
        user.id,
      ]
    );

    if (event) {
      await record(connection, user.id, event, {
        store: "stripe",
        plan,
        price: priceEurOf(subscription),
        transactionId: options.eventId ?? null,
        source: options.source ?? "stripe_webhook",
        note: `stripe:${subscription?.status ?? "?"}`,
      });
    }

    await connection.commit();
    return { applied: true, userId: user.id, event };
  } catch (err) {
    await connection.rollback().catch(() => {});
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  PREMIUM_STATES,
  applySubscription,
  planOf,
  priceEurOf,
  statusOf,
  record,
};
