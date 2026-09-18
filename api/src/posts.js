const { query } = require("./db");

/**
 * ═══════════════════════════════════════════════════════════════
 *  POSTIMET — pjesët e përbashkëta mes feed-it dhe listave personale
 * ═══════════════════════════════════════════════════════════════
 *
 * Feed-i (`/content/feed`) dhe të ruajturat (`/me/post-saves`) kthejnë TË
 * NJËJTËN formë postimi, sepse te aplikacioni i vizaton i njëjti komponent
 * (`PostCard`). Po t'i shkruanim veç, do të mjaftonte një kolonë e harruar në
 * njërën anë që postimet e ruajtura të dukeshin gjysmake — pa median, ose pa
 * meditimin e bashkangjitur — dhe shkaku nuk do të dukej nga pamja.
 */

/**
 * Kolonat e një postimi, me meditimin e bashkangjitur nga `JOIN`.
 *
 * ⚠️  `reaction_count` NUMËROHET, jo lexohet nga kolona e postimit.
 *
 *     Kolonën e mban trigger-i `trg_reaction_ins`/`trg_reaction_del`
 *     (`mysql/02_triggers.sql`), dhe kur ai punon, të dyja dalin njësoj. Por
 *     nëse ai mungon te një databazë — ose nëse rreshtat u prekën me dorë nga
 *     phpMyAdmin, ku trigger-i nuk rrjedh — kolona ngec, dhe numri te feed-i
 *     do të tregonte zero ndërsa pëlqimet rrinë te tabela. Numërimi mbi një
 *     kolonë me indeks (`idx_reactions_post`) kushton pak për 50 postime dhe
 *     nuk gënjen kurrë.
 */
const POST_FIELDS = `
  p.id, p.author_name, p.author_avatar_url, p.author_role, p.is_verified,
  p.post_type, p.text_content, p.media_url, p.media_type,
  (SELECT COUNT(*) FROM post_reactions rc WHERE rc.post_id = p.id) AS reaction_count,
  p.comment_count, p.published_at,
  m.id AS meditation_id, m.title AS meditation_title, m.duration_sec`;

/**
 * "A e pëlqeva" dhe "a e ruajta" — për këtë përdorues, ose zero.
 *
 * ⚠️  Pa këto dy flamurë, aplikacioni nuk e di dot sa është numri i pëlqimeve
 *     PA pëlqimin tim: `reaction_count` e përmban tashmë, ndaj një "+1" lokal
 *     do ta numëronte dy herë sapo faqja rifreskohej. Shih `PostCard`.
 *
 * @param {string|null} userId nga token-i (`req.userId`), kurrë nga kërkesa
 * @returns {{ sql: string, params: string[] }}
 */
function flagsFor(userId) {
  if (!userId) return { sql: "0 AS liked, 0 AS saved", params: [] };
  return {
    sql: `EXISTS (SELECT 1 FROM post_reactions r WHERE r.post_id = p.id AND r.user_id = ?) AS liked,
          EXISTS (SELECT 1 FROM post_saves    s WHERE s.post_id = p.id AND s.user_id = ?) AS saved`,
    params: [userId, userId],
  };
}

/**
 * Bashkëngjit karuselin te një listë postimesh, në vend.
 *
 * ⚠️  Një kërkesë e dytë, JO `JOIN`: me `JOIN` një postim me katër imazhe do
 *     të kthehej katër herë, dhe `LIMIT 20` do të numëronte rreshtat e medias
 *     në vend të postimeve — faqja e parë do të kishte pesë postime.
 *
 * ⚠️  Tabela mund të mos ekzistojë (migrimi `14_post_media.sql` i parrjedhur).
 *     Atëherë postimet kthehen me median e vjetër, siç ishin: një veçori e re
 *     nuk duhet ta rrëzojë atë që punonte.
 */
async function attachMedia(posts) {
  if (posts.length === 0) return posts;

  const ids = posts.map((p) => p.id);
  try {
    const rows = await query(
      `SELECT post_id, media_url, media_type, position
         FROM community_post_media
        WHERE post_id IN (${ids.map(() => "?").join(",")})
        ORDER BY post_id, position`,
      ids
    );

    const sipasPostimit = new Map();
    for (const rresht of rows) {
      if (!sipasPostimit.has(rresht.post_id)) sipasPostimit.set(rresht.post_id, []);
      sipasPostimit.get(rresht.post_id).push({ url: rresht.media_url, type: rresht.media_type });
    }

    for (const post of posts) post.media = sipasPostimit.get(post.id) ?? [];
  } catch (err) {
    if (err?.code !== "ER_NO_SUCH_TABLE") throw err;
    console.warn("[artegogo] `community_post_media` mungon — postimet vazhdojnë me median e vjetër.");
  }

  return posts;
}

module.exports = { POST_FIELDS, flagsFor, attachMedia };
