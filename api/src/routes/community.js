const express = require("express");
const { query, one } = require("../db");
const { requireAuth, requireAdmin } = require("../auth");

/**
 * ═══════════════════════════════════════════════════════════════
 *  KOMUNITETI — postimet (seksioni 6.6)
 * ═══════════════════════════════════════════════════════════════
 *
 * Leximi është publik (`GET /content/feed`, te `content.js`); shkrimi i takon
 * VETËM admin-it.
 *
 * ⚠️  Kufizimi zbatohet KËTU, jo te ekrani.
 *
 *     Fshehja e kutisë së shkrimit nga përdoruesit e zakonshëm është vetëm
 *     pamje: kushdo mund të dërgojë një kërkesë me dorë. `requireAdmin` është
 *     ai që e ndalon vërtet — dhe pa të, feed-i i komunitetit do të mbushej me
 *     çfarëdo, nën emrin "Arte Gogo".
 */

const admin = express.Router();
admin.use(requireAuth, requireAdmin);

/**
 * Etiketat e aplikacionit ↔ enum-i i databazës.
 *
 * Databaza mban vlera pa theks dhe të qëndrueshme; ekrani mban ato që lexon
 * njeriu. Përkthimi bëhet vetëm këtu, që asnjëra anë të mos varet nga tjetra.
 */
const TYPE_TO_DB = {
  "Frymëzim": "frymezim",
  "Njoftim": "njoftim",
  "Perceptim": "informacion",
  "Meditim": "meditim",
};

const MAX_TEXT = 4000;

admin.post("/posts", async (req, res, next) => {
  const {
    text,
    type = "Frymëzim",
    author = "Arte Gogo",
    role = "Arte Gogo",
    meditationId = null,
    mediaUrl = null,
    mediaType = null,
  } = req.body ?? {};

  const body = String(text ?? "").trim();
  if (!body) return res.status(400).json({ error: "Postimi nuk mund të jetë bosh." });
  if (body.length > MAX_TEXT) return res.status(400).json({ error: "Postimi është tepër i gjatë." });

  /* Media pa lloj nuk vizatohet dot; kufizimi `chk_post_media` e refuzon
     gjithsesi, por një 400 me shpjegim është më i dobishëm se një 500. */
  if (Boolean(mediaUrl) !== Boolean(mediaType)) {
    return res.status(400).json({ error: "Media kërkon edhe URL-në edhe llojin." });
  }
  if (mediaType && !["image", "video"].includes(mediaType)) {
    return res.status(400).json({ error: "Lloj media i panjohur." });
  }

  /* Një postim me meditim të bashkangjitur është i llojit 'meditim', pavarësisht
     etiketës së zgjedhur — kështu feed-i mund t'i filtrojë ato veç. */
  const dbType = meditationId ? "meditim" : (TYPE_TO_DB[type] ?? "frymezim");

  try {
    if (meditationId) {
      const found = await one("SELECT id FROM meditations WHERE id = ?", [meditationId]);
      if (!found) return res.status(400).json({ error: "Meditimi nuk u gjet." });
    }

    const { id } = await one("SELECT UUID() AS id");
    await query(
      `INSERT INTO community_posts
         (id, author_name, author_role, post_type, text_content,
          media_url, media_type, meditation_id, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, String(author).slice(0, 120), String(role).slice(0, 120), dbType, body,
       mediaUrl, mediaType, meditationId]
    );

    res.status(201).json(
      await one(
        `SELECT p.id, p.author_name, p.author_role, p.is_verified, p.post_type,
                p.text_content, p.media_url, p.media_type, p.reaction_count,
                p.comment_count, p.published_at, p.meditation_id
           FROM community_posts p WHERE p.id = ?`,
        [id]
      )
    );
  } catch (err) {
    next(err);
  }
});

/**
 * Fsheh një postim.
 *
 * ⚠️  `is_published = 0`, JO fshirje. Postimet mbajnë reagime dhe komente të
 *     njerëzve; fshirja do t'i merrte me vete (`ON DELETE CASCADE`) dhe nuk do
 *     të kthehej dot. Një postim i hequr gabimisht duhet të rikthehet.
 */
admin.delete("/posts/:id", async (req, res, next) => {
  try {
    const result = await query(
      "UPDATE community_posts SET is_published = 0 WHERE id = ?",
      [req.params.id]
    );
    if ((result.affectedRows ?? 0) === 0) {
      return res.status(404).json({ error: "Postimi nuk u gjet." });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** Rikthen një postim të fshehur. */
admin.post("/posts/:id/restore", async (req, res, next) => {
  try {
    await query("UPDATE community_posts SET is_published = 1 WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** Të gjitha postimet, edhe të fshehurat — vetëm paneli i sheh kështu. */
admin.get("/posts", async (_req, res, next) => {
  try {
    res.json(
      await query(
        `SELECT id, author_name, author_role, post_type, text_content,
                media_url, media_type, meditation_id, reaction_count,
                comment_count, is_published, published_at
           FROM community_posts ORDER BY published_at DESC LIMIT 100`
      )
    );
  } catch (err) {
    next(err);
  }
});

module.exports = { adminRoutes: admin, TYPE_TO_DB };
