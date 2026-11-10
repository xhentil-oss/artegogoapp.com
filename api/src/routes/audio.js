const express = require("express");
const crypto = require("node:crypto");
const { one } = require("../db");
const { requireAuth, canAccessAudio } = require("../auth");

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

/*
 * GET /audio/:meditationId — kthen lidhjen, ose 402 nëse duhet abonim.
 *
 * ⚠️  VIDEOJA KA PËRPARËSI mbi audion, kur të dyja ekzistojnë.
 *
 *     Një meditim me video e ka zërin brenda vetë skedarit; po të luanim
 *     audion veçmas, do të dëgjoheshin të dy njëherësh, me pak çaste
 *     shmangie mes tyre. Ndaj zgjidhet njëra, dhe `kind` i thotë
 *     aplikacionit cilën mori — që të dijë nëse duhet treguar figura apo
 *     disku i zakonshëm.
 *
 *     Rruga mbetet e njëjta (`/audio/:id`) me qëllim: abonimi, nënshkrimi dhe
 *     skadimi janë tashmë këtu, të provuara. Një rrugë e dytë `/video/:id`
 *     do t'i kopjonte të treja — dhe kopja e dytë e një porte abonimi është
 *     pikërisht ajo që harrohet kur ndryshon rregulli.
 */
router.get("/:meditationId", requireAuth, async (req, res, next) => {
  try {
    const row = await one(
      "SELECT id, title, audio_url, video_url, is_premium, published_at FROM meditations WHERE id = ?",
      [req.params.meditationId]
    );

    if (!row || !row.published_at) return res.status(404).json({ error: "Meditimi nuk u gjet." });

    const kind = row.video_url ? "video" : "audio";
    const path = row.video_url || row.audio_url;
    if (!path) return res.status(404).json({ error: "Media ende nuk është ngarkuar." });

    if (row.is_premium && !canAccessAudio(req.user)) {
      /* 402 Payment Required — aplikacioni e njeh dhe hap paywall-in. */
      return res.status(402).json({ error: "Ky meditim kërkon abonim.", requiresSubscription: true });
    }

    res.json({
      url: signedUrl(path, req.userId),
      kind,
      expires_in: LINK_TTL_SEC,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
