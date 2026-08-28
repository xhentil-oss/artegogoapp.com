const express = require("express");
const { query, one } = require("../db");

const router = express.Router();

/**
 * PËRMBAJTJA — lexohet nga të gjithë, edhe pa hyrje.
 *
 * ⚠️  Meditimet premium KTHEHEN si metadata, edhe për përdorues pa abonim.
 *     Kjo është e qëllimshme: biblioteka duhet t'i tregojë të 244-ta me dryn,
 *     që përdoruesi të shohë çfarë fiton. Ajo që mbrohet është AUDIO —
 *     `audio_url` nuk kthehet kurrë nga këto rrugë; jepet vetëm nga
 *     `/audio/:id`, pas kontrollit të abonimit.
 */

/** Kolonat publike të një meditimi — pa `audio_url`. */
const MEDITATION_FIELDS = `
  m.id, m.title, m.subtitle, m.subgroup, m.narrator, m.duration_sec,
  m.cover_url, m.description, m.is_premium, m.average_rating, m.rating_count,
  m.is_daily_featured, m.is_short_daily, m.is_morning_ritual,
  t.slug AS technique_slug, t.name AS technique_name,
  c.slug AS category_slug, c.name AS category_name`;

const FROM_MEDITATIONS = `
  FROM meditations m
  LEFT JOIN techniques t ON t.id = m.technique_id
  LEFT JOIN categories c ON c.id = m.category_id
  WHERE m.published_at IS NOT NULL`;

router.get("/techniques", async (_req, res, next) => {
  try {
    res.json(
      await query(`
        SELECT t.id, t.slug, t.name, t.description, t.icon_name, t.display_order,
               COUNT(m.id) AS meditation_count
          FROM techniques t
          LEFT JOIN meditations m ON m.technique_id = t.id AND m.published_at IS NOT NULL
         GROUP BY t.id
         ORDER BY t.display_order`)
    );
  } catch (err) {
    next(err);
  }
});

router.get("/categories", async (_req, res, next) => {
  try {
    /* Kategoritë bosh nuk kthehen — kërkesë e drejtpërdrejtë e specifikimit. */
    res.json(
      await query(`
        SELECT c.id, c.slug, c.name, c.description, c.cover_url,
               c.display_order, c.is_featured, COUNT(m.id) AS meditation_count
          FROM categories c
          LEFT JOIN meditations m ON m.category_id = c.id AND m.published_at IS NOT NULL
         GROUP BY c.id
        HAVING meditation_count > 0
         ORDER BY c.display_order`)
    );
  } catch (err) {
    next(err);
  }
});

/* GET /content/meditations?technique=&category=&q=&limit=&offset= */
router.get("/meditations", async (req, res, next) => {
  try {
    const { technique, category, q } = req.query;

    /*
     * Filtrat shtohen si copëza SQL-je me parametra — asnjë vlerë nuk ngjitet
     * te teksti. Kufiri kthehet në numër dhe kapet mes 1 dhe 100: pa të, një
     * `?limit=999999` do të tërhiqte tërë tabelën në një kërkesë.
     */
    const where = [];
    const params = [];

    if (technique) { where.push("t.slug = ?"); params.push(technique); }
    if (category) { where.push("c.slug = ?"); params.push(category); }
    if (q) {
      where.push("(m.title LIKE ? OR m.description LIKE ? OR m.subgroup LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const rows = await query(
      `SELECT ${MEDITATION_FIELDS} ${FROM_MEDITATIONS}
       ${where.length ? `AND ${where.join(" AND ")}` : ""}
       ORDER BY m.title
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const total = await one(
      `SELECT COUNT(*) AS n ${FROM_MEDITATIONS} ${where.length ? `AND ${where.join(" AND ")}` : ""}`,
      params
    );

    res.json({ items: rows, total: total?.n ?? rows.length, limit, offset });
  } catch (err) {
    next(err);
  }
});

router.get("/meditations/:id", async (req, res, next) => {
  try {
    const row = await one(
      `SELECT ${MEDITATION_FIELDS} ${FROM_MEDITATIONS} AND m.id = ?`,
      [req.params.id]
    );
    if (!row) return res.status(404).json({ error: "Meditimi nuk u gjet." });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.get("/sounds", async (_req, res, next) => {
  try {
    res.json(
      await query(
        `SELECT id, name, category, cover_url, duration_sec, is_loop, is_premium,
                average_rating, rating_count
           FROM sounds ORDER BY display_order`
      )
    );
  } catch (err) {
    next(err);
  }
});

/* ---------- programet ---------- */
router.get("/programs", async (_req, res, next) => {
  try {
    res.json(
      await query(`
        SELECT p.id, p.slug, p.title, p.subtitle, p.description, p.theme,
               p.total_days, p.cover_url, p.cover_color, p.is_premium,
               COALESCE(pt.total_minutes, p.total_duration_min) AS total_minutes
          FROM programs p
          LEFT JOIN program_totals pt ON pt.program_id = p.id
         WHERE p.is_active = 1
         ORDER BY p.display_order`)
    );
  } catch (err) {
    next(err);
  }
});

/** Ditët e një programi me meditimet e secilës — ushqen rrugëtimin. */
router.get("/programs/:slug/days", async (req, res, next) => {
  try {
    const program = await one("SELECT id, total_days FROM programs WHERE slug = ?", [req.params.slug]);
    if (!program) return res.status(404).json({ error: "Programi nuk u gjet." });

    const rows = await query(
      `SELECT d.day_number, d.title, d.description,
              m.id AS meditation_id, m.title AS meditation_title, m.duration_sec,
              pdm.order_in_day
         FROM program_days d
         LEFT JOIN program_day_meditations pdm ON pdm.program_day_id = d.id
         LEFT JOIN meditations m ON m.id = pdm.meditation_id
        WHERE d.program_id = ?
        ORDER BY d.day_number, pdm.order_in_day`,
      [program.id]
    );

    /* Grupimi bëhet këtu, jo te klienti: një ditë me dy meditime kthehet si
       një objekt, dhe rrugëtimi nuk merret me rreshta të përsëritur. */
    const days = new Map();
    for (const row of rows) {
      if (!days.has(row.day_number)) {
        days.set(row.day_number, { day: row.day_number, title: row.title, meditations: [] });
      }
      if (row.meditation_id) {
        days.get(row.day_number).meditations.push({
          id: row.meditation_id,
          title: row.meditation_title,
          duration_sec: row.duration_sec,
        });
      }
    }

    res.json({ total_days: program.total_days, days: [...days.values()] });
  } catch (err) {
    next(err);
  }
});

/* ---------- komuniteti ---------- */
router.get("/feed", async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    res.json(
      await query(
        `SELECT p.id, p.author_name, p.author_avatar_url, p.author_role, p.is_verified,
                p.post_type, p.text_content, p.media_url, p.media_type,
                p.reaction_count, p.comment_count, p.published_at,
                m.id AS meditation_id, m.title AS meditation_title, m.duration_sec
           FROM community_posts p
           LEFT JOIN meditations m ON m.id = p.meditation_id
          WHERE p.is_published = 1
          ORDER BY p.published_at DESC
          LIMIT ${limit} OFFSET ${offset}`
      )
    );
  } catch (err) {
    next(err);
  }
});

router.get("/quotes/today", async (_req, res, next) => {
  try {
    /*
     * Citati lidhet me datën, jo me `RAND()`: përndryshe do të ndryshonte në
     * çdo kërkesë, dhe dy ekrane që e tregojnë të njëjtin çast do të shfaqnin
     * citate të ndryshme njëkohësisht.
     */
    const row = await one(`
      SELECT text, author, category FROM daily_quotes
       WHERE is_active = 1
       ORDER BY id
       LIMIT 1 OFFSET (SELECT DAYOFYEAR(CURDATE()) MOD GREATEST(COUNT(*), 1)
                         FROM daily_quotes WHERE is_active = 1)`);
    res.json(row ?? { text: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
