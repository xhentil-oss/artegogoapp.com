-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Frymëmarrje ritmike 4x6 për lirim nga stresi"
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
         'Çliro stresin e grumbulluar dhe rikthe qetësinë në trupin dhe mendjen tënde përmes fuqisë së frymëmarrjes.',
         '\n\n', 'Në këtë praktikë do të marrësh frymë për 4 sekonda dhe do ta nxjerrësh ngadalë për 6 sekonda, duke ndihmuar sistemin nervor të kalojë nga gjendja e tensionit drejt relaksimit.',
         '\n\n', 'Me çdo nxjerrje të frymës do të lejosh trupin të lëshojë tensionin, ndërsa mendja fillon të qetësohet.',
         '\n\n', 'Vetëm një minutë për t’u shkëputur nga stresi dhe për t’u rikthyer te vetja.'
       ),
       benefits = CONCAT(
         'Reduktim të stresit dhe tensionit të grumbulluar',
         '\n', 'Qetësim të sistemit nervor',
         '\n', 'Më shumë lehtësi dhe qartësi mendore'
       )
 WHERE id = '5ecc1612-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecc1612-a510-11f1-b99e-107c614af9b1';
