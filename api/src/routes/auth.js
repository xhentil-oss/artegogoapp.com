const express = require("express");
const crypto = require("node:crypto");
const mailer = require("../mailer");
const { query, one } = require("../db");
const { hashPassword, verifyPassword, startSession, requireAuth } = require("../auth");

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

/* ═══════════════ VERIFIKIMI I EMAILIT ═══════════════ */

/**
 * Sa gjatë vlen një link verifikimi.
 *
 * Më i gjatë se ai i rivendosjes (60 minuta): dikush regjistrohet mbrëmjen
 * dhe e hap postën të nesërmen, dhe një link i skaduar atëherë do të dukej
 * si defekt i aplikacionit.
 */
const VERIFY_HOURS = Number(process.env.VERIFY_TTL_HOURS || 48);

/** Sa shpesh mund të kërkohet një link i ri për të njëjtën llogari. */
const VERIFY_COOLDOWN_SEC = 90;

const hashToken = (value) => crypto.createHash("sha256").update(value).digest("hex");

/**
 * Krijon token-in dhe dërgon email-in e verifikimit.
 *
 * ⚠️  Token-i shkruhet VETËM pasi email-i të jetë dërguar — i njëjti rregull
 *     si te rivendosja. Përndryshe do të mbeteshin token-a të vlefshëm që nuk
 *     i merr kush, dhe llogaria do të dukej e verifikueshme pa qenë.
 *
 * @returns {Promise<{ok:boolean, reason?:string}>}
 */
async function sendVerification(user, ip) {
  if (!mailer.configured()) return { ok: false, reason: "not_configured" };

  const token = crypto.randomBytes(32).toString("hex");
  const base = (process.env.APP_ORIGIN || "").replace(/\/$/, "");
  const link = `${base}/?verify=${token}`;

  const sent = await mailer.send({
    to: user.email,
    ...mailer.verifyEmail({ name: user.name, link, hours: VERIFY_HOURS }),
  });
  if (!sent.ok) return { ok: false, reason: sent.reason ?? "send_failed" };

  await query(
    `INSERT INTO email_verifications (user_id, token_hash, expires_at, requested_ip)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR), ?)`,
    [user.id, hashToken(token), VERIFY_HOURS, String(ip ?? "").slice(0, 45)]
  );
  return { ok: true };
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
    const emri = (name ?? "").trim() || clean.split("@")[0];
    await query(
      "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
      [id, clean, await hashPassword(password), emri]
    );

    /*
     * ⚠️  ASNJË SESION NUK NIS KËTU.
     *
     *     Deri më 16 nëntor 2026 regjistrimi kthente token-in menjëherë, pra
     *     një adresë e trilluar hynte në aplikacion po aq lehtë sa një e
     *     vërtetë. Tani llogaria ekziston por nuk hapet: çelësi vjen me
     *     email-in, dhe vetëm kush e lexon atë adresë e merr.
     */
    const dergimi = await sendVerification({ id, email: clean, name: emri }, req.ip);

    if (!dergimi.ok) {
      /*
       * ⚠️  LLOGARIA FSHIHET kur email-i nuk niset.
       *
       *     Po të mbetej, adresa do të zinte vend te `users` pa asnjë mënyrë
       *     për ta hapur: regjistrimi i radhës me të njëjtin email do të merrte
       *     "Kjo llogari ekziston" dhe njeriu do të ngecte përgjithmonë.
       */
      await query("DELETE FROM users WHERE id = ?", [id]);

      if (dergimi.reason === "not_configured") {
        return res.status(501).json({
          error: "Dërgimi i email-eve nuk është konfiguruar ende te serveri.",
          code: "not_configured",
        });
      }
      return res.status(502).json({
        error: "Email-i i verifikimit nuk u dërgua. Provo përsëri pas pak.",
        code: "mail_failed",
      });
    }

    res.status(201).json({
      verification: "sent",
      email: clean,
      message: "Të dërguam një email. Hap link-un brenda tij për të hapur llogarinë.",
    });
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
    const row = await one(
      "SELECT id, password_hash, email_verified_at FROM users WHERE email = ?",
      [clean]
    );

    /*
     * I njëjti mesazh për email që s'ekziston dhe për fjalëkalim të gabuar.
     *
     * Mesazhe të ndryshme do të linin këdo të zbulonte cilat email-e janë
     * regjistruar te aplikacioni — thjesht duke provuar.
     */
    const okPassword = row && (await verifyPassword(password, row.password_hash));
    if (!okPassword) return res.status(401).json({ error: "Email ose fjalëkalim i pasaktë." });

    /*
     * ⚠️  Kontrolli vjen PAS fjalëkalimit, jo para tij.
     *
     *     Po të vinte para, kushdo do të mësonte cilat email-e janë të
     *     regjistruara: një adresë e panjohur do të kthente "i pasaktë" dhe
     *     një e vërtetë "pa verifikuar". Kështu e mëson vetëm ai që e di edhe
     *     fjalëkalimin — pra vetë i zoti i llogarisë.
     */
    if (!row.email_verified_at) {
      return res.status(403).json({
        error: "Hap email-in dhe kliko link-un e verifikimit para se të hysh.",
        code: "email_unverified",
      });
    }

    const user = await one(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [row.id]);
    res.json({ token: await startSession(row.id), user });
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

/* ---------------------------------------------------------------
   DELETE /auth/me  — fshirje e llogarisë nga vetë përdoruesi
   --------------------------------------------------------------- */

/**
 * Fshin llogarinë dhe çdo gjurmë të saj.
 *
 * ⚠️  NUK KTHEHET MBRAPSHT. Të 20 tabelat që i referohen `users` kanë
 *     `ON DELETE CASCADE`: seancat, medaljet, streak-u, zakonet, gjendjet,
 *     të preferuarat, shkarkimet, krijimet, rrugëtimi, njoftimet, abonimet
 *     dhe pajisjet e push-it ikin bashkë me rreshtin. Prandaj kërkohet
 *     fjalëkalimi edhe pse përdoruesi është tashmë i identifikuar — një
 *     token i vjedhur, ose një telefon i lënë hapur, nuk duhet të mjaftojë.
 *
 * ⚠️  ADMINI NUK FSHIHET NGA APLIKACIONI. Do të mbyllte panelin përgjithmonë,
 *     dhe rikthimi do të kërkonte një `UPDATE` me dorë te phpMyAdmin. Kjo
 *     bëhet me vetëdije te databaza, jo me një prekje te telefoni.
 *
 * ⚠️  ABONIMI TE DYQANI NUK ANULOHET KËTU, dhe nuk anulohet dot: atë e mban
 *     Apple ose Google. Klienti duhet ta thotë hapur para se të pyesë, se
 *     përndryshe përdoruesi fshin llogarinë dhe vazhdon të paguajë.
 */
router.delete("/me", requireAuth, async (req, res, next) => {
  try {
    const { password } = req.body ?? {};

    const user = await one("SELECT id, password_hash, is_admin FROM users WHERE id = ?", [req.userId]);
    if (!user) return res.status(404).json({ error: "Llogaria nuk u gjet." });

    if (user.is_admin) {
      return res.status(403).json({
        error: "Llogaria e administratorit nuk fshihet nga aplikacioni.",
      });
    }

    if (!password || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: "Fjalëkalimi nuk përputhet." });
    }

    await query("DELETE FROM users WHERE id = ?", [req.userId]);

    /* 204: nuk ka më çfarë të kthehet, dhe token-i i klientit sapo u bë i
       pavlefshëm — `requireAuth` nuk e gjen më përdoruesin. */
    res.status(204).end();
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
    res.json({ token: await startSession(row.user_id), user });
  } catch (err) {
    next(err);
  }
});

/* ---------------------------------------------------------------
   POST /auth/verify  — hap llogarinë me token-in nga email-i
   --------------------------------------------------------------- */
/**
 * ⚠️  Hyrja bëhet menjëherë pas verifikimit.
 *
 *     Njeriu sapo provoi se adresa është e tij; një ekran hyrjeje pas kësaj
 *     është hap i kotë, dhe pikërisht aty humbasin regjistrimet.
 *
 * ⚠️  Një token i përdorur dy herë nuk është gabim për përdoruesin.
 *
 *     Klientët e email-it i hapin link-at vetë për t'i kontrolluar, ndaj
 *     token-i mund të jetë konsumuar para se ta prekë njeriu. Prandaj, kur
 *     token-i njihet por është përdorur dhe llogaria është tashmë e
 *     verifikuar, përgjigjja është sukses — jo "link i pavlefshëm".
 */
router.post("/verify", async (req, res, next) => {
  const token = String(req.body?.token ?? "");
  if (token.length !== 64) return res.status(400).json({ error: "Link i pavlefshëm." });

  try {
    const row = await one(
      `SELECT v.id, v.user_id, v.used_at, v.expires_at, u.email_verified_at
         FROM email_verifications v
         JOIN users u ON u.id = v.user_id
        WHERE v.token_hash = ?`,
      [hashToken(token)]
    );

    if (!row) return res.status(400).json({ error: "Link-u ka skaduar ose është përdorur." });

    /* I përdorur, por llogaria është e hapur: njeriu po e klikon dy herë. */
    if (row.used_at && row.email_verified_at) {
      const user = await one(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [row.user_id]);
      return res.json({ token: await startSession(row.user_id), user });
    }

    if (row.used_at || new Date(row.expires_at) <= new Date()) {
      return res.status(400).json({
        error: "Link-u ka skaduar. Kërko një link të ri.",
        code: "expired",
      });
    }

    await query("UPDATE users SET email_verified_at = NOW() WHERE id = ?", [row.user_id]);
    /* Të gjithë token-at e tjerë të kësaj llogarie mbyllen bashkë me të: një
       link i vjetër te posta nuk duhet të mbetet i vlefshëm. */
    await query(
      "UPDATE email_verifications SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
      [row.user_id]
    );

    const user = await one(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [row.user_id]);
    res.json({ token: await startSession(row.user_id), user });
  } catch (err) {
    next(err);
  }
});

/* ---------------------------------------------------------------
   POST /auth/resend  — dërgo përsëri link-un e verifikimit
   --------------------------------------------------------------- */
/**
 * ⚠️  Përgjigjja është E NJËJTA për çdo rast, si te `/auth/forgot`.
 *
 *     Një "kjo llogari nuk ekziston" ose "është verifikuar tashmë" do t'i
 *     tregonte kujtdo cilat adresa janë të regjistruara — dhe kjo formë është
 *     pikërisht vendi ku dikush do të provonte një listë të tërë.
 */
router.post("/resend", async (req, res, next) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();

  const same = () =>
    res.json({ ok: true, message: "Nëse kjo llogari pret verifikim, link-u i ri është nisur." });

  /* Gjendje e serverit, jo e llogarisë — ndaj thuhet hapur. */
  if (!mailer.configured()) {
    return res.status(501).json({
      error: "Dërgimi i email-eve nuk është konfiguruar ende te serveri.",
      code: "not_configured",
    });
  }

  if (!email || !email.includes("@")) return same();

  try {
    const user = await one(
      "SELECT id, name, email, email_verified_at FROM users WHERE email = ?",
      [email]
    );
    if (!user || user.email_verified_at) return same();

    const recent = await one(
      `SELECT id FROM email_verifications
        WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
        ORDER BY created_at DESC LIMIT 1`,
      [user.id, VERIFY_COOLDOWN_SEC]
    );
    if (recent) return same();

    await sendVerification(user, req.ip);
    return same();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
