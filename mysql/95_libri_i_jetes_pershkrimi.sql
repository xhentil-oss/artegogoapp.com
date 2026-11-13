-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Meditim për të lexuar librin e jetës"
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
         'Nisu në një udhëtim të thellë drejt vetes dhe zbulo kuptimin e përvojave që kanë formësuar historinë tënde.',
         '\n\n', 'Përmes këtij meditimi do të imagjinosh librin e jetës sate, ku çdo kapitull përfaqëson një përvojë, një mësim dhe një etapë të rrugëtimit tënd.',
         '\n\n', 'Do të shohësh të shkuarën me një vetëdije të re, duke njohur jo vetëm sfidat dhe dhimbjet, por edhe forcën, urtësinë dhe transformimin që ke zhvilluar përgjatë rrugës.',
         '\n\n', 'Do të lidhesh me pjesën tënde më të thellë, duke reflektuar mbi mësimet e jetës dhe duke krijuar hapësirë për të shkruar me vetëdije kapitujt e ardhshëm.'
       ),
       benefits = CONCAT(
         'Kuptim dhe pranim më të thellë të historisë sate',
         '\n', 'Çlirim nga pesha emocionale e së shkuarës',
         '\n', 'Qartësi, urtësi dhe lidhje me qëllimin e jetës'
       )
 WHERE id = '73b9de8a-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '73b9de8a-ab5c-11f1-97ee-107c614af9b1';
