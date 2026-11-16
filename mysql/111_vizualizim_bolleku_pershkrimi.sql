-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Vizualizim për bollëk"
--  13 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Teksti i klientes. Zëvendëson rreshtin e vjetër njëfjalësh dhe përfitimet
--  e gjeneruara nga `benefitsFor(intent)` te `domain/benefits.js` — ato
--  dilnin të njëjta për çdo meditim me të njëjtin qëllim.
--
--  ✓  VETËM SQL. Pa ndërtim faqeje, pa Restart Node-i.
--
--  ✓  Paragrafët ndahen me \n\n, përfitimet me \n të vetëm — ashtu i pret
--     `splitBenefits()` te `services/catalog.js`.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Krijo brenda vetes ndjenjën e bollëkut dhe fillo ta përjetosh që tani realitetin që dëshiron të ndërtosh.',
         '\n\n', 'Përmes këtij meditimi do të përdorësh fuqinë e vizualizimit për të imagjinuar veten duke jetuar një jetë të mbushur me mundësi, sukses, dashuri dhe mirëqenie.',
         '\n\n', 'Do të lidhesh me emocionet që do të përjetoje nëse dëshirat e tua do të ishin realizuar tashmë, duke aktivizuar ndjenjat e falënderimit, gëzimit dhe sigurisë së brendshme.',
         '\n\n', 'Në vend që të përqendrohesh tek ajo që të mungon, do të fillosh të mendosh, të ndjesh dhe të veprosh nga një gjendje plotësie dhe bollëku.'
       ),
       benefits = CONCAT(
         'Ndjenjë bollëku, plotësie dhe falënderimi',
         '\n', 'Qartësi për realitetin që dëshiron të krijosh',
         '\n', 'Besim, frymëzim dhe motivim për të realizuar dëshirat e tua'
       )
 WHERE id = 'f67c48c6-ddb3-11f1-af71-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = 'f67c48c6-ddb3-11f1-af71-107c614af9b1';
