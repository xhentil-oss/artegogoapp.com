-- ═══════════════════════════════════════════════════════════════
--  VIZUALIZIM PËR BOLLËK — meditim i ri
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Vizualizim" → "Ndiej bollëkun", pranë "Meditim për të marrë bekime".
--
--  ⚠️  SHTIM, JO ZËVENDËSIM. Këtu krijohet rresht i ri — asnjë meditim
--      ekzistues nuk preket. Vizualizimi kalon nga 16 në 17 meditime, dhe
--      kategoria "Ndiej bollëkun" nga 7 në 8.
--
--      Deri tani çdo meditim i vërtetë ishte marrë duke rimarrë një
--      vendmbajtës. Këtu nuk ka vendmbajtës bollëku te Vizualizimi për
--      t'u rimarrë, dhe të marrësh një nga "Jeta ideale" do të thoshte
--      të hiqje një titull që klientja nuk kërkoi ta heqë.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--
--  ⚠️  `id` NUK SHKRUHET. Kolona e ka `DEFAULT (UUID())` te skema, ndaj
--      MySQL-ja e prodhon vetë. Një id i shkruar me dorë do të rrezikonte
--      përplasje me çelësin parësor.
--
--  ⚠️  `is_premium = 1` si të gjitha të tjerat. Shih `mysql/12_no_free.sql`:
--      modeli nuk njeh meditime falas, dhe një përjashtim i vetëm do të
--      bëhej vrimë te porta e abonimit.
--
--  Nën-grupi `Ndërgjegje e lartë` është i njëjti me të motrës së tij te
--  ajo kategori ("Meditim për të marrë bekime") dhe me të gjashtë
--  vizualizimet e vërteta. Nën-grupi nuk shihet te dosja — përdoret nga
--  ndërtuesi i seancave dhe nga pishinat e ditës — por po t'i jepja një
--  emër të ri, ky meditim do të dilte vetëm te një grup i vetin.
--
--  Përshkrimi mbetet bosh derisa klientja ta dërgojë. Pa të, fletja
--  shkruan "Vizualizim për bollëk — praktikë e udhëhequr nga Arte Gogo."
--
--  Kohëzgjatja: 330 sekonda (5 min 30 s). E numëruar kornizë për kornizë
--  nga vetë mp3-ja — 13 752 korniza × 1152 mostra ÷ 48 000 Hz.
--  Karta do të shkruajë "6 min".
--
--  I sigurt për t'u ri-rrotulluar: `NOT EXISTS` mbi titullin e ndal
--  dyfishimin. Po e rrotullove dy herë, e dyta prek 0 rreshta.

SET NAMES utf8mb4;

INSERT INTO meditations
  (title, subgroup, technique_id, category_id, duration_sec,
   audio_url, cover_url, is_premium, is_block, narrator, published_at)
SELECT t.title, t.subgroup, tec.id, cat.id, t.duration_sec,
       t.audio_url, t.cover_url, 1, 0, 'Arte Gogo', NOW()
  FROM (
    SELECT 'Vizualizim për bollëk'                            AS title,
           'Ndërgjegje e lartë'                               AS subgroup,
           'vizualizim'                                       AS technique_slug,
           'bolleku'                                          AS category_slug,
           330                                                AS duration_sec,
           'meditime/vizualizim/vizualizim-per-bollek.mp3'    AS audio_url,
           '/kopertina/vizualizim-per-bollek.jpeg'            AS cover_url
  ) AS t
  JOIN techniques tec ON tec.slug = t.technique_slug
  JOIN categories cat ON cat.slug = t.category_slug
 WHERE NOT EXISTS (
   SELECT 1 FROM meditations m WHERE m.title = t.title AND m.is_block = 0
 );

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — kategoria "Ndiej bollëkun" te Vizualizimi
-- ───────────────────────────────────────────────────────────────
--  Duhen 2 rreshta: "Meditim për të marrë bekime" dhe i riu.

SELECT m.title, m.duration_sec, m.audio_url, m.cover_url, m.published_at
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
  JOIN categories c ON c.id = m.category_id
 WHERE t.slug = 'vizualizim'
   AND c.slug = 'bolleku'
   AND m.is_block = 0
 ORDER BY m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA HEQËSH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--  Ky është i vetmi rresht që u krijua sot nga e para; fshirja e tij
--  nuk prek asgjë tjetër.
--
--      DELETE FROM meditations
--       WHERE title = 'Vizualizim për bollëk' AND is_block = 0;
--
--  Ose, për ta fshehur pa e fshirë:
--      UPDATE meditations SET published_at = NULL
--       WHERE title = 'Vizualizim për bollëk' AND is_block = 0;
