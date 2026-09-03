const express = require("express");
const crypto = require("node:crypto");
const mailer = require("../mailer");
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

/* ═══════════════ RIVENDOSJA E FJALËKALIMIT ═══════════════ */

/** Sa gjatë vlen një link. I shkurtër me qëllim. */
const RESET_MINUTES = Number(process.env.RESET_TTL_MIN || 60);

/** Sa shpesh mund të kërkohet një link i ri për të njëjtën llogari. */
const RESET_COOLDOWN_SEC = 60;

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

/**
 * Kërkon një link rivendosjeje.
 *
 * ⚠️  PËRGJIGJA ËSHTË E NJËJTA, edhe kur email-i nuk ekziston.
 *
 *     Ky nuk është shkujdesje — është i njëjti rregull si te `/auth/login`.
 *     Një "kjo llogari nuk ekziston" do t'i tregonte kujtdo se cilat email-e
 *     janë të regjistruara, dhe një formë rivendosjeje është pikërisht vendi
 *     ku dikush do të provonte një listë të tërë.
 *
 * ⚠️  Token-i shkruhet VETËM pasi email-i të jetë dërguar. Përndryshe do të
 *     mbeteshin token-a të vlefshëm që nuk i marrë kush.
 */
router.post("/forgot", async (req, res, next) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();

  /* Përgjigjja e njëjtë për çdo rast — shih shënimin lart. */
  const same = () =>
    res.json({ ok: true, message: "Nëse ky email ka llogari, do të marrë një link brenda pak minutash." });

  /*
   * ⚠️  KONTROLLI I SMTP-së VJEN I PARI, PARA KËRKIMIT TË PËRDORUESIT.
   *
   *     Kur rrinte pas tij, përgjigjja zbulonte llogaritë: një email i
   *     panjohur kthente `200` (sepse `same()` dilte para kontrollit), ndërsa
   *     një i vërtetë kthente `501`. Kush provonte një listë email-esh mësonte
   *     saktësisht cilat janë të regjistruara — pikërisht ajo që kjo rrugë
   *     duhet të fshehë.
   *
   *     Tani mungesa e konfigurimit është e njëjta për të gjithë, sepse ajo
   *     është gjendje e SERVERIT, nuk ka të bëjë me llogarinë.
   */
  if (!mailer.configured()) {
    return res.status(501).json({
      error: "Dërgimi i email-eve nuk është konfiguruar ende te serveri.",
      code: "not_configured",
    });
  }

  if (!email || !email.includes("@")) return same();

  try {
    const user = await one("SELECT id, name, email FROM users WHERE email = ?", [email]);
    if (!user) return same();

    /*
     * Pengesë ndaj përsëritjes: një kërkesë e re brenda `RESET_COOLDOWN_SEC`
     * shpërfillet. Pa këtë, kushdo mund t'i mbushte postën e një përdoruesi me
     * dhjetëra email-e duke shtypur butonin.
     */
    const recent = await one(
      `SELECT id FROM password_resets
        WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
        ORDER BY created_at DESC LIMIT 1`,
      [user.id, RESET_COOLDOWN_SEC]
    );
    if (recent) return same();

    const token = crypto.randomBytes(32).toString("hex");
    const base = (process.env.APP_ORIGIN || "").replace(/\/$/, "");
    const link = `${base}/?reset=${token}`;

    const sent = await mailer.send({ to: user.email, ...mailer.resetEmail({
      name: user.name, link, minutes: RESET_MINUTES,
    }) });

    if (!sent.ok) {
      return res.status(502).json({ error: "Email-i nuk u dërgua. Provo përsëri më vonë." });
    }

    /* Vetëm tani — pas dërgimit. */
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at, requested_ip)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)`,
      [user.id, sha256(token), RESET_MINUTES, String(req.ip ?? "").slice(0, 45)]
    );

    return same();
  } catch (err) {
    next(err);
  }
});

/**
 * Vendos fjalëkalimin e re me token-in nga email-i.
 *
 * ⚠️  Token-i kërkohet i hash-uar (`SHA256`), sepse ashtu ruhet — shih
 *     `mysql/11_password_reset.sql`. Krahasimi bëhet mbi hash, ndaj një kopje
 *     e databazës nuk mjafton për të hyrë.
 *
 * ⚠️  Pas suksesit, TË GJITHË token-at e tjerë të kësaj llogarie shënohen të
 *     përdorur. Nëse dikush kërkoi tri link-a, dy të tjerët nuk duhet të
 *     mbeten të vlefshëm — përndryshe një link i vjetër te posta e hapur do
 *     ta rikthente aksesin.
 */
router.post("/reset", async (req, res, next) => {
  const { token, password } = req.body ?? {};

  if (!token || typeof token !== "string" || token.length !== 64) {
    return res.status(400).json({ error: "Link i pavlefshëm." });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: "Fjalëkalimi duhet të ketë së paku 6 shenja." });
  }

  try {
    const row = await one(
      `SELECT r.id, r.user_id FROM password_resets r
        WHERE r.token_hash = ? AND r.used_at IS NULL AND r.expires_at > NOW()`,
      [sha256(token)]
    );
    /* Një mesazh i vetëm për "i panjohur", "i skaduar" dhe "i përdorur":
       dallimi nuk i ndihmon përdoruesit, dhe i ndihmon kujtdo që provon. */
    if (!row) return res.status(400).json({ error: "Link-u ka skaduar ose është përdorur." });

    const hash = await hashPassword(String(password));
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, row.user_id]);
    await query(
      "UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
      [row.user_id]
    );

    const user = await one(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [row.user_id]);
    /* Hyrja bëhet menjëherë: përdoruesi sapo provoi identitetin e vet përmes
       email-it, dhe një ekran hyrjeje pas kësaj është hap i kotë. */
    res.json({ token: signToken(row.user_id), user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
