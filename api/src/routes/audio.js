const express = require("express");
const crypto = require("node:crypto");
const { one } = require("../db");
const { requireAuth, hasPremium } = require("../auth");

const router = express.Router();

/**
 * AKSESI TE AUDIO — porta e vërtetë e abonimit.
 *
 * Metadata e meditimeve është publike (biblioteka duhet t'i tregojë të gjitha
 * me dryn). Ajo që mbrohet është skedari: `audio_url` nuk kthehet nga asnjë
 * rrugë tjetër, dhe këtu jepet vetëm pasi kontrollohet abonimi.
 *
 * ⚠️  Nënshkrimi këtu është për skedarë të vendosur te vetë serveri. Nëse
 *     audio kalon te një shërbim jashtë (Bunny, R2, S3) — gjë e këshillueshme
 *     për 1,2 GB përmbajtje — zëvendësohet vetëm `signedUrl()`.
 */

/** Sa gjatë vlen një lidhje. E shkurtër me qëllim: lidhjet ndahen. */
const LINK_TTL_SEC = Number(process.env.AUDIO_TTL_SEC || 3600);

function signedUrl(path, userId) {
  const secret = process.env.AUDIO_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUDIO_SECRET mungon ose është nën 32 shenja.");
  }

  const expires = Math.floor(Date.now() / 1000) + LINK_TTL_SEC;
  /*
   * `userId` hyn te nënshkrimi që një lidhje e kopjuar të mos vlejë për
   * llogari tjetër — dhe që abuzimi të gjurmohet te burimi.
   */
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${path}:${expires}:${userId}`)
    .digest("hex");

  const base = process.env.AUDIO_BASE_URL || "";
  return `${base}/${path}?expires=${expires}&u=${userId}&sig=${signature}`;
}

/* GET /audio/:meditationId — kthen lidhjen, ose 402 nëse duhet abonim. */
router.get("/:meditationId", requireAuth, async (req, res, next) => {
  try {
    const row = await one(
      "SELECT id, title, audio_url, is_premium, published_at FROM meditations WHERE id = ?",
      [req.params.meditationId]
    );

    if (!row || !row.published_at) return res.status(404).json({ error: "Meditimi nuk u gjet." });
    if (!row.audio_url) return res.status(404).json({ error: "Audio ende nuk është ngarkuar." });

    if (row.is_premium && !hasPremium(req.user)) {
      /* 402 Payment Required — aplikacioni e njeh dhe hap paywall-in. */
      return res.status(402).json({ error: "Ky meditim kërkon abonim.", requiresSubscription: true });
    }

    res.json({
      url: signedUrl(row.audio_url, req.userId),
      expires_in: LINK_TTL_SEC,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
