const express = require("express");
const { query, one } = require("../db");
const { hashPassword, verifyPassword, signToken, requireAuth } = require("../auth");

const router = express.Router();

const MIN_PASSWORD = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Fushat publike të një përdoruesi — kurrë `password_hash`. */
const PUBLIC_FIELDS =
  "id, email, name, avatar_url, is_admin, is_premium, subscription_status, " +
  "subscription_end_at, onboarding_completed, timezone";

function validate(email, password) {
  if (!EMAIL_RE.test((email ?? "").trim())) return "Shkruaj një email të vlefshëm.";
  if ((password ?? "").length < MIN_PASSWORD)
    return `Fjalëkalimi duhet të ketë së paku ${MIN_PASSWORD} shenja.`;
  return null;
}

/* ---------------------------------------------------------------
   POST /auth/register
   --------------------------------------------------------------- */
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body ?? {};
    const problem = validate(email, password);
    if (problem) return res.status(400).json({ error: problem });

    const clean = email.trim().toLowerCase();
    if (await one("SELECT id FROM users WHERE email = ?", [clean])) {
      return res.status(409).json({ error: "Kjo llogari ekziston. Hyr me fjalëkalimin tënd." });
    }

    /*
     * `UUID()` gjenerohet nga MySQL, jo nga Node: kështu ID-ja vjen nga i
     * njëjti burim si te importet e tjera, dhe nuk ka dy konventa.
     */
    const id = (await one("SELECT UUID() AS id")).id;
    await query(
      "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
      [id, clean, await hashPassword(password), (name ?? "").trim() || clean.split("@")[0]]
    );

    const user = await one(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [id]);
    res.status(201).json({ token: signToken(id), user });
  } catch (err) {
    next(err);
  }
});

/* ---------------------------------------------------------------
   POST /auth/login
   --------------------------------------------------------------- */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    const problem = validate(email, password);
    if (problem) return res.status(400).json({ error: problem });

    const clean = email.trim().toLowerCase();
    const row = await one("SELECT id, password_hash FROM users WHERE email = ?", [clean]);

    /*
     * I njëjti mesazh për email që s'ekziston dhe për fjalëkalim të gabuar.
     *
     * Mesazhe të ndryshme do të linin këdo të zbulonte cilat email-e janë
     * regjistruar te aplikacioni — thjesht duke provuar.
     */
    const okPassword = row && (await verifyPassword(password, row.password_hash));
    if (!okPassword) return res.status(401).json({ error: "Email ose fjalëkalim i pasaktë." });

    const user = await one(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [row.id]);
    res.json({ token: signToken(row.id), user });
  } catch (err) {
    next(err);
  }
});

/* ---------------------------------------------------------------
   GET /auth/me  — kush jam
   --------------------------------------------------------------- */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    res.json({ user: await one(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [req.userId]) });
  } catch (err) {
    next(err);
  }
});

/* ---------------------------------------------------------------
   PUT /auth/me  — emri, avatari, zona kohore, onboarding
   --------------------------------------------------------------- */
router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const { name, avatar_url, timezone, onboarding_completed } = req.body ?? {};

    /*
     * ⚠️  Lista e fushave është e mbyllur me qëllim.
     *
     * Një `UPDATE users SET ?` me trupin e kërkesës do të lejonte këdo të
     * dërgonte `is_premium: true` ose `is_admin: true` dhe t'i jepte vetes
     * gjithçka. Ato fusha i shkruan vetëm serveri, nga webhook-u i pagesave.
     */
    await query(
      `UPDATE users
          SET name = COALESCE(?, name),
              avatar_url = COALESCE(?, avatar_url),
              timezone = COALESCE(?, timezone),
              onboarding_completed = COALESCE(?, onboarding_completed)
        WHERE id = ?`,
      [
        name ?? null,
        avatar_url ?? null,
        timezone ?? null,
        onboarding_completed === undefined ? null : Number(Boolean(onboarding_completed)),
        req.userId,
      ]
    );

    res.json({ user: await one(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [req.userId]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
