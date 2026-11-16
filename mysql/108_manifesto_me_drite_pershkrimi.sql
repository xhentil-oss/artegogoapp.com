-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Meditim për të manifestuar me dritë"
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
         'Përdor fuqinë e vizualizimit dhe simbolikën e dritës për t’u lidhur me realitetin që dëshiron të krijosh.',
         '\n\n', 'Përmes këtij meditimi do të imagjinosh një dritë të fuqishme që të mbush me energji, qartësi dhe besim, ndërsa i jep formë dëshirave dhe qëllimeve të tua më të thella.',
         '\n\n', 'Do të vizualizosh të ardhmen që dëshiron, duke e përjetuar emocionalisht sikur ajo të ishte tashmë pjesë e jetës sate.',
         '\n\n', 'Do të lëshosh dyshimet dhe frikën, duke kultivuar ndjenjat e falënderimit, dashurisë dhe sigurisë që të mbështesin të ecësh drejt ëndrrave të tua.'
       ),
       benefits = CONCAT(
         'Lidhje të thellë me dëshirat dhe qëllimet e tua',
         '\n', 'Besim, qartësi dhe energji pozitive',
         '\n', 'Frymëzim dhe motivim për të krijuar realitetin që dëshiron'
       )
 WHERE id = '73b9df5f-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '73b9df5f-ab5c-11f1-97ee-107c614af9b1';
