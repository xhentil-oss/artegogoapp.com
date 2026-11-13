-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Meditim për të gjetur rrugën më të lartë"
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
         'Lësho frikën, dyshimet dhe nevojën për të kontrolluar gjithçka, duke u hapur ndaj mundësive që ekzistojnë përtej asaj që arrin të shohësh sot.',
         '\n\n', 'Përmes këtij meditimi do të qetësosh mendjen dhe do të lidhesh me versionin tënd më të lartë, atë pjesë të vetes që vepron nga dashuria, qartësia dhe besimi, jo nga frika.',
         '\n\n', 'Do të vizualizosh rrugë dhe mundësi të reja, duke i dhënë vetes hapësirë për të dalluar zgjedhjet që përputhen me vlerat dhe dëshirat e tua më të thella.',
         '\n\n', 'Do të kultivosh besimin se edhe kur nuk e di ende se si do të realizohet diçka, mund të vazhdosh të ecësh përpara me qetësi, intuitë dhe një zemër të hapur.'
       ),
       benefits = CONCAT(
         'Qartësi për zgjedhjet dhe drejtimin tënd',
         '\n', 'Çlirim nga frika, dyshimet dhe kufizimet',
         '\n', 'Besim, frymëzim dhe lidhje me veten tënde më të lartë'
       )
 WHERE id = '73b9c201-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '73b9c201-ab5c-11f1-97ee-107c614af9b1';
