-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Rikthe energjinë"
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
         'Lësho lodhjen fizike dhe mendore dhe jepi vetes mundësinë të pushosh thellësisht, duke rikthyer ndjenjën e gjallërisë dhe ekuilibrit të brendshëm.',
         '\n\n', 'Përmes këtij meditimi do të shkëputesh nga shqetësimet, përgjegjësitë dhe mendimet që të kanë mbajtur në një gjendje të vazhdueshme tensioni.',
         '\n\n', 'Do të relaksosh gradualisht çdo pjesë të trupit, do të qetësosh sistemin nervor dhe do të krijosh kushtet për një pushim të thellë e rigjenerues.',
         '\n\n', 'Ndërsa trupi relaksohet dhe mendja qetësohet, do t’i japësh vetes hapësirë për të rikuperuar energjinë dhe për t’u zgjuar me një ndjenjë të re freskie, lehtësie dhe gjallërie.'
       ),
       benefits = CONCAT(
         'Relaksim të thellë dhe çlirim nga lodhja',
         '\n', 'Qetësim të mendjes dhe sistemit nervor',
         '\n', 'Ndjenjë rigjenerimi dhe energjie të ripërtërirë'
       )
 WHERE id = '5ecde7a2-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecde7a2-a510-11f1-b99e-107c614af9b1';
