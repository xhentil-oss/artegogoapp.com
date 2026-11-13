-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Pushim meditativ për rigjenerim"
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
         'Jepi trupit dhe mendjes një moment pushimi të thellë, ku nuk ke nevojë të bësh, të arrish apo të kontrollosh asgjë.',
         '\n\n', 'Përmes këtij meditimi do të shkëputesh nga ritmi i përditshmërisë dhe do të lejosh që sistemi nervor të kalojë gradualisht drejt një gjendjeje qetësie dhe relaksimi.',
         '\n\n', 'Do të lëshosh tensionet fizike dhe ngarkesat emocionale, duke i dhënë vetes hapësirë për të pushuar, për t’u rikthyer në ekuilibër dhe për të rigjetur energjinë e brendshme.',
         '\n\n', 'Një udhëtim drejt qetësisë së thellë, ku pushimi bëhet një mënyrë për t’u kujdesur për veten dhe për t’u ndier sërish i plotë.'
       ),
       benefits = CONCAT(
         'Relaksim të thellë fizik dhe mendor',
         '\n', 'Çlirim të tensionit dhe lodhjes së grumbulluar',
         '\n', 'Qetësi, lehtësi dhe energji të ripërtërirë'
       )
 WHERE id = '5ecfb02f-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecfb02f-a510-11f1-b99e-107c614af9b1';
