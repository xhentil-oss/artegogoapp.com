-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Frymëmarrje ritmike 4x7x8 para gjumit për qetësim"
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
         'Lësho tensionet e ditës dhe përgatit trupin dhe mendjen për një gjumë të qetë e çlodhës.',
         '\n\n', 'Përmes teknikës së frymëmarrjes 4×7×8 do të marrësh frymë për 4 sekonda, do ta mbash për 7 sekonda dhe do ta nxjerrësh ngadalë për 8 sekonda.',
         '\n\n', 'Ky ritëm të ndihmon të ngadalësosh frymëmarrjen, të qetësosh mendimet dhe të krijosh një gjendje relaksimi të thellë.',
         '\n\n', 'Me çdo frymëmarrje do të lëshosh shqetësimet e ditës, duke e lejuar trupin të përgatitet natyrshëm për pushim.'
       ),
       benefits = CONCAT(
         'Relaksim të trupit dhe mendjes',
         '\n', 'Reduktim të tensionit dhe shqetësimeve para gjumit',
         '\n', 'Qetësi të thellë dhe përgatitje për gjumë'
       )
 WHERE id = '5ecc15d3-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecc15d3-a510-11f1-b99e-107c614af9b1';
