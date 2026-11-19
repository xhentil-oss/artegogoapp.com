const express = require("express");
const crypto = require("crypto");
const { pool, query, one } = require("../db");
const { requireAuth, hasPremium } = require("../auth");
const { verifyReceipt, RESULT } = require("../storeVerify");
const stripe = require("../stripe");
const { applySubscription, record } = require("../subscriptionSync");

const router = express.Router();
router.use(requireAuth);

/**
 * ═══════════════════════════════════════════════════════════════
 *  ABONIMI (seksioni 8)
 * ═══════════════════════════════════════════════════════════════
 *
 * ⚠️  ASNJË RRUGË KËTU NUK E PRANON `is_premium` NGA KLIENTI.
 *
 *     Aksesi jepet vetëm nga dy vende: prova 3-ditore, që e jep vetë serveri
 *     dhe e llogarit me orën e vet, dhe një faturë e verifikuar te dyqani.
 *     `PUT /auth/me` e refuzon fushën me qëllim — dhe po ashtu edhe këto.
 *
 *     Kjo është arsyeja pse gjendja lexohet gjithmonë nga databaza e jo nga
 *     `localStorage`: te pajisja, çdo vlerë mund të ndryshohet nga DevTools.
 */

/** 3 ditë provë falas — i njëjti numër si te `domain/subscription.js`. */
const TRIAL_DAYS = 3;

/* ═══════════════ GJURMA E PROVËS ═══════════════ */

/**
 * ⚠️  `trial_used_at` E RUAN LLOGARINË, JO NJERIUN.
 *
 *     Një llogari e re nuk e ka atë shenjë — ndaj deri tani tri ditët falas
 *     merreshin sa herë të doje, mjaftonte një adresë tjetër. Kjo ishte vrima
 *     që klientja kërkoi të mbyllet (17 nëntor 2026).
 *
 *     Shenja duhet të rrijë mbi diçka që nuk krijohet falas. Sot kemi
 *     identifikuesin e pajisjes; kur të vendoset shërbimi i pagesave, do të
 *     kemi edhe gjurmën e kartës — dhe kodi poshtë nuk ndryshon për të, sepse
 *     të dyja kalojnë nga `claimTrial` me një `kind` tjetër.
 *
 * ⚠️  RUHET VETËM HASH-I, kurrë vlera burimore.
 *
 *     Një kopje e databazës nuk duhet të japë listën e pajisjeve të njerëzve.
 *     "Piper"-i e bën hash-in të pakrahasueshëm me ndonjë tabelë të jashtme:
 *     pa çelësin e serverit, i njëjti identifikues jep hash tjetër.
 */
const PEPPER = () => process.env.TRIAL_PEPPER || process.env.JWT_SECRET || "";

const gjurma = (value) =>
  crypto.createHash("sha256").update(`${PEPPER()}:${value}`).digest("hex");

/**
 * A e ka marrë tashmë provën kjo gjurmë — dhe nëse jo, e shënon.
 *
 * Thirret BRENDA transaksionit të provës, që shënimi dhe dhënia të jenë një
 * veprim i vetëm: ose të dyja, ose asnjëra.
 *
 * @returns {Promise<boolean>} `true` kur gjurma është e lirë dhe u shënua
 */
async function claimTrial(connection, kind, value, userId) {
  if (!value) return true; /* pa gjurmë nuk kemi çfarë të kontrollojmë */

  const hash = gjurma(String(value).slice(0, 200));

  const [[gjetur]] = await connection.query(
    `SELECT user_id FROM trial_claims WHERE kind = ? AND fingerprint = ?`,
    [kind, hash]
  );

  /* E njëjta llogari që rikërkon — nuk është abuzim, është përsëritje. */
  if (gjetur && gjetur.user_id !== userId) return false;
  if (gjetur) return true;

  /*
   * `IGNORE` sepse çelësi unik është gjykatësi i fundit: dy kërkesa në të
   * njëjtin çast e lexojnë të dyja si të lirë, dhe vetëm njëra e shkruan dot.
   */
  await connection.query(
    `INSERT IGNORE INTO trial_claims (kind, fingerprint, user_id) VALUES (?, ?, ?)`,
    [kind, hash, userId]
  );
  return true;
}

const PLANS = {
  month: { db: "monthly", days: 30, price: 24 },
  year: { db: "yearly", days: 365, price: 228 },
};

/** Emrat e planeve siç i njeh aplikacioni — e kundërta e `PLANS`. */
const PLAN_ID = { monthly: "month", yearly: "year", lifetime: "lifetime" };

const FIELDS = `is_premium, subscription_status, subscription_plan, subscription_price_eur,
                subscription_start_at, subscription_end_at, trial_used_at, cancelled_at,
                stripe_customer_id, stripe_subscription_id, cancel_at_period_end`;

/** Gjendja e abonimit, në formën që pret aplikacioni. */
function shape(user) {
  const active = hasPremium(user);
  return {
    isPremium: active,
    status: active ? user.subscription_status : "expired",
    planId: PLAN_ID[user.subscription_plan] ?? null,
    priceEur: user.subscription_price_eur ? Number(user.subscription_price_eur) : null,
    startedAt: user.subscription_start_at,
    endsAt: user.subscription_end_at,
    cancelled: Boolean(user.cancelled_at),
    cancelledAt: user.cancelled_at,
    trialUsed: Boolean(user.trial_used_at),

    /*
     * ⚠️  `cancelled` dhe `renewsAtEnd` NUK janë e njëjta gjë, dhe ekrani i
     *     duhen të dyja. E para thotë "u shtyp anulimi", e dyta "karta do të
     *     tarifohet sërish". Ndahen kur anulimi bëhet jashtë aplikacionit, ose
     *     kur një pagesë e dështuar e mbyll abonimin pa e prekur askush.
     */
    renewsAtEnd: !Boolean(user.cancel_at_period_end),

    /* Kush e mban faturimin — ekrani i anulimit ndryshon sipas tij. */
    provider: user.stripe_subscription_id ? "stripe" : null,

    /*
     * ⚠️  A PUNOJNË PAGESAT SOT? Teksti i paywall-it varet nga kjo.
     *
     *     Gjatë javëve derisa kompania jashtë Shqipërisë të regjistrohet dhe
     *     çelësat e Stripe-it të vijnë, prova jepet ende pa kartë. Po ta
     *     shkruante ekrani gjithsesi "Karta regjistrohet tani", do të ishte
     *     premtim i rremë — dhe pikërisht te fjalia që ligji e kërkon të jetë
     *     e saktë. Flaget e serverit, jo ekrani: vetëm ai e di nëse çelësi
     *     ekziston.
     */
    paymentsReady: stripe.configured(),
  };
}

/*
 * `record` jeton te `../subscriptionSync`.
 *
 * ⚠️  Ishte i shkruar dy herë — një herë këtu, një herë te rruga e Stripe-it.
 *     Dy kopje të të njëjtit `INSERT` devijojnë sapo tabela merr një kolonë,
 *     dhe njëra rrugë pushon së shkruari historik pa asnjë gabim të dukshëm.
 */

const readUser = (userId) => one(`SELECT id, ${FIELDS} FROM users WHERE id = ?`, [userId]);

/* ═══════════════ LEXIMI ═══════════════ */

router.get("/", async (req, res, next) => {
  try {
    res.json(shape(await readUser(req.userId)));
  } catch (err) {
    next(err);
  }
});

/** Historiku — për profilin dhe për çdo mosmarrëveshje faturimi. */
router.get("/events", async (req, res, next) => {
  try {
    res.json(
      await query(
        `SELECT event, store, plan, price_eur, source, note, created_at
           FROM subscription_events WHERE user_id = ?
          ORDER BY created_at DESC LIMIT 50`,
        [req.userId]
      )
    );
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ PROVA FALAS ═══════════════ */

/**
 * Nis provën 3-ditore.
 *
 * Datat llogariten KËTU. Një `endsAt` i dërguar nga klienti do të thoshte
 * provë e përjetshme me një kërkesë të vetme.
 */
router.post("/trial", async (req, res, next) => {
  const planId = String(req.body?.planId ?? "year");
  const plan = PLANS[planId];
  if (!plan) return res.status(400).json({ error: "Plan i panjohur." });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    /*
     * `FOR UPDATE` mbyll rreshtin derisa transaksioni të mbarojë.
     *
     * ⚠️  Pa të, dy kërkesa të njëkohshme do ta lexonin të dyja
     *     `trial_used_at` si bosh dhe do ta jepnin provën dy herë — mjaft për
     *     ta rinisur atë pa fund duke shtypur shpejt dy herë.
     */
    const [[user]] = await connection.query(
      `SELECT id, ${FIELDS} FROM users WHERE id = ? FOR UPDATE`,
      [req.userId]
    );

    if (user.trial_used_at) {
      await connection.rollback();
      return res.status(409).json({ error: "Prova falas është përdorur tashmë.", ...shape(user) });
    }

    /*
     * Pajisja, jo vetëm llogaria.
     *
     * ⚠️  Kontrollohet PASI `trial_used_at` del bosh, dhe brenda të njëjtit
     *     transaksion: kështu gjurma shënohet vetëm kur prova jepet vërtet. Një
     *     shënim i bërë më herët do të digjte pajisjen edhe kur dhënia dështon.
     */
    const eLire = await claimTrial(connection, "device", req.body?.deviceId, req.userId);
    if (!eLire) {
      await connection.rollback();
      return res.status(409).json({
        error:
          "Prova falas është përdorur tashmë te kjo pajisje. " +
          "Hyr me llogarinë e parë, ose zgjidh një abonim për të vazhduar.",
        code: "trial_device_used",
        ...shape(user),
      });
    }

    await connection.query(
      `UPDATE users
          SET is_premium = 1,
              subscription_status = 'trial',
              subscription_plan = ?,
              subscription_price_eur = ?,
              subscription_start_at = NOW(),
              subscription_end_at = DATE_ADD(NOW(), INTERVAL ? DAY),
              trial_used_at = NOW(),
              cancelled_at = NULL
        WHERE id = ?`,
      [plan.db, plan.price, TRIAL_DAYS, req.userId]
    );
    await record(connection, req.userId, "trial_started", { plan: plan.db, price: plan.price });
    await connection.commit();

    res.status(201).json(shape(await readUser(req.userId)));
  } catch (err) {
    await connection.rollback().catch(() => {});
    next(err);
  } finally {
    connection.release();
  }
});

/* ═══════════════ MUAJI FALAS ME KOD ═══════════════ */

/**
 * Fushata e vetme e dhjetorit 2026.
 *
 * ⚠️  DATAT JETOJNË KËTU, te serveri, jo te aplikacioni.
 *     Aplikacioni i ka të vetat vetëm për të vendosur nëse e SHFAQ kutinë e
 *     kodit (`src/domain/subscription.js`). Kush e ndryshon orën e telefonit
 *     nuk fiton asgjë: kodi kalon ose bie këtu.
 *
 * ⚠️  Aksesi mbaron për të gjithë më 5 janar 2027, pavarësisht ditës që
 *     shlyhet kodi — "një muaj falas, 5 dhjetor – 5 janar", siç u kërkua.
 *     Nëse ndonjëherë duhet 30 ditë nga shlyerja, ndryshon vetëm `fundi()`.
 */
const PROMO = {
  campaign: "dhjetor2026",
  from: new Date("2026-12-05T00:00:00+01:00"),
  until: new Date("2027-01-05T23:59:59+01:00"),
};

/** Deri kur vlen dhurata për dikë që e shlyen tani. */
const fundi = () => PROMO.until;

/**
 * Shlyen një kod dhe hap muajin falas.
 *
 * Tri kushte, dhe secili ka arsyen e vet:
 *   · kodi ekziston dhe nuk është përdorur   → "një kod, një herë"
 *   · llogaria nuk ka marrë kod tjetër       → 300 kode, jo 300 muaj për një njeri
 *   · jemi brenda dritares së fushatës       → dhuratë, jo derë e hapur përgjithmonë
 */
router.post("/promo", async (req, res, next) => {
  const code = String(req.body?.code ?? "").trim().toUpperCase();

  /* Forma kontrollohet para databazës: një varg i gjatë nuk ka pse ta prekë. */
  if (!/^[A-Z0-9]{8}$/.test(code)) {
    return res.status(400).json({ error: "Kodi ka 8 shenja, shkronja dhe numra." });
  }

  /*
   * ⚠️  ADMINI E PROVON EDHE JASHTË DRITARES.
   *
   *     Pa këtë, fushata nuk provohej dot derisa të vinte 5 dhjetori — pra do
   *     të zbulohej e prishur pikërisht ditën kur treqind njerëz presin ta
   *     përdorin. Vlen VETËM për llogari me `is_admin = 1` te databaza, dhe
   *     kodi shlyhet vërtet: prova e djeg një kod, si çdo shlyerje tjetër.
   */
  const now = new Date();
  if (!req.user?.is_admin) {
    if (now < PROMO.from) {
      return res.status(403).json({ error: "Oferta nis më 5 dhjetor. Provo sërish atëherë." });
    }
    if (now > PROMO.until) {
      return res.status(403).json({ error: "Oferta ka mbaruar më 5 janar 2027." });
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    /* `FOR UPDATE` e mbyll rreshtin: dy telefona me të njëjtin kod në të
       njëjtin çast nuk e marrin dot të dy. */
    const [[kodi]] = await connection.query(
      `SELECT code, used_at FROM promo_codes WHERE code = ? AND campaign = ? FOR UPDATE`,
      [code, PROMO.campaign]
    );

    if (!kodi) {
      await connection.rollback();
      return res.status(404).json({ error: "Ky kod nuk ekziston." });
    }
    if (kodi.used_at) {
      await connection.rollback();
      return res.status(409).json({ error: "Ky kod është përdorur tashmë." });
    }

    const [[tashme]] = await connection.query(
      `SELECT code FROM promo_codes WHERE used_by = ? AND campaign = ? LIMIT 1`,
      [req.userId, PROMO.campaign]
    );
    if (tashme) {
      await connection.rollback();
      return res.status(409).json({ error: "Kjo llogari e ka marrë tashmë muajin falas." });
    }

    const [[user]] = await connection.query(
      `SELECT id, ${FIELDS} FROM users WHERE id = ? FOR UPDATE`,
      [req.userId]
    );

    /*
     * ⚠️  Një abonim që shkon më larg se dhurata NUK shkurtohet.
     *
     *     Pa këtë, kush kishte paguar një vit do ta shkëmbente atë me një muaj
     *     — dhe kodi do të digjej për asgjë. Më mirë të mos pranohet fare.
     */
    if (hasPremium(user) && new Date(user.subscription_end_at) >= fundi()) {
      await connection.rollback();
      return res.status(409).json({
        error: "Ti ke tashmë akses përtej kësaj oferte. Kodi mbeti i papërdorur.",
      });
    }

    await connection.query(
      `UPDATE users
          SET is_premium = 1,
              subscription_status = 'promo',
              subscription_plan = 'monthly',
              subscription_price_eur = 0,
              subscription_start_at = NOW(),
              subscription_end_at = ?,
              cancelled_at = NULL
        WHERE id = ?`,
      [fundi(), req.userId]
    );

    await connection.query(
      `UPDATE promo_codes SET used_at = NOW(), used_by = ? WHERE code = ?`,
      [req.userId, code]
    );

    /* Kodi shkruhet te shënimi: pa të, një ankesë "nuk m'u aktivizua" nuk
       gjurmohet dot deri te rreshti që u shlye. */
    await record(connection, req.userId, "promo_redeemed", {
      plan: "monthly",
      price: 0,
      note: code,
    });

    await connection.commit();
    res.status(201).json(shape(await readUser(req.userId)));
  } catch (err) {
    await connection.rollback().catch(() => {});
    next(err);
  } finally {
    connection.release();
  }
});

/* ═══════════════ FATURA E DYQANIT ═══════════════ */

/**
 * Verifikon një blerje dhe, vetëm nëse kalon, jep aksesin.
 *
 * ⚠️  Pa kredencialet e Apple/Google, `verifyReceipt` kthen `not_configured`
 *     dhe kjo rrugë përgjigjet `501`. Nuk jepet asnjë ditë akses. Shih
 *     `src/storeVerify.js` për arsyen.
 */
router.post("/verify", async (req, res, next) => {
  const { store, receipt, planId } = req.body ?? {};
  const plan = PLANS[String(planId ?? "")];
  if (!plan) return res.status(400).json({ error: "Plan i panjohur." });

  try {
    const check = await verifyReceipt({ store, receipt });

    if (check.result === RESULT.NOT_CONFIGURED) {
      return res.status(501).json({
        error: "Verifikimi i pagesave nuk është konfiguruar ende te serveri.",
        code: "not_configured",
      });
    }
    if (check.result !== RESULT.OK) {
      return res.status(402).json({ error: "Fatura nuk u verifikua." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `UPDATE users
            SET is_premium = 1, subscription_status = 'active',
                subscription_plan = ?, subscription_price_eur = ?,
                subscription_start_at = COALESCE(subscription_start_at, NOW()),
                subscription_end_at = ?, cancelled_at = NULL
          WHERE id = ?`,
        [plan.db, plan.price, check.expiresAt, req.userId]
      );
      await record(connection, req.userId, "verified", {
        store,
        plan: plan.db,
        price: plan.price,
        transactionId: check.transactionId,
      });
      await connection.commit();
    } catch (err) {
      await connection.rollback().catch(() => {});
      connection.release();
      throw err;
    }
    connection.release();

    res.status(201).json(shape(await readUser(req.userId)));
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ STRIPE ═══════════════ */

/**
 * Çmimet te Stripe, sipas planit që njeh aplikacioni.
 *
 * ⚠️  NUK SHKRUHEN TE KODI. Një `price_…` i ngulitur do të thoshte se çdo
 *     ndryshim çmimi kërkon ringarkim serveri; këtu mjafton fusha te cPanel.
 *     Dhe gjatë provave, çelësi `sk_test_` shkon me çmime provash — po të
 *     ishin te kodi, provat do të preknin çmimet e vërteta.
 */
const PRICE_FOR = (planId) => {
  const raw = planId === "month" ? process.env.STRIPE_PRICE_MONTH : process.env.STRIPE_PRICE_YEAR;
  return String(raw ?? "").trim();
};

/** Origjina e aplikacionit — e para e listës `APP_ORIGIN`. */
const APP_URL = () =>
  (process.env.APP_ORIGIN || "").split(",")[0].trim() || "https://app.drartegogo.com";

/**
 * Klienti i Stripe-it për këtë llogari — krijohet një herë e ripërdoret.
 *
 * ⚠️  `idempotencyKey` i lidhur me id-në e përdoruesit. Dy kërkesa njëkohëse
 *     (dy skeda të hapura) do të krijonin dy klientë për të njëjtin njeri;
 *     i dyti do ta mbishkruante të parin te `users`, dhe abonimi i blerë me
 *     të parin do të bëhej i paarritshëm — pagesë që ekziston, akses që jo.
 *
 * ⚠️  ID-JA E RUAJTUR VERIFIKOHET PARA SE TË PËRDORET.
 *
 *     Një id klienti vlen vetëm brenda llogarisë që e krijoi. Kur çelësi
 *     ndërrohet — sandbox në vend të llogarisë kryesore, ose test në vend të
 *     live — klienti i ruajtur nuk ekziston më dhe çdo arkë e mëtejshme bie me
 *     "No such customer". Ndodhi më 19 nëntor 2026 gjatë vendosjes së parë.
 *
 *     Pa verifikim kjo nuk shërohet vetvetiu: id-ja e vdekur rri te `users`
 *     përgjithmonë dhe përdoruesi nuk blen dot kurrë më. Një kërkesë GET para
 *     arkës e zgjidh, dhe paguhet vetëm në çastin e blerjes.
 *
 *     Çelësi i idempotencës e mban brenda id-në e vjetër, që rikrijimi pas një
 *     pastrimi të mos kthejë sërish atë që sapo u hodh.
 */
async function customerAlive(id) {
  try {
    const customer = await stripe.customers.retrieve(id);
    /* Një klient i fshirë kthehet me status 200 dhe `deleted: true`. */
    return !customer?.deleted;
  } catch (err) {
    if (err instanceof stripe.StripeError && (err.code === "resource_missing" || err.status === 404)) {
      return false;
    }
    throw err;
  }
}

async function ensureCustomer(userId, user, profile) {
  const stored = user.stripe_customer_id;
  if (stored && (await customerAlive(stored))) return stored;

  if (stored) {
    await query(
      `UPDATE users SET stripe_customer_id = NULL, stripe_subscription_id = NULL WHERE id = ?`,
      [userId]
    );
  }

  const customer = await stripe.customers.create(
    {
      email: profile?.email ?? undefined,
      name: profile?.name ?? undefined,
      metadata: { user_id: userId },
    },
    { idempotencyKey: stored ? `customer:${userId}:${stored}` : `customer:${userId}` }
  );

  await query(`UPDATE users SET stripe_customer_id = ? WHERE id = ?`, [customer.id, userId]);
  return customer.id;
}

/** Përgjigjja kur çelësat ende nuk janë vendosur — gjendje e ditur, jo defekt. */
const notConfigured = (res) =>
  res.status(501).json({
    error: "Pagesat nuk janë aktivizuar ende.",
    code: "not_configured",
  });

/**
 * Dështimet e Stripe-it, të dukshme.
 *
 * ⚠️  MESAZHI I STRIPE-IT KTHEHET I PLOTË, NDRYSHE NGA RREGULLI I SHTËPISË.
 *
 *     Trajtuesi i përgjithshëm te `app.js` i fsheh gabimet me qëllim: mesazhet
 *     e MySQL-së përmbajnë emra tabelash dhe kolonash, dhe ato i japin
 *     sulmuesit hartën e databazës. Për Stripe-in ai rregull nuk vlen, dhe
 *     kostoja e tij u pa menjëherë: një `price_…` i krijuar te Test mode
 *     ndërsa çelësi ishte `sk_live_` dilte te ekrani si "Gabim i brendshëm" —
 *     pra pikërisht gabimi më i zakonshëm i vendosjes nuk kishte asnjë shenjë
 *     se ku ishte.
 *
 *     Mesazhet e Stripe-it janë përshkruese dhe jo të fshehta ("No such
 *     price"), dhe vetë Stripe i mbulon çelësat brenda tyre. Shifrat e kartës
 *     nuk kalojnë kurrë nga këtu — shih `services/billing.purchase`.
 *
 *     Këto janë gabime konfigurimi; pasi vendosja të jetë e saktë, një
 *     përdorues i vërtetë nuk i sheh. Refuzimi i kartës nuk vjen deri këtu:
 *     atë e trajton vetë faqja e Stripe-it.
 */
function stripeFail(res, err, next) {
  if (!(err instanceof stripe.StripeError)) return next(err);
  if (err.code === "not_configured") return notConfigured(res);

  console.error(`[artegogo] Stripe ${err.code}: ${err.message}`);
  return res.status(502).json({ error: `Stripe: ${err.message}`, code: err.code });
}

/**
 * Hap seancën e pagesës.
 *
 * Rrjedha që kërkoi klientja: karta jepet që në fillim, tri ditët nisin
 * menjëherë, dhe tarifimi ndodh ditën e katërt vetëm nëse nuk është anuluar.
 *
 * ⚠️  PROVA JEPET VETËM NJË HERË. `trial_used_at` e mban shenjën përtej
 *     anulimit dhe përtej skadimit; pa të, anulim-rinisja do të jepte tri ditë
 *     falas pa fund te e njëjta llogari.
 *
 * ⚠️  AKSESI NUK HAPET KËTU. Kjo rrugë kthen vetëm një adresë. Gjendja
 *     ndryshon kur Stripe konfirmon — me webhook, ose me `/checkout/confirm`
 *     kur njeriu kthehet te faqja. Po ta hapnim aksesin te kjo rrugë, do të
 *     mjaftonte ta thirrje dhe ta mbyllje faqen për të fituar një vit falas.
 */
router.post("/checkout", async (req, res, next) => {
  try {
    if (!stripe.configured()) return notConfigured(res);

    const planId = req.body?.planId === "month" ? "month" : "year";
    const price = PRICE_FOR(planId);
    if (!price) return notConfigured(res);

    const user = await readUser(req.userId);
    if (hasPremium(user)) {
      return res.status(409).json({ error: "Kjo llogari ka tashmë një abonim aktiv." });
    }

    const customer = await ensureCustomer(req.userId, user, req.user);
    const trialDays = user.trial_used_at ? null : TRIAL_DAYS;

    const session = await stripe.checkout.createSession(
      {
        mode: "subscription",
        customer,
        client_reference_id: req.userId,
        line_items: [{ price, quantity: 1 }],
        locale: "auto",
        /* Karta kërkohet edhe kur shuma e parë është zero — kjo është e gjithë
           pika e provës me kartë. */
        payment_method_collection: "always",
        subscription_data: {
          metadata: { user_id: req.userId },
          ...(trialDays
            ? {
                trial_period_days: trialDays,
                /* Pa kartë në fund të provës, abonimi mbyllet — jo të mbetet
                   i hapur dhe i papaguar. */
                trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
              }
            : {}),
        },
        metadata: { user_id: req.userId },
        success_url: `${APP_URL()}/?pagesa=sukses&seanca={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL()}/?pagesa=anuluar`,
      },
      /*
       * Çelësi ndryshon çdo minutë, me qëllim.
       *
       * Brenda minutës, dy shtypje të butonit kthejnë TË NJËJTËN seancë — pra
       * një klikim i dyfishtë nuk hap dy abonime. Pas minutës, një përpjekje e
       * re e meriton një seancë të re: e para mund të ketë skaduar, ose njeriu
       * mund të ketë ndërruar planin.
       */
      { idempotencyKey: `checkout:${req.userId}:${planId}:${Math.floor(Date.now() / 60000)}` }
    );

    res.json({ url: session.url, sessionId: session.id, testMode: stripe.isTestMode() });
  } catch (err) {
    stripeFail(res, err, next);
  }
});

/**
 * Kthimi nga Stripe — zbatohet menjëherë, pa pritur webhook-un.
 *
 * ⚠️  NUK E ZËVENDËSON WEBHOOK-UN, E PLOTËSON. Webhook-u është burimi i
 *     vërtetë, sepse arrin edhe kur njeriu e mbyll skedën. Por ai mund të
 *     vonohet disa sekonda, dhe gjatë atyre sekondave ekrani do t'i thoshte
 *     "nuk ke abonim" dikujt që sapo pagoi. Kjo rrugë e mbyll atë boshllëk.
 *
 * ⚠️  SEANCA KONTROLLOHET SE KUJT I PËRKET. Pa atë kontroll, mjaftonte të
 *     merrje me mend — ose të kopjoje — një `cs_…` të dikujt tjetër për t'i
 *     marrë abonimin. Prandaj krahasohet `metadata.user_id`.
 */
router.post("/checkout/confirm", async (req, res, next) => {
  try {
    if (!stripe.configured()) return notConfigured(res);

    const sessionId = String(req.body?.sessionId ?? "").trim();
    if (!sessionId.startsWith("cs_")) {
      return res.status(400).json({ error: "Seanca e pagesës mungon." });
    }

    const session = await stripe.checkout.retrieveSession(sessionId);
    const owner = session?.metadata?.user_id ?? session?.client_reference_id;
    if (owner !== req.userId) {
      return res.status(403).json({ error: "Kjo pagesë nuk i përket kësaj llogarie." });
    }

    const subscription =
      session?.subscription && typeof session.subscription === "object"
        ? session.subscription
        : session?.subscription
          ? await stripe.subscriptions.retrieve(session.subscription)
          : null;

    if (!subscription) {
      /* Pagesa ende nuk ka mbaruar — nuk është gabim, është "prit pak". */
      return res.status(202).json({ pending: true, ...shape(await readUser(req.userId)) });
    }

    await applySubscription(subscription, { source: "app", eventId: null });
    res.json(shape(await readUser(req.userId)));
  } catch (err) {
    stripeFail(res, err, next);
  }
});

/**
 * Paneli i faturimit te Stripe — kartë e re, fatura, anulim.
 *
 * Anulimin e bën edhe `/cancel` brenda aplikacionit, siç kërkoi klientja. Ky
 * panel ekziston për atë që aplikacioni nuk e mbulon dot vetë: ndërrimin e
 * kartës së skaduar dhe shkarkimin e faturave, të cilat ligji i kërkon.
 */
router.post("/portal", async (req, res, next) => {
  try {
    if (!stripe.configured()) return notConfigured(res);

    const user = await readUser(req.userId);
    if (!user.stripe_customer_id) {
      return res.status(409).json({ error: "Kjo llogari nuk ka pagesa te Stripe." });
    }

    const session = await stripe.billingPortal.createSession({
      customer: user.stripe_customer_id,
      return_url: `${APP_URL()}/?pagesa=kthim`,
    });

    res.json({ url: session.url });
  } catch (err) {
    stripeFail(res, err, next);
  }
});

/* ═══════════════ ANULIMI DHE RIKTHIMI ═══════════════ */

/**
 * Anulon abonimin.
 *
 * ⚠️  Aksesi NUK pritet menjëherë: `subscription_end_at` mbetet siç është,
 *     sepse periudha është paguar. Kush anulon një abonim vjetor në muajin e
 *     dytë e mban deri në fund të vitit — kërkesë e shprehur e klientes, dhe
 *     e drejtë: ato ditë janë blerë.
 *
 * ⚠️  DY RRUGË TË NDRYSHME, SIPAS ASAJ QË MBAN FATURIMIN.
 *
 *     Te Stripe, anulimi është veprim i vërtetë: `cancel_at_period_end = true`
 *     e ndalon tarifimin e radhës. Pa të, databaza jonë do të shkruante
 *     'cancelled' ndërsa karta vazhdonte të paguante — dhe përdoruesi do të
 *     kishte të drejtë të plotë të ankohej.
 *
 *     Te App Store dhe Google Play anulimi bëhet vetëm nga Cilësimet e
 *     telefonit; atje mbetet rruga e vjetër, ku regjistrohet vullneti.
 */
router.post("/cancel", async (req, res, next) => {
  /*
   * Stripe-i trajtohet PARA transaksionit, jo brenda tij.
   *
   * Një thirrje rrjeti brenda një transaksioni e mban rreshtin të kyçur sa
   * zgjat ajo — dhe `FOR UPDATE` mbi `users` do të bllokonte çdo kërkesë
   * tjetër të atij njeriu derisa Stripe të përgjigjej.
   */
  try {
    const current = await readUser(req.userId);
    if (current?.stripe_subscription_id) {
      if (!hasPremium(current)) {
        return res.status(409).json({ error: "Nuk ka abonim aktiv." });
      }

      const updated = await stripe.subscriptions.update(current.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      await applySubscription(updated, { source: "app", eventId: null });
      return res.json(shape(await readUser(req.userId)));
    }
  } catch (err) {
    if (!(err instanceof stripe.StripeError)) return next(err);
    /* Stripe nuk u arrit ose abonimi nuk ekziston më atje. NUK shkruajmë
       'cancelled' lokalisht: do të ishte premtim që nuk e mban dot kush. */
    return res.status(err.status === 404 ? 409 : 502).json({
      error: "Anulimi nuk u konfirmua nga Stripe. Provo sërish për pak.",
      code: err.code,
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[user]] = await connection.query(
      `SELECT id, ${FIELDS} FROM users WHERE id = ? FOR UPDATE`,
      [req.userId]
    );

    if (!user.subscription_start_at) {
      await connection.rollback();
      return res.status(409).json({ error: "Nuk ka abonim aktiv." });
    }

    await connection.query(
      `UPDATE users SET subscription_status = 'cancelled', cancelled_at = NOW() WHERE id = ?`,
      [req.userId]
    );
    await record(connection, req.userId, "cancelled", { plan: user.subscription_plan });
    await connection.commit();

    res.json(shape(await readUser(req.userId)));
  } catch (err) {
    await connection.rollback().catch(() => {});
    next(err);
  } finally {
    connection.release();
  }
});

/**
 * Rikthen një abonim të anuluar, sa kohë periudha nuk ka mbaruar.
 *
 * Te Stripe kjo është thjesht e kundërta e anulimit — `cancel_at_period_end`
 * kthehet te `false` dhe tarifimi i radhës rikthehet. Pas fundit të periudhës
 * nuk ka çfarë të rikthehet: abonimi atje është mbyllur dhe duhet një i ri.
 */
router.post("/resume", async (req, res, next) => {
  try {
    const current = await readUser(req.userId);
    if (current?.stripe_subscription_id) {
      if (!hasPremium(current)) {
        return res.status(409).json({ error: "Periudha ka mbaruar. Duhet një abonim i ri." });
      }

      const updated = await stripe.subscriptions.update(current.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
      await applySubscription(updated, { source: "app", eventId: null });
      return res.json(shape(await readUser(req.userId)));
    }
  } catch (err) {
    if (!(err instanceof stripe.StripeError)) return next(err);
    return res.status(err.status === 404 ? 409 : 502).json({
      error: "Rikthimi nuk u konfirmua nga Stripe. Provo sërish për pak.",
      code: err.code,
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[user]] = await connection.query(
      `SELECT id, ${FIELDS} FROM users WHERE id = ? FOR UPDATE`,
      [req.userId]
    );

    if (!user.cancelled_at) {
      await connection.rollback();
      return res.status(409).json({ error: "Abonimi nuk është i anuluar." });
    }
    if (!hasPremium(user)) {
      await connection.rollback();
      return res.status(409).json({ error: "Periudha ka mbaruar. Duhet një abonim i ri." });
    }

    /* Kthimi te 'trial' nëse prova ende nuk ka mbaruar, ndryshe te 'active'. */
    const status = user.trial_used_at && user.subscription_status === "cancelled"
      ? (new Date(user.subscription_end_at) - new Date(user.subscription_start_at)) / 86400000 <= TRIAL_DAYS
        ? "trial"
        : "active"
      : "active";

    await connection.query(
      `UPDATE users SET subscription_status = ?, cancelled_at = NULL WHERE id = ?`,
      [status, req.userId]
    );
    await record(connection, req.userId, "resumed", { plan: user.subscription_plan });
    await connection.commit();

    res.json(shape(await readUser(req.userId)));
  } catch (err) {
    await connection.rollback().catch(() => {});
    next(err);
  } finally {
    connection.release();
  }
});

module.exports = router;
