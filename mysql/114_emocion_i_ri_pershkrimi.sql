-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Sill një emocion të ri"
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
         'Mos lejo që rrethanat e jashtme të përcaktojnë mënyrën se si ndihesh. Zbulo fuqinë që ke për të ndryshuar gjendjen tënde emocionale dhe për të krijuar vetë emocionet që dëshiron të përjetosh.',
         '\n\n', 'Përmes këtij meditimi do të shkëputesh nga emocionet e stresit, frikës apo shqetësimit dhe do të zgjedhësh me vetëdije një emocion të ri, si dashuria, gëzimi, falënderimi apo qetësia.',
         '\n\n', 'Do të aktivizosh këtë ndjenjë brenda vetes, duke e lejuar të përhapet në gjithë trupin dhe të ndryshojë mënyrën se si mendon dhe përjeton momentin e tanishëm.',
         '\n\n', 'Do të kuptosh se nuk ke nevojë të presësh që jeta të ndryshojë për t’u ndier ndryshe. Ndryshimi fillon brenda teje.'
       ),
       benefits = CONCAT(
         'Çlirim nga emocionet e padëshiruara',
         '\n', 'Aktivizim të emocioneve pozitive',
         '\n', 'Më shumë kontroll të vetëdijshëm mbi gjendjen emocionale'
       )
 WHERE id = '5ec89463-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec89463-a510-11f1-b99e-107c614af9b1';
