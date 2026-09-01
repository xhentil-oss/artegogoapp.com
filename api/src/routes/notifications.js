const express = require("express");
const { query, one } = require("../db");
const { requireAuth, requireAdmin } = require("../auth");

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════
 *  NJOFTIMET DHE POOL-ET (seksioni 9)
 * ═══════════════════════════════════════════════════════════════
 *
 * Tre pool-e — mëngjes, drekë, darkë — dhe një meditim i zgjedhur për çdo ditë.
 *
 * ⚠️  PËRZGJEDHJA BËHET KËTU, JO TE APLIKACIONI.
 *
 *     Kërkesa e seksionit 9 është e prerë: njoftimi duhet të mbërrijë edhe kur
 *     aplikacioni është i mbyllur. Një përzgjedhje te klienti nuk mund ta bëjë
 *     atë — kodi nuk rrjedh fare kur aplikacioni nuk është hapur. Prandaj
 *     zgjedhja jeton te serveri, dhe i njëjti funksion e përdor si API-ja
 *     (kur përdoruesi hap ekranin) ashtu edhe cron-i (kur dërgon njoftimin).
 */

const SLOTS = ["morning", "noon", "evening"];

/** Njoftimet e përdoruesit lidhen me `reminder_type`; pool-et me `slot`. */
const SLOT_BY_REMINDER = { morning: "morning", midday: "noon", evening: "evening" };

/**
 * Meditimi i ditës për një çast.
 *
 * ⚠️  "Rastësor, por i qëndrueshëm brenda së njëjtës ditë."
 *
 *     `MD5(user + slot + datë + id)` jep pikërisht këtë: renditja duket e
 *     rastësishme, ndryshon çdo ditë dhe për çdo përdorues, por për të njëjtat
 *     hyrje kthen gjithmonë të njëjtin rresht. `RAND()` do të jepte një
 *     meditim tjetër sa herë hapej ekrani — dhe njoftimi i mëngjesit do të
 *     tregonte diçka tjetër nga ajo që hap aplikacioni.
 */
async function pickForSlot(userId, slot, localDate) {
  return one(
    `SELECT m.id, m.title, m.subgroup, m.duration_sec, m.is_premium,
            c.slug AS category_slug, c.name AS category_name
       FROM notification_pools p
       JOIN meditations m ON m.id = p.meditation_id
       LEFT JOIN categories c ON c.id = m.category_id
      WHERE p.slot = ? AND m.published_at IS NOT NULL
      ORDER BY MD5(CONCAT(?, ?, ?, m.id))
      LIMIT 1`,
    [slot, userId, slot, localDate]
  );
}

/** Data e sotme sipas zonës kohore të përdoruesit — kurrë sipas klientit. */
const localToday = (user) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: user.timezone || "Europe/Tirane" }).format(new Date());

/* ═══════════════ LEXIM PUBLIK ═══════════════ */

/** Përmbajtja e pool-eve — për panelin e admin-it. */
router.get("/content/pools", async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT p.slot, m.id, m.title, m.subgroup, m.duration_sec
         FROM notification_pools p
         JOIN meditations m ON m.id = p.meditation_id
        ORDER BY p.slot, m.subgroup, m.title`
    );
    const pools = { morning: [], noon: [], evening: [] };
    for (const row of rows) pools[row.slot]?.push(row);
    res.json(pools);
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ ME HYRJE ═══════════════ */

const me = express.Router();
me.use(requireAuth);

/**
 * Çfarë do të propozohet sot, për çdo kujtesë të ndezur.
 *
 * Kthen edhe kujtesat e fikura, me `enabled: false` — ekrani i njoftimeve i
 * tregon të gjitha, dhe pa këtë do t'i duhej një kërkesë e dytë për oraret.
 */
me.get("/reminders/today", async (req, res, next) => {
  try {
    const today = localToday(req.user);
    const reminders = await query(
      `SELECT reminder_type, time_of_day, is_enabled FROM reminders WHERE user_id = ?`,
      [req.userId]
    );
    const byType = new Map(reminders.map((r) => [r.reminder_type, r]));

    const slots = await Promise.all(
      Object.entries(SLOT_BY_REMINDER).map(async ([reminderType, slot]) => {
        const reminder = byType.get(reminderType);
        return {
          reminder: reminderType,
          slot,
          time: reminder?.time_of_day ?? null,
          enabled: Boolean(reminder?.is_enabled),
          meditation: await pickForSlot(req.userId, slot, today),
        };
      })
    );

    res.json({ date: today, slots });
  } catch (err) {
    next(err);
  }
});

/** Njoftimet e dërguara — ato që sheh përdoruesi te zilja. */
me.get("/notifications", async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
    res.json(
      await query(
        `SELECT id, title, body, type, related_id, is_read, sent_at
           FROM notifications WHERE user_id = ?
          ORDER BY sent_at DESC LIMIT ${limit}`,
        [req.userId]
      )
    );
  } catch (err) {
    next(err);
  }
});

me.put("/notifications/:id/read", async (req, res, next) => {
  try {
    /* `user_id` te kushti: pa të, kushdo do të shënonte si të lexuara
       njoftimet e kujtdo — dhe do të merrte vesh se ekzistojnë. */
    await query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.userId,
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

me.put("/notifications/read-all", async (req, res, next) => {
  try {
    await query("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0", [
      req.userId,
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ ADMIN: PËRMBAJTJA E POOL-EVE ═══════════════ */

const admin = express.Router();
admin.use(requireAuth, requireAdmin);

/**
 * Zëvendëson përmbajtjen e një pool-i.
 *
 * Seksioni 9: "Klientët caktojnë vetë cilat meditime hyjnë në secilin pool."
 * Ndaj lista vjen e plotë dhe zëvendëson atë ekzistuese — heqja e një meditimi
 * duhet të jetë po aq e mundur sa shtimi.
 */
admin.put("/pools/:slot", async (req, res, next) => {
  const { slot } = req.params;
  if (!SLOTS.includes(slot)) return res.status(400).json({ error: "Pool i panjohur." });

  const ids = Array.isArray(req.body?.meditationIds) ? req.body.meditationIds : null;
  if (!ids) return res.status(400).json({ error: "`meditationIds` duhet listë." });
  if (ids.length > 500) return res.status(400).json({ error: "Listë tepër e gjatë." });

  try {
    if (ids.length > 0) {
      /* Ekzistenca kontrollohet para fshirjes: një id e gabuar nuk duhet ta
         lërë pool-in bosh — njoftimi i asaj kohe do të pushonte pa u vënë re. */
      const found = await query(
        `SELECT id FROM meditations WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids
      );
      if (found.length !== new Set(ids).size) {
        return res.status(400).json({ error: "Disa meditime nuk u gjetën." });
      }
    }

    await query("DELETE FROM notification_pools WHERE slot = ?", [slot]);
    for (const id of new Set(ids)) {
      await query("INSERT INTO notification_pools (slot, meditation_id) VALUES (?, ?)", [slot, id]);
    }
    res.json({ slot, count: new Set(ids).size });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ ADMIN: KLASIFIKIMI ═══════════════ */

/**
 * Rikaton teknikën dhe/ose kategorinë e një grupi meditimesh.
 *
 * ⚠️  Vjen një LISTË ID-SH, jo një çelës nën-grupi.
 *
 *     Te aplikacioni grupet identifikohen me "teknikë/nën-grup". Po ta pranonte
 *     serveri ashtu, çelësi do të ndryshonte pikërisht nga veprimi që po bëhet:
 *     sapo teknika zhvendoset, grupi i vjetër nuk ekziston më, dhe një ndryshim
 *     i dytë do të prekte diçka tjetër. Me id-të, veprimi është i njëjti sa
 *     herë të përsëritet.
 *
 *     Të dyja etiketat janë opsionale — klientja mund të ndryshojë vetëm
 *     kategorinë pa e prekur teknikën.
 */
admin.put("/meditations/classification", async (req, res, next) => {
  const ids = Array.isArray(req.body?.meditationIds) ? [...new Set(req.body.meditationIds)] : null;
  const { techniqueSlug = null, categorySlug = null } = req.body ?? {};

  if (!ids || ids.length === 0) return res.status(400).json({ error: "`meditationIds` duhet listë." });
  if (ids.length > 500) return res.status(400).json({ error: "Listë tepër e gjatë." });
  if (!techniqueSlug && !categorySlug) {
    return res.status(400).json({ error: "Duhet të paktën teknika ose kategoria." });
  }

  try {
    /* Slug-ët përkthehen në id PARA shkrimit: një slug i panjohur duhet të
       dështojë me mesazh, jo të shkruajë `NULL` dhe t'i fshehë meditimet nga
       të dyja pamjet. */
    let techniqueId;
    if (techniqueSlug) {
      const row = await one("SELECT id FROM techniques WHERE slug = ?", [techniqueSlug]);
      if (!row) return res.status(400).json({ error: `Teknikë e panjohur: ${techniqueSlug}` });
      techniqueId = row.id;
    }
    let categoryId;
    if (categorySlug) {
      const row = await one("SELECT id FROM categories WHERE slug = ?", [categorySlug]);
      if (!row) return res.status(400).json({ error: `Kategori e panjohur: ${categorySlug}` });
      categoryId = row.id;
    }

    const placeholders = ids.map(() => "?").join(",");
    const found = await query(`SELECT id FROM meditations WHERE id IN (${placeholders})`, ids);
    if (found.length !== ids.length) {
      return res.status(400).json({ error: "Disa meditime nuk u gjetën." });
    }

    const sets = [];
    const params = [];
    if (techniqueId) {
      sets.push("technique_id = ?");
      params.push(techniqueId);
    }
    if (categoryId) {
      sets.push("category_id = ?");
      params.push(categoryId);
    }

    const result = await query(
      `UPDATE meditations SET ${sets.join(", ")} WHERE id IN (${placeholders})`,
      [...params, ...ids]
    );
    res.json({ updated: result.affectedRows ?? 0, techniqueSlug, categorySlug });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ ADMIN: DEMONSTRIM I MEDALJEVE ═══════════════ */

/**
 * Ndërton një streak të gjatë, që medaljet të shihen pa pritur tri javë.
 *
 * ⚠️  Streak-u rritet HAP PAS HAPI, jo me një `UPDATE` të vetëm.
 *
 *     Medaljet i jep trigger-i sa herë `current_streak` kalon një shumëfish.
 *     Një kërcim 0 → 21 do ta fironte një herë të vetme dhe do të jepte një
 *     bronz, një argjend, një ar — ndërsa specifikimi kërkon SHTATË bronz,
 *     TRE argjend, një ar. Kalimi nëpër çdo vlerë e jep numërimin e saktë.
 *
 *     Vetëm për admin, dhe vetëm mbi llogarinë e vet: një rrugë që fabrikon
 *     shpërblime nuk duhet t'i preket kujtdo.
 */
admin.post("/demo/streak", async (req, res, next) => {
  const days = Number(req.body?.days);
  if (!Number.isInteger(days) || days < 0 || days > 400) {
    return res.status(400).json({ error: "`days` duhet 0–400." });
  }

  try {
    await query("DELETE FROM medals WHERE user_id = ?", [req.userId]);
    await query(
      `INSERT INTO streaks (user_id, current_streak, best_streak, current_streak_started_on,
                            last_meditation_date, total_sessions, total_seconds)
       VALUES (?, 0, 0, CURDATE(), CURDATE(), 0, 0)
       ON DUPLICATE KEY UPDATE current_streak = 0, best_streak = 0,
                               current_streak_started_on = CURDATE()`,
      [req.userId]
    );

    for (let day = 1; day <= days; day += 1) {
      await query(
        `UPDATE streaks
            SET current_streak = ?, best_streak = GREATEST(best_streak, ?)
          WHERE user_id = ?`,
        [day, day, req.userId]
      );
    }

    /*
     * Data e fundit shtyhet dy ditë prapa.
     *
     * ⚠️  Kjo e bën rregullin e prishjes të provueshëm: seanca e radhës (e
     *     sotme) e gjen një boshllëk, ndaj `trg_session_streak` e kthen
     *     `current_streak` te 1 dhe ruan `best_streak` me `GREATEST`. Me datën
     *     e sotme, seanca do të numërohej si e njëjta ditë dhe rregulli nuk do
     *     të shihej fare.
     */
    if (days > 0) {
      await query(
        `UPDATE streaks
            SET last_meditation_date = DATE_SUB(CURDATE(), INTERVAL 2 DAY)
          WHERE user_id = ?`,
        [req.userId]
      );
    }

    const medals = await query(
      "SELECT medal_type, COUNT(*) AS n FROM medals WHERE user_id = ? GROUP BY medal_type",
      [req.userId]
    );
    res.json({ days, medals: Object.fromEntries(medals.map((m) => [m.medal_type, Number(m.n)])) });
  } catch (err) {
    next(err);
  }
});

module.exports = { publicRoutes: router, meRoutes: me, adminRoutes: admin, pickForSlot, SLOT_BY_REMINDER };
