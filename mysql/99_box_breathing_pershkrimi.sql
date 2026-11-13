-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Box breathing"
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
         'Rikthe qetësinë, ekuilibrin dhe kontrollin mbi reagimet e tua përmes fuqisë së frymëmarrjes.',
         '\n\n', 'Në këtë praktikë do të ndjekësh një ritëm të thjeshtë: 4 sekonda thithje, 4 sekonda mbajtje të frymës, 4 sekonda nxjerrje dhe 4 sekonda pauzë.',
         '\n\n', 'Ky ritëm i qëndrueshëm të ndihmon të qetësosh sistemin nervor, të largosh vëmendjen nga mendimet shqetësuese dhe të rikthehesh në momentin e tanishëm.',
         '\n\n', 'Me çdo cikël frymëmarrjeje do të krijosh më shumë hapësirë mes vetes dhe stresit, duke kultivuar një gjendje qetësie, përqendrimi dhe stabiliteti të brendshëm.'
       ),
       benefits = CONCAT(
         'Qetësim të sistemit nervor dhe reduktim të stresit',
         '\n', 'Më shumë fokus dhe qartësi mendore',
         '\n', 'Ekuilibër dhe stabilitet emocional'
       )
 WHERE id = '5ecc1a98-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecc1a98-a510-11f1-b99e-107c614af9b1';
