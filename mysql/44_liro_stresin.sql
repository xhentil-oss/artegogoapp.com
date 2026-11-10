-- ═══════════════════════════════════════════════════════════════
--  "STRES" → "LIRO STRESIN", dhe një meditim i ri te kjo kategori
-- ═══════════════════════════════════════════════════════════════
--
--  10 nëntor 2026.
--
--  ⚠️  EMRI QË SHEH PËRDORUESI NUK VJEN NGA KËTU.
--
--      Etiketat e kategorive rrinë te `src/data/categories.js` dhe
--      lidhen me serverin vetëm me `slug`. Ky UPDATE i mban të dyja
--      në një fjalë — por pa ngarkimin e faqes, ekrani do të vazhdojë
--      të thotë "Stres".
--
--  ⚠️  `slug` NUK ndryshon. Ai është ura mes serverit dhe kodit: po ta
--      bënim `liro-stresin`, të 5 meditimet do të mbeteshin pa kategori
--      te aplikacioni, sepse `CATEGORY_BY_SLUG['stres']` nuk do të
--      gjendej më. Emri është për njerëzit, slug-u për makinat.

SET NAMES utf8mb4;

-- ── Emri i kategorisë ──────────────────────────────────────────

UPDATE categories
   SET name = 'Liro stresin'
 WHERE slug = 'stres';

-- ── "Qetësohu pas një konflikti" kalon te kjo kategori ─────────
--
--  ⚠️  KALON, NUK SHTOHET.
--
--      `meditations.category_id` është një kolonë e vetme: një meditim
--      i takon një kategorie. Ky meditim ndodhej te "Përmirësimi i
--      marrëdhënieve" dhe nga tani nuk do të duket më atje.
--
--      Po të duhej te të dyja, do të duhej një tabelë lidhëse
--      (`meditation_categories`) dhe ndryshim te `content.js` — jo ky
--      UPDATE.

UPDATE meditations
   SET category_id = (SELECT id FROM categories WHERE slug = 'stres')
 WHERE id = '5ed099cc-a510-11f1-b99e-107c614af9b1';

-- Kontroll: 6 meditime, dhe "Qetësohu pas një konflikti" mes tyre.
SELECT m.id, m.title, c.name AS kategoria
  FROM meditations m
  JOIN categories c ON c.id = m.category_id
 WHERE c.slug = 'stres'
 ORDER BY m.title;
