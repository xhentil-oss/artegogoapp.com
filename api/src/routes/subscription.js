const express = require("express");
const { pool, query, one } = require("../db");
const { requireAuth, hasPremium } = require("../auth");
const { verifyReceipt, RESULT } = require("../storeVerify");

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

const PLANS = {
  month: { db: "monthly", days: 30, price: 9.99 },
  year: { db: "yearly", days: 365, price: 59.99 },
};

/** Emrat e planeve siç i njeh aplikacioni — e kundërta e `PLANS`. */
const PLAN_ID = { monthly: "month", yearly: "year", lifetime: "lifetime" };

const FIELDS = `is_premium, subscription_status, subscription_plan, subscription_price_eur,
                subscription_start_at, subscription_end_at, trial_used_at, cancelled_at`;

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
  };
}

/** Regjistron ndryshimin. Historiku është pjesë e veprimit, jo shtojcë. */
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

/* ═══════════════ ANULIMI DHE RIKTHIMI ═══════════════ */

/**
 * Shënon anulimin.
 *
 * ⚠️  Aksesi NUK pritet menjëherë: `subscription_end_at` mbetet siç është,
 *     sepse periudha është paguar. Prerja e menjëhershme do t'i merrte
 *     përdoruesit ditë që i ka blerë.
 *
 *     Anulimi i vërtetë ndodh te Cilësimet e telefonit — kjo është rregull e
 *     Apple/Google. Këtu regjistrohet vetëm vullneti, që aplikacioni të mos
 *     premtojë një rinovim që s'do të vijë.
 */
router.post("/cancel", async (req, res, next) => {
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

/** Rikthen një abonim të anuluar, sa kohë periudha nuk ka mbaruar. */
router.post("/resume", async (req, res, next) => {
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
