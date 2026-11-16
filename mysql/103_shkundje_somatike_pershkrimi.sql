-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Shkundje somatike"
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
         'Çliro tensionin e grumbulluar në trup dhe rikthe ndjenjën e lirisë, gjallërisë dhe lehtësisë.',
         '\n\n', 'Përmes kësaj praktike somatike do të përdorësh lëvizje të buta dhe shkundje ritmike të trupit për të liruar ngurtësinë fizike dhe për t’i dhënë hapësirë emocioneve që ke mbajtur brenda vetes.',
         '\n\n', 'Do të lejosh trupin të lëvizë lirshëm, pa gjykim dhe pa kontroll të tepërt, duke u shkëputur gradualisht nga gjendja e tensionit.',
         '\n\n', 'Ndërsa lëviz, do të kultivosh një ndjenjë më të thellë lidhjeje me trupin dhe me energjinë tënde jetësore.'
       ),
       benefits = CONCAT(
         'Çlirim të tensionit fizik dhe emocional',
         '\n', 'Më shumë lehtësi, energji dhe gjallëri',
         '\n', 'Lidhje më të thellë me trupin dhe emocionet'
       )
 WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1';
