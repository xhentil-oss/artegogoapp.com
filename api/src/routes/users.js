const express = require("express");
const { query, one } = require("../db");
const { requireAuth, requireAdmin } = require("../auth");

/**
 * ═══════════════════════════════════════════════════════════════
 *  PËRDORUESIT — lista për panelin e admin-it
 * ═══════════════════════════════════════════════════════════════
 *
 * Deri tani e vetmja mënyrë për të parë kush është regjistruar ishte
 * phpMyAdmin. Kjo rrugë e sjell të njëjtën gjë brenda aplikacionit.
 *
 * ⚠️  `password_hash` NUK kthehet kurrë, dhe as nuk përmendet te `SELECT`.
 *
 *     Një hash bcrypt nuk zbulon fjalëkalimin, por e lejon sulmin me fjalor
 *     jashtë serverit: kush e merr, provon miliona fjalëkalime pa e prekur
 *     më aplikacionin. Prandaj nuk del as te admini — nuk i duhet për asgjë.
 *
 * ⚠️  Vetëm LEXIM. Asnjë rrugë këtu nuk ndryshon dhe nuk fshin llogari.
 *
 *     Fshirja e një përdoruesi tërheq pas vetes seancat, medaljet, krijimet
 *     dhe postimet e tij (`ON DELETE CASCADE`). Një buton i tillë te paneli,
 *     një prekje e gabuar në telefon, dhe humbet gjithçka pa kthim. Kur të
 *     duhet vërtet, bëhet me vetëdije te databaza.
 */

const admin = express.Router();
admin.use(requireAuth, requireAdmin);

/**
 * GET /admin/users?q=&limit=&offset=
 *
 * Aktiviteti vjen nga `streaks`, jo nga një numërim mbi `meditation_sessions`.
 * Ajo tabelë e mban totalin të gatshëm — të mbajtur nga triggers-at — ndaj
 * lista kushton një `LEFT JOIN` të vetëm, pavarësisht sa seanca ka secili.
 *
 * `LEFT`, jo `INNER`: kush s'ka medituar ende nuk ka fare rresht te `streaks`,
 * dhe pikërisht ata janë përdoruesit që admini do të shohë të parët.
 */
admin.get("/users", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "").trim();

    const where = [];
    const params = [];
    if (q) {
      where.push("(u.email LIKE ? OR u.name LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like);
    }
    const filter = where.length ? `WHERE ${where.join(" AND ")}` : "";

    /*
     * `LIMIT` dhe `OFFSET` shkruhen te teksti, jo si parametra — `execute` i
     * mysql2-shit nuk i lidh dot. Prandaj kthehen në numra dhe kapen mes
     * kufijve PARA se t'i afrohen SQL-së; asnjë varg nga kërkesa nuk kalon.
     */
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const items = await query(
      `SELECT u.id, u.email, u.name, u.is_admin, u.onboarding_completed,
              u.subscription_status, u.subscription_plan, u.subscription_end_at,
              u.created_at,
              COALESCE(s.total_sessions, 0) AS sessions,
              COALESCE(s.total_minutes, 0)  AS minutes,
              COALESCE(s.current_streak, 0) AS streak,
              COALESCE(s.best_streak, 0)    AS best_streak,
              s.last_meditation_date        AS last_active
         FROM users u
         LEFT JOIN streaks s ON s.user_id = u.id
         ${filter}
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const total = await one(`SELECT COUNT(*) AS n FROM users u ${filter}`, params);

    res.json({ items, total: total?.n ?? items.length, limit, offset });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/users/stats
 *
 * Numrat e kokës. Llogariten me një kërkesë të vetme mbi `users`: shtatë
 * `SELECT COUNT(*)` të veçantë do të skanonin të njëjtën tabelë shtatë herë.
 *
 * ⚠️  Abonimi matet me DATË, jo vetëm me statusin.
 *
 *     `subscription_status` mbetet 'active' derisa dikush ta ndryshojë; një
 *     abonim i skaduar dje do të numërohej ende aktiv. Kushti mbi
 *     `subscription_end_at` e mban numrin të vërtetë pa varur nga cron-i.
 */
admin.get("/users/stats", async (_req, res, next) => {
  try {
    const row = await one(
      `SELECT COUNT(*) AS total,
              SUM(onboarding_completed = 1) AS onboarded,
              SUM(subscription_status = 'trial'
                  AND subscription_end_at > NOW())        AS ne_prove,
              SUM(subscription_status IN ('active','cancelled')
                  AND subscription_end_at > NOW())        AS me_abonim,
              SUM(DATE(created_at) = CURDATE())           AS sot,
              SUM(created_at > DATE_SUB(NOW(), INTERVAL 7 DAY))  AS kete_jave,
              SUM(is_admin = 1)                           AS administrator
         FROM users`
    );

    /* `SUM()` mbi tabelë bosh kthen NULL, jo 0 — pa kjo, ekrani do të shkruante
       "null përdorues" ditën e parë. */
    const n = (v) => Number(v ?? 0);
    res.json({
      total: n(row?.total),
      onboarded: n(row?.onboarded),
      trial: n(row?.ne_prove),
      subscribed: n(row?.me_abonim),
      today: n(row?.sot),
      week: n(row?.kete_jave),
      admins: n(row?.administrator),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { adminRoutes: admin };
