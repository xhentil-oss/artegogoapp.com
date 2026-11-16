-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Relaksim i thellë me frymëmarrje 4x8"
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
         'Rikthe qetësinë në momentet kur ndien ankth, tension apo mbingarkesë emocionale.',
         '\n\n', 'Përmes kësaj teknike do të marrësh frymë ngadalë për 4 sekonda dhe do ta nxjerrësh për 8 sekonda, duke i dhënë trupit një ritëm të qëndrueshëm për t’u relaksuar.',
         '\n\n', 'Nxjerrja e zgjatur e frymës ndihmon në qetësimin e reagimit ndaj stresit dhe në rikthimin e ndjenjës së kontrollit mbi frymëmarrjen.',
         '\n\n', 'Me çdo cikël do të përqendrohesh gjithnjë e më shumë te momenti i tanishëm, duke krijuar hapësirë mes vetes dhe emocioneve që po përjeton.'
       ),
       benefits = CONCAT(
         'Qetësim të trupit dhe mendjes',
         '\n', 'Reduktim të tensionit dhe ankthit',
         '\n', 'Më shumë stabilitet dhe siguri të brendshme'
       )
 WHERE id = '5ecc158c-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecc158c-a510-11f1-b99e-107c614af9b1';
