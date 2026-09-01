const express = require("express");
const { query, one } = require("../db");
const { requireAuth } = require("../auth");
const push = require("../push");

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════
 *  REGJISTRIMI I PAJISJEVE PËR NJOFTIME
 * ═══════════════════════════════════════════════════════════════
 *
 * Shfletuesi krijon abonimin; serveri e ruan dhe e përdor për të dërguar.
 * Çelësi publik VAPID i duhet shfletuesit para se t'i kërkojë përdoruesit
 * lejen — prandaj jepet pa hyrje.
 */

/** Çelësi publik. Publik me qëllim: pa të, shfletuesi nuk mund të abonohet. */
router.get("/push/key", (_req, res) => {
  const key = push.publicKey();
  if (!key) {
    return res.status(501).json({
      error: "Njoftimet nuk janë konfiguruar ende te serveri.",
      code: "not_configured",
    });
  }
  res.json({ key });
});

const me = express.Router();
me.use(requireAuth);

/** Nga vjen kjo kërkesë — vetëm për diagnostikë, jo për vendime. */
function detectPlatform(ua = "") {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Mozilla|Chrome|Safari/i.test(ua)) return "desktop";
  return "unknown";
}

/**
 * Ruan abonimin.
 *
 * ⚠️  `ON DUPLICATE KEY` mbi `endpoint`: i njëjti shfletues mund të abonohet
 *     përsëri (pas rifreskimit të lejes, ose pasi çelësat rrotullohen), dhe
 *     atëherë duhet PËRDITËSUAR — jo shtuar një rresht i dytë. Përndryshe një
 *     përdorues i vetëm do të merrte të njëjtin njoftim tri herë.
 *
 *     Kalon edhe `user_id`: nëse te e njëjta pajisje hyn një llogari tjetër,
 *     njoftimet duhet t'i shkojnë atij që është brenda tani.
 */
me.post("/push/subscribe", async (req, res, next) => {
  const { endpoint, keys } = req.body ?? {};
  if (!endpoint || typeof endpoint !== "string" || endpoint.length > 500) {
    return res.status(400).json({ error: "`endpoint` i pavlefshëm." });
  }
  if (!keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Mungojnë çelësat e pajisjes." });
  }

  try {
    const ua = String(req.get("user-agent") ?? "").slice(0, 255);
    await query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth_key, platform, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id), p256dh = VALUES(p256dh), auth_key = VALUES(auth_key),
         platform = VALUES(platform), user_agent = VALUES(user_agent),
         is_active = 1, last_error = NULL`,
      [req.userId, endpoint, keys.p256dh, keys.auth, detectPlatform(ua), ua]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/** Heq abonimin — kur përdoruesi i fik njoftimet ose shkëputet. */
me.delete("/push/subscribe", async (req, res, next) => {
  try {
    const { endpoint } = req.body ?? {};
    if (endpoint) {
      await query("DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?", [
        req.userId,
        endpoint,
      ]);
    } else {
      await query("DELETE FROM push_subscriptions WHERE user_id = ?", [req.userId]);
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** Sa pajisje janë të regjistruara — që ekrani të tregojë gjendjen e vërtetë. */
me.get("/push/status", async (req, res, next) => {
  try {
    const row = await one(
      `SELECT COUNT(*) AS active,
              SUM(platform = 'ios') AS ios,
              MAX(last_sent_at) AS last_sent
         FROM push_subscriptions WHERE user_id = ? AND is_active = 1`,
      [req.userId]
    );
    res.json({
      configured: push.configured(),
      devices: Number(row?.active) || 0,
      ios: Number(row?.ios) || 0,
      lastSent: row?.last_sent ?? null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Dërgon një njoftim provë te pajisjet e vetë përdoruesit.
 *
 * Ekziston sepse pyetja "a punojnë njoftimet?" nuk ka përgjigje tjetër të
 * besueshme: leja mund të jetë dhënë, abonimi i ruajtur, dhe përsëri asgjë të
 * mos mbërrijë — nëse çelësat VAPID nuk përputhen ose Service Worker-i nuk
 * është regjistruar. Kjo rrugë e provon të gjithë rrugën.
 */
me.post("/push/test", async (req, res, next) => {
  try {
    const result = await push.sendToUser(req.userId, {
      title: "Arte Gogo",
      body: "Njoftimet punojnë. Këtu do të vijnë kujtesat e tua.",
      tag: "test",
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = { publicRoutes: router, meRoutes: me };
