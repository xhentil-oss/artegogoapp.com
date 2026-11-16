-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Rikthe koherencën e zemrës me frymëmarrje 5x5"
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
         'Rikthe harmoninë mes zemrës, trurit dhe trupit përmes një prej teknikave më të thjeshta dhe të fuqishme të frymëmarrjes.',
         '\n\n', 'Në këtë praktikë do ta drejtosh vëmendjen te zona e zemrës, duke marrë frymë për 5 sekonda dhe duke e nxjerrë për 5 sekonda.',
         '\n\n', 'Ky ritëm i ngadaltë dhe i qëndrueshëm ndihmon në rregullimin e sistemit nervor dhe mbështet koherencën kardiake.',
         '\n\n', 'Ndërsa frymëmarrja harmonizohet, do të kultivosh ndjenja dashurie, falënderimi dhe paqeje, duke krijuar një gjendje më të ekuilibruar emocionale.'
       ),
       benefits = CONCAT(
         'Qetësim dhe ekuilibër të sistemit nervor',
         '\n', 'Harmoni mes frymëmarrjes dhe ritmit të zemrës',
         '\n', 'Më shumë paqe, qartësi dhe stabilitet emocional'
       )
 WHERE id = '5ecc1a59-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecc1a59-a510-11f1-b99e-107c614af9b1';
