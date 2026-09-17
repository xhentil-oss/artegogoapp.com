const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { requireAuth, requireAdmin } = require("../auth");

/**
 * ═══════════════════════════════════════════════════════════════
 *  NGARKIMI I MEDIAS — imazhet dhe videot e postimeve
 * ═══════════════════════════════════════════════════════════════
 *
 * `POST /admin/media` pranon një skedar dhe kthen adresën e tij publike.
 * Paneli e përdor atë adresë te `mediaUrl` i postimit.
 *
 * ⚠️  Skedari NUK shkon te databaza. MySQL nuk është vend për 40MB video; aty
 *     ruhet vetëm adresa. Skedari shkruhet te një dosje e serverit, që
 *     shërbehet nga Apache si çdo imazh tjetër.
 *
 * ⚠️  Dy variabla mjedisi e bëjnë këtë rrugë të punojë, dhe pa to ajo kthen
 *     503 me shpjegim — jo 500, dhe pa e rrëzuar API-në:
 *
 *       MEDIA_DIR       rruga NË DISK ku shkruhen skedarët
 *                       (p.sh. /home/<user>/public_html/media)
 *       MEDIA_BASE_URL  parashtesa PUBLIKE e së njëjtës dosje
 *                       (p.sh. https://app.drartegogo.com/media)
 *
 *     Të dyja tregojnë të njëjtin vend, njëra nga disku, tjetra nga interneti.
 *     Nëse dosja nuk është nën `public_html`, Apache nuk e shërben dot.
 */

/**
 * `multer` ngarkohet me kujdes.
 *
 * ⚠️  Po të mungonte (skedarët u ngarkuan te cPanel pa `npm install`), një
 *     `require` i thjeshtë do ta rrëzonte nisjen e TËRË API-së — pra do të
 *     binte edhe hyrja, edhe katalogu, për shkak të një veçorie të vetme.
 *     Këtu mungesa shndërrohet në një rrugë që shpjegon çfarë mungon.
 */
let multer = null;
let arsyeja = null;
try {
  multer = require("multer");
} catch {
  arsyeja = "Biblioteka `multer` nuk është instaluar te serveri (npm install).";
}

const LLOJET = {
  "image/jpeg": { ext: ".jpg", kind: "image" },
  "image/png": { ext: ".png", kind: "image" },
  "image/webp": { ext: ".webp", kind: "image" },
  "image/gif": { ext: ".gif", kind: "image" },
  "video/mp4": { ext: ".mp4", kind: "video" },
  "video/webm": { ext: ".webm", kind: "video" },
  "video/quicktime": { ext: ".mov", kind: "video" },
};

/** 64MB — sa një video e shkurtër vertikale, jo sa një film. */
const MAX_BYTES = Number(process.env.MEDIA_MAX_MB || 64) * 1024 * 1024;

const dir = () => process.env.MEDIA_DIR || "";
const baseUrl = () => (process.env.MEDIA_BASE_URL || "").replace(/\/+$/, "");

/** Çfarë i mungon vendosjes, ose `null` kur gjithçka është në rregull. */
function mungesa() {
  if (arsyeja) return arsyeja;
  if (!dir() || !baseUrl()) return "MEDIA_DIR dhe MEDIA_BASE_URL nuk janë vendosur te cPanel.";
  return null;
}

/**
 * Emër i sigurt skedari.
 *
 * ⚠️  Emri origjinal NUK përdoret ashtu siç vjen. Ai mund të përmbajë `../`,
 *     shenja që Apache i trajton veçmas, ose thjesht shkronja shqipe që
 *     ndërrohen nga sistemi i skedarëve. Mbahet vetëm si prapashtesë e
 *     lexueshme, e pastruar; unike e bën koha plus tetë shenja rastësore.
 */
function emriSkedarit(original, ext) {
  const rrenja = path
    .basename(original || "media", path.extname(original || ""))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "media";

  return `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}-${rrenja}${ext}`;
}

const adminRoutes = express.Router();
adminRoutes.use(requireAuth, requireAdmin);

/**
 * Ngarkuesi ndërtohet për çdo kërkesë, jo një herë te ngarkimi i modulit:
 * `MEDIA_DIR` mund të vendoset te cPanel pa u rinisur aplikacioni menjëherë,
 * dhe një ngarkues i ngrirë do ta injoronte atë derisa serveri të rinisej.
 */
function ngarkuesi() {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdir(dir(), { recursive: true }, (err) => cb(err, dir()));
    },
    filename: (_req, file, cb) => {
      const lloji = LLOJET[file.mimetype];
      cb(null, emriSkedarit(file.originalname, lloji.ext));
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (!LLOJET[file.mimetype]) {
        cb(new Error(`Lloj skedari i papranuar: ${file.mimetype}`));
        return;
      }
      cb(null, true);
    },
  }).single("file");
}

adminRoutes.post("/media", (req, res) => {
  const pengesa = mungesa();
  if (pengesa) return res.status(503).json({ error: pengesa });

  ngarkuesi()(req, res, (err) => {
    if (err) {
      /* Madhësia e tepruar nuk është defekt serveri — është përgjigje. */
      const tepruar = err.code === "LIMIT_FILE_SIZE";
      return res.status(tepruar ? 413 : 400).json({
        error: tepruar
          ? `Skedari e kalon kufirin prej ${Math.round(MAX_BYTES / 1024 / 1024)}MB.`
          : err.message,
      });
    }

    if (!req.file) return res.status(400).json({ error: "Nuk erdhi asnjë skedar." });

    const lloji = LLOJET[req.file.mimetype];
    res.status(201).json({
      url: `${baseUrl()}/${req.file.filename}`,
      type: lloji.kind,
      bytes: req.file.size,
    });
  });
});

/** Gjendja e vendosjes — paneli e lexon që të thotë ÇFARË mungon. */
adminRoutes.get("/media/status", (_req, res) => {
  const pengesa = mungesa();
  res.json({ ready: !pengesa, reason: pengesa, maxMB: Math.round(MAX_BYTES / 1024 / 1024) });
});

module.exports = { adminRoutes };
