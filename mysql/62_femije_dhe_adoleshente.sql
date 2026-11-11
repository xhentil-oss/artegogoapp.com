-- ═══════════════════════════════════════════════════════════════
--  "Adoleshentët" zhvendoset te Fëmijët 8–12,
--  dhe dosja riemërtohet "Fëmijë dhe adoleshentë"
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Nga:  Meditime për Zemrën  → Adoleshentët    (nën-grupi "Lidhjet")
--  Te:   Meditime për Trupin  → Fëmijët 8–12    (nën-grupi "Për fëmijë")
--
--  ⚠️  KY SKEDAR KËRKON EDHE NGARKIM FAQEJE. Është i rralli ku SQL-ja
--      nuk mjafton.
--
--      Etiketat e kategorive NUK jetojnë te tabela `categories`; ato rrinë
--      te `src/data/categories.js` dhe lidhen me serverin vetëm me `slug`
--      përmes `CATEGORY_BY_SLUG`. Pa bundle-in e ri, dosja do të vazhdonte
--      të shkruhej "Fëmijët 8–12" te aplikacioni, edhe pse tabela do të
--      thoshte ndryshe.
--
--      Urdhri 1 më poshtë e mban tabelën në të njëjtën gjuhë me kodin.
--
--  ⚠️  ASNJË NGARKIM SKEDARI. Meditimi nuk ka as zë as kopertinë — mbetet
--      vendmbajtës me 10 minuta. Ndryshon vetëm vendi ku rri.
--
--  ⚠️  KATEGORIA "Adoleshentët" ZHDUKET VETVETIU.
--
--      Ishte i vetmi meditim i saj. Te `src/domain/classification.js`:
--
--          CATEGORIES.map(...).filter((c) => c.count > 0)
--
--      Kategoritë bosh nuk vizatohen. Rreshti i saj te `categories` dhe
--      te `src/data/categories.js` mbetet — i padëmshëm, dhe gati po t'i
--      shtohet një ditë diçka.
--
--  ⚠️  NËN-GRUPI bëhet "Për fëmijë", si i gjashtë fqinjëve. Pa këtë, te
--      ndërtuesi i seancave do të dilte një grup "Lidhjet" me një meditim
--      të vetëm brenda Meditimeve për Trupin.
--
--      Nuk prek njoftimet: as "Lidhjet" dhe as "Për fëmijë" nuk janë te
--      ndonjë pishinë te `08_pools.sql`.
--
--  ✓  TITULLI I KARTËS NUK NDRYSHON. Mbetet "Adoleshentët" — ajo që
--     riemërtohet është dosja.
--
--  ✓  PËRSHKRIMI NUK PREKET. "Për moshën kur gjithçka ndihet e madhe.
--     Punon me krahasimin, presionin e grupit dhe zërin e rreptë ndaj
--     vetes, me gjuhë që nuk u flet nga lart adoleshentëve." — i rri
--     saktë, dhe nuk përmend numra.
--
--  Meditime për Zemrën kalon nga 10 në 9; Meditime për Trupin merr një.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  1 — DOSJA RIEMËRTOHET
-- ───────────────────────────────────────────────────────────────

UPDATE categories
   SET name = 'Fëmijë dhe adoleshentë'
 WHERE slug = 'femijet-8-12';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  2 — MEDITIMI ZHVENDOSET
-- ───────────────────────────────────────────────────────────────

UPDATE meditations
   SET technique_id = (SELECT id FROM techniques WHERE slug = 'meditime-per-trupin'),
       category_id  = (SELECT id FROM categories WHERE slug = 'femijet-8-12'),
       subgroup     = 'Për fëmijë'
 WHERE id = '5ecfb1d8-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — dosja e re
-- ───────────────────────────────────────────────────────────────
--  Shtatë rreshta. "Adoleshentët" me 600 s pa kopertinë, "Liro ankthin"
--  me 480 s e me kopertinë, dhe pesë vendmbajtës me 360 s.

SELECT m.title, m.duration_sec, m.subgroup, c.name AS dosja
  FROM meditations m
  JOIN categories c ON c.id = m.category_id
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'meditime-per-trupin'
   AND c.slug = 'femijet-8-12'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE categories SET name = 'Fëmijët 8–12'
--       WHERE slug = 'femijet-8-12';
--
--      UPDATE meditations
--         SET technique_id = (SELECT id FROM techniques WHERE slug = 'meditime-per-zemren'),
--             category_id  = (SELECT id FROM categories WHERE slug = 'adoleshentet'),
--             subgroup     = 'Lidhjet'
--       WHERE id = '5ecfb1d8-a510-11f1-b99e-107c614af9b1';
--
--  Dhe te `src/data/categories.js`, rreshti 42 kthehet te etiketa e vjetër,
--  pastaj ndërtohet e ngarkohet sërish faqja.
