-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "EFT për ankthin"
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
         'Liro tensionin emocional dhe krijo një ndjenjë më të thellë qetësie dhe sigurie brenda vetes.',
         '\n\n', 'Përmes teknikës EFT (Emotional Freedom Techniques), do të kombinosh prekjen ritmike të pikave të caktuara të trupit me afirmime që të ndihmojnë të pranosh dhe të përpunosh emocionet që po përjeton.',
         '\n\n', 'Do të mësosh ta vëzhgosh ankthin pa e gjykuar dhe pa luftuar kundër tij, duke i dhënë trupit dhe mendjes hapësirë për t’u qetësuar.',
         '\n\n', 'Një praktikë e shkurtër për t’u rikthyer te vetja, veçanërisht në momentet kur ndihesh i mbingarkuar emocionalisht.'
       ),
       benefits = CONCAT(
         'Reduktim të tensionit emocional dhe ankthit',
         '\n', 'Më shumë qetësi dhe siguri të brendshme',
         '\n', 'Pranim dhe lidhje më të thellë me veten'
       )
 WHERE id = '5ecaf349-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecaf349-a510-11f1-b99e-107c614af9b1';
