const express = require("express");
const { pool, query, one } = require("../db");
const { requireAuth } = require("../auth");

const router = express.Router();

/**
 * TË DHËNAT PERSONALE
 *
 * ⚠️  KY SKEDAR ZËVENDËSON ROW LEVEL SECURITY-NË.
 *
 *     Te versioni Postgres, databaza vetë ndalonte një përdorues të lexonte
 *     të dhënat e tjetrit — 44 politika që vlenin edhe kur kodi kishte gabim.
 *     MySQL nuk e ka. Ndaj ÇDO query këtu mban `user_id = ?`, dhe ai `user_id`
 *     vjen GJITHMONË nga `req.userId` (token-i), KURRË nga trupi i kërkesës.
 *
 *     Një `WHERE user_id = ?` i harruar në një rrugë të vetme do të thoshte
 *     që kushdo lexon zakonet, gjendjen emocionale dhe historikun e të tjerëve
 *     — pa asnjë gabim, pa asnjë shenjë.
 */

/* Të gjitha rrugët këtu kërkojnë hyrje. */
router.use(requireAuth);

/* ═══════════════ SEANCAT ═══════════════ */

router.get("/sessions", async (req, res, next) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    res.json(
      await query(
        `SELECT s.id, s.meditation_id, s.program_id, s.program_day, s.duration_sec,
                s.completed, s.source, s.mood_before, s.mood_after, s.local_date, s.listened_at,
                m.title AS meditation_title
           FROM meditation_sessions s
           LEFT JOIN meditations m ON m.id = s.meditation_id
          WHERE s.user_id = ?
          ORDER BY s.listened_at DESC
          LIMIT ${limit}`,
        [req.userId]
      )
    );
  } catch (err) {
    next(err);
  }
});

/**
 * Regjistron një seancë të dëgjuar.
 *
 * `local_date` llogaritet KËTU nga zona kohore e përdoruesit, jo merret nga
 * klienti: një telefon me orë të gabuar — ose një kërkesë e ndërtuar me dorë —
 * do të mund të shpikte ditë dhe të fryhte streak-un.
 */
router.post("/sessions", async (req, res, next) => {
  try {
    const {
      meditation_id = null,
      sound_id = null,
      program_id = null,
      program_day = null,
      duration_sec,
      completed = false,
      source = "library",
      mood_before = null,
      mood_after = null,
    } = req.body ?? {};

    if (!Number.isInteger(duration_sec) || duration_sec < 0) {
      return res.status(400).json({ error: "`duration_sec` duhet numër jo-negativ." });
    }

    const tz = req.user.timezone || "Europe/Tirane";
    const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());

    const id = (await one("SELECT UUID() AS id")).id;
    await query(
      `INSERT INTO meditation_sessions
         (id, user_id, meditation_id, sound_id, program_id, program_day,
          duration_sec, completed, source, mood_before, mood_after, local_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.userId, meditation_id, sound_id, program_id, program_day,
       duration_sec, completed ? 1 : 0, source, mood_before, mood_after, localDate]
    );

    /* Streak-u dhe medaljet i përditëson trigger-i; kthehen sa të rifreskuara. */
    const streak = await one("SELECT * FROM streaks WHERE user_id = ?", [req.userId]);
    res.status(201).json({ id, local_date: localDate, streak });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ STREAK DHE MEDALJE ═══════════════ */

router.get("/streak", async (req, res, next) => {
  try {
    res.json(await one("SELECT * FROM streaks WHERE user_id = ?", [req.userId]));
  } catch (err) {
    next(err);
  }
});

router.get("/medals", async (req, res, next) => {
  try {
    res.json(
      await query(
        `SELECT medal_type, reason, streak_day, earned_at
           FROM medals WHERE user_id = ? ORDER BY earned_at DESC`,
        [req.userId]
      )
    );
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ TË PREFERUARAT DHE SHKARKIMET ═══════════════ */

/*
 * Të dyja listat shkruhen veçmas, me emrat e tabelave TË SHKRUAR.
 *
 * Versioni i parë i gjeneronte me një cikël dhe `${table}` brenda SQL-së.
 * Emri vinte nga një listë e ngurtë, ndaj nuk ishte rrezik atëherë — por
 * interpolimi i një emri tabele është pikërisht modeli që bëhet injeksion
 * ditën që dikush e lidh me një parametër kërkese. Përveç kësaj, SQL-ja e
 * shkruar plot mund të kërkohet me `grep`; ajo e gjeneruar jo.
 */

router.get("/favorites", async (req, res, next) => {
  try {
    res.json(
      await query(
        `SELECT m.id, m.title, m.duration_sec, m.cover_url, m.is_premium, f.created_at
           FROM favorites f
           JOIN meditations m ON m.id = f.meditation_id
          WHERE f.user_id = ?
          ORDER BY f.created_at DESC`,
        [req.userId]
      )
    );
  } catch (err) {
    next(err);
  }
});

/*
 * `INSERT IGNORE` mbështetet te çelësi unik (user_id, meditation_id): shtimi
 * dy herë nuk krijon dublikatë dhe nuk jep gabim.
 *
 * ⚠️  POR `IGNORE` e zbret edhe shkeljen e çelësit të huaj në paralajmërim.
 *     Pra një `meditation_id` që nuk ekziston kthente `204` — sukses i rremë,
 *     pa asnjë rresht të shkruar. Aplikacioni e tregonte zemrën të kuqe,
 *     ndërsa te pajisja tjetër ajo zhdukej, dhe asgjë nuk e shënonte gabimin.
 *
 *     Prandaj ekzistenca kontrollohet e para. Kjo është një query më shumë,
 *     dhe ia vlen: një shkrim që dështon duhet të thotë se dështoi.
 */
async function requireMeditation(id) {
  const row = await one("SELECT id FROM meditations WHERE id = ?", [id]);
  return Boolean(row);
}
router.put("/favorites/:meditationId", async (req, res, next) => {
  try {
    if (!(await requireMeditation(req.params.meditationId))) {
      return res.status(404).json({ error: "Meditimi nuk u gjet." });
    }
    const id = (await one("SELECT UUID() AS id")).id;
    await query("INSERT IGNORE INTO favorites (id, user_id, meditation_id) VALUES (?, ?, ?)", [
      id,
      req.userId,
      req.params.meditationId,
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.delete("/favorites/:meditationId", async (req, res, next) => {
  try {
    await query("DELETE FROM favorites WHERE user_id = ? AND meditation_id = ?", [
      req.userId,
      req.params.meditationId,
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get("/downloads", async (req, res, next) => {
  try {
    res.json(
      await query(
        `SELECT m.id, m.title, m.duration_sec, m.cover_url, m.is_premium, d.downloaded_at
           FROM downloads d
           JOIN meditations m ON m.id = d.meditation_id
          WHERE d.user_id = ?
          ORDER BY d.downloaded_at DESC`,
        [req.userId]
      )
    );
  } catch (err) {
    next(err);
  }
});

router.put("/downloads/:meditationId", async (req, res, next) => {
  try {
    if (!(await requireMeditation(req.params.meditationId))) {
      return res.status(404).json({ error: "Meditimi nuk u gjet." });
    }
    const id = (await one("SELECT UUID() AS id")).id;
    await query("INSERT IGNORE INTO downloads (id, user_id, meditation_id) VALUES (?, ?, ?)", [
      id,
      req.userId,
      req.params.meditationId,
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.delete("/downloads/:meditationId", async (req, res, next) => {
  try {
    await query("DELETE FROM downloads WHERE user_id = ? AND meditation_id = ?", [
      req.userId,
      req.params.meditationId,
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ KUJTESAT ═══════════════ */

router.get("/reminders", async (req, res, next) => {
  try {
    res.json(
      await query(
        `SELECT reminder_type, time_of_day, is_enabled,
                on_mon, on_tue, on_wed, on_thu, on_fri, on_sat, on_sun
           FROM reminders WHERE user_id = ? ORDER BY FIELD(reminder_type,'morning','midday','evening')`,
        [req.userId]
      )
    );
  } catch (err) {
    next(err);
  }
});

router.put("/reminders/:type", async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!["morning", "midday", "evening"].includes(type)) {
      return res.status(400).json({ error: "Çast i panjohur." });
    }

    const { time_of_day = null, is_enabled = null } = req.body ?? {};
    await query(
      `UPDATE reminders
          SET time_of_day = COALESCE(?, time_of_day),
              is_enabled = COALESCE(?, is_enabled)
        WHERE user_id = ? AND reminder_type = ?`,
      [time_of_day, is_enabled === null ? null : Number(Boolean(is_enabled)), req.userId, type]
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ ZAKONET DHE GJENDJA ═══════════════ */

router.get("/habits", async (req, res, next) => {
  try {
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    res.json(
      await query(
        `SELECT \`date\`, habit_type, value FROM habits
          WHERE user_id = ? AND \`date\` >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
          ORDER BY \`date\` DESC`,
        [req.userId]
      )
    );
  } catch (err) {
    next(err);
  }
});

/**
 * Shënon një zakon.
 *
 * Data NUK merret nga kërkesa: seksioni 10 e kërkon që ditët e kaluara të mos
 * plotësohen dot, dhe kufiri duhet të qëndrojë edhe kur klienti ka gabim.
 */
router.put("/habits/:type", async (req, res, next) => {
  try {
    const value = Number(req.body?.value ?? 1);
    const id = (await one("SELECT UUID() AS id")).id;
    const tz = req.user.timezone || "Europe/Tirane";
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());

    await query(
      `INSERT INTO habits (id, user_id, \`date\`, habit_type, value)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      [id, req.userId, today, req.params.type, value]
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get("/moods", async (req, res, next) => {
  try {
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    res.json(
      await query(
        `SELECT \`date\`, mood_score, mood_label, energy_level FROM moods
          WHERE user_id = ? AND \`date\` >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
          ORDER BY \`date\` DESC`,
        [req.userId]
      )
    );
  } catch (err) {
    next(err);
  }
});

router.put("/moods", async (req, res, next) => {
  try {
    const score = Number(req.body?.mood_score);
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({ error: "`mood_score` duhet 1–5." });
    }

    const id = (await one("SELECT UUID() AS id")).id;
    const tz = req.user.timezone || "Europe/Tirane";
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());

    await query(
      `INSERT INTO moods (id, user_id, \`date\`, mood_score, mood_label)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE mood_score = VALUES(mood_score), mood_label = VALUES(mood_label)`,
      [id, req.userId, today, score, req.body?.mood_label ?? null]
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ RRUGËTIMI I PROGRAMEVE ═══════════════ */

router.get("/journey", async (req, res, next) => {
  try {
    const progress = await query(
      `SELECT program_id, current_day, total_days_completed, started_at, last_activity_at
         FROM user_program_progress WHERE user_id = ?`,
      [req.userId]
    );
    const completions = await query(
      `SELECT program_id, day_number, completed_at
         FROM user_program_day_completions WHERE user_id = ? ORDER BY day_number`,
      [req.userId]
    );
    res.json({ progress, completions });
  } catch (err) {
    next(err);
  }
});

router.post("/journey/:programId/start", async (req, res, next) => {
  try {
    const id = (await one("SELECT UUID() AS id")).id;
    await query(
      `INSERT IGNORE INTO user_program_progress (id, user_id, program_id) VALUES (?, ?, ?)`,
      [id, req.userId, req.params.programId]
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * Shënon një ditë të rrugëtimit si të kryer.
 *
 * Rregulli "një ndalesë në ditë" zbatohet KËTU, jo vetëm te aplikacioni:
 * përndryshe një kërkesë e përsëritur do ta mbaronte programin 7-ditor brenda
 * një minute.
 */
router.post("/journey/:programId/complete/:day", async (req, res, next) => {
  try {
    const day = Number(req.params.day);
    if (!Number.isInteger(day) || day < 1) return res.status(400).json({ error: "Ditë e pavlefshme." });

    const tz = req.user.timezone || "Europe/Tirane";
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());

    const usedToday = await one(
      `SELECT 1 AS yes FROM user_program_day_completions
        WHERE user_id = ? AND program_id = ? AND DATE(completed_at) = ?`,
      [req.userId, req.params.programId, today]
    );
    if (usedToday) {
      return res.status(409).json({ error: "Një ndalesë në ditë. Kthehu nesër." });
    }

    await query(
      `INSERT IGNORE INTO user_program_day_completions (user_id, program_id, day_number)
       VALUES (?, ?, ?)`,
      [req.userId, req.params.programId, day]
    );
    res.status(201).json({ day, completed_on: today });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════ SEANCAT E NDËRTUARA (Krijo) ═══════════════ */

/*
 * Një seancë e ndërtuar është `creations` + hapat e saj te `creation_steps`.
 *
 * ⚠️  Të dyja shkruhen brenda NJË transaksioni. Pa të, një dështim te hapi i
 *     tretë do të linte një seancë me dy hapa — e ruajtur, e dukshme, dhe e
 *     gabuar. Më mirë të mos ruhet fare sesa të ruhet gjysma.
 */
router.get("/creations", async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT c.id, c.name, c.goal, c.generation_type, c.total_duration_sec, c.created_at,
              s.step_order, s.meditation_id, m.title AS step_title, m.duration_sec AS step_sec
         FROM creations c
         LEFT JOIN creation_steps s ON s.creation_id = c.id
         LEFT JOIN meditations m ON m.id = s.meditation_id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC, s.step_order`,
      [req.userId]
    );

    /* Grupimi bëhet këtu, jo te klienti: JOIN-i kthen një rresht për hap. */
    const byId = new Map();
    for (const row of rows) {
      if (!byId.has(row.id)) {
        byId.set(row.id, {
          id: row.id,
          name: row.name,
          goal: row.goal,
          generation_type: row.generation_type,
          total_duration_sec: row.total_duration_sec,
          created_at: row.created_at,
          steps: [],
        });
      }
      if (row.meditation_id) {
        byId.get(row.id).steps.push({
          order: row.step_order,
          meditation_id: row.meditation_id,
          title: row.step_title,
          duration_sec: row.step_sec,
        });
      }
    }
    res.json([...byId.values()]);
  } catch (err) {
    next(err);
  }
});

router.post("/creations", async (req, res, next) => {
  const { name, goal = null, generation_type = "manual", steps } = req.body ?? {};

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Seanca duhet të ketë një emër." });
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ error: "Seanca duhet të ketë të paktën një hap." });
  }
  if (steps.length > 40) {
    return res.status(400).json({ error: "Shumë hapa për një seancë." });
  }
  if (!["manual", "ai_generated"].includes(generation_type)) {
    return res.status(400).json({ error: "`generation_type` i panjohur." });
  }

  const connection = await pool.getConnection();
  try {
    /*
     * Hapat verifikohen PARA se të nisë transaksioni.
     *
     * Pa këtë, një id e panjohur do të rrëzohej te çelësi i huaj dhe klienti do
     * të merrte "Gabim i brendshëm" — pa e ditur kurrë cili hap ishte problemi.
     */
    const ids = steps.map((s) => s?.meditation_id).filter(Boolean);
    if (ids.length !== steps.length) {
      return res.status(400).json({ error: "Çdo hap duhet të ketë një meditim." });
    }
    const [found] = await connection.query(
      `SELECT id FROM meditations WHERE id IN (${ids.map(() => "?").join(",")})`,
      ids
    );
    const known = new Set(found.map((r) => r.id));
    const missing = [...new Set(ids)].filter((id) => !known.has(id));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Hapa të panjohur: ${missing.length}` });
    }

    const [[{ id }]] = await connection.query("SELECT UUID() AS id");
    const total = steps.reduce((sum, s) => sum + (Number(s.duration_sec) || 0), 0);

    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO creations (id, user_id, name, goal, generation_type, total_duration_sec, is_saved)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [id, req.userId, name.trim().slice(0, 160), goal, generation_type, total]
    );
    for (const [i, step] of steps.entries()) {
      await connection.query(
        `INSERT INTO creation_steps (creation_id, meditation_id, step_order) VALUES (?, ?, ?)`,
        [id, step.meditation_id, i + 1]
      );
    }
    await connection.commit();

    res.status(201).json({ id, total_duration_sec: total, steps: steps.length });
  } catch (err) {
    await connection.rollback().catch(() => {});
    next(err);
  } finally {
    connection.release();
  }
});

router.delete("/creations/:id", async (req, res, next) => {
  try {
    /* `user_id` te kushti: pa të, kushdo do të fshinte seancat e kujtdo. */
    await query("DELETE FROM creations WHERE id = ? AND user_id = ?", [req.params.id, req.userId]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
