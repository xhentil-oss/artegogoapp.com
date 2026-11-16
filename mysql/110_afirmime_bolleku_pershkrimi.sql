-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Afirmime për bollëk financiar"
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
         'Transformo marrëdhënien tënde me paranë dhe krijo një mendësi të re të bazuar te bollëku, siguria dhe merita.',
         '\n\n', 'Përmes këtyre afirmimeve do të fillosh të zëvendësosh besimet kufizuese që ke krijuar rreth parasë, suksesit dhe mundësive financiare.',
         '\n\n', 'Do të kultivosh ndjenjat e vetëbesimit, falënderimit dhe sigurisë, duke forcuar bindjen se je i denjë për të krijuar dhe përjetuar mirëqenie financiare.',
         '\n\n', 'Sa më shumë t’i përsërisësh këto afirmime me vetëdije dhe emocion, aq më shumë do të forcosh një mënyrë të re të menduari, që të mbështet të njohësh mundësi të reja dhe të veprosh drejt qëllimeve të tua financiare.'
       ),
       benefits = CONCAT(
         'Më shumë siguri dhe besim në aftësitë e tua financiare',
         '\n', 'Çlirim nga frika dhe besimet kufizuese rreth parasë',
         '\n', 'Ndjenjë bollëku, merite dhe hapjeje ndaj mundësive të reja'
       )
 WHERE id = '5ecd02f4-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecd02f4-a510-11f1-b99e-107c614af9b1';
