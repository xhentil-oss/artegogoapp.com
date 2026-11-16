-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Meditim për të marrë dhe rrezatuar dritë"
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
         'Lidhu me dritën brenda vetes dhe përjeto një ndjenjë të thellë paqeje, dashurie dhe harmonie.',
         '\n\n', 'Përmes këtij meditimi do të vizualizosh një dritë të bukur që përshkon gjithë trupin tënd, duke sjellë ndjesi ngrohtësie, qetësie dhe gjallërie në çdo pjesë të qenies sate.',
         '\n\n', 'Do të lejosh që kjo dritë të të mbushë me dashuri dhe falënderim, duke lëshuar tensionet dhe emocionet që nuk dëshiron t’i mbartësh më.',
         '\n\n', 'Më pas do ta zgjerosh këtë ndjenjë përtej vetes, duke imagjinuar se e rrezaton drejt njerëzve që do, mjedisit që të rrethon dhe gjithë botës.'
       ),
       benefits = CONCAT(
         'Ndjesi drite, ngrohtësie dhe gjallërie në trup',
         '\n', 'Paqe, dashuri dhe harmoni të brendshme',
         '\n', 'Lidhje më të thellë me veten dhe të tjerët'
       )
 WHERE id = '73b9e07d-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '73b9e07d-ab5c-11f1-97ee-107c614af9b1';
