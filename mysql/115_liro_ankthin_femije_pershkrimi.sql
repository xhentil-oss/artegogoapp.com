-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Liro ankthin"
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
         'Ndonjëherë mendja jonë mbushet me shqetësime dhe trupi fillon të ndihet i tensionuar. Por brenda teje ekziston një vend i qetë, ku gjithmonë mund të rikthehesh.',
         '\n\n', 'Përmes këtij meditimi do të mësosh ta lirosh ankthin, të kuptosh se si ndihet në trupin tënd dhe ta qetësosh veten përmes frymëmarrjes dhe imagjinatës.',
         '\n\n', 'Do të imagjinosh se me çdo frymëmarrje po lëshon pak nga shqetësimet e tua dhe po mbushesh me qetësi, guxim dhe siguri.',
         '\n\n', 'Do të zbulosh se mendimet shqetësuese janë si retë në qiell: ato vijnë dhe largohen, ndërsa ti mund të qëndrosh i qetë dhe i sigurt brenda vetes.'
       ),
       benefits = CONCAT(
         'Më pak shqetësim dhe tension në trup',
         '\n', 'Më shumë qetësi dhe siguri të brendshme',
         '\n', 'Besim në aftësinë tënde për të përballuar emocionet e vështira'
       )
 WHERE id = '5ed09843-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ed09843-a510-11f1-b99e-107c614af9b1';
