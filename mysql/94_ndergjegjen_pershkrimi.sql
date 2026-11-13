-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Meditim për të rritur ndërgjegjen"
--  13 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Teksti i klientes. Zëvendëson rreshtin e vjetër njëfjalësh
--  ("Zgjerim i ndërgjegjes, vëzhgim i vetes pa gjykim.") dhe tri përfitimet
--  e gjeneruara nga `benefitsFor(intent)` te `domain/benefits.js` — ato
--  dilnin të njëjta për çdo meditim me të njëjtin qëllim.
--
--  ✓  VETËM SQL. Pa ndërtim faqeje, pa Restart Node-i.
--
--  ✓  Paragrafët ndahen me \n\n, përfitimet me \n të vetëm — ashtu i pret
--     `splitBenefits()` te `services/catalog.js`.
--
--  ⚠️  APOSTROFI TE “t’i vëzhgojë” ËSHTË TIPOGRAFIK (’), jo i thjeshtë. Prandaj
--      nuk ka nevojë për dyfishim brenda thonjëzave të SQL-së. Po ta zëvendësosh
--      me ' të zakonshëm, komanda prishet në mes.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Zgjero vetëdijen përtej mendimeve, emocioneve dhe identitetit me të cilin je mësuar të identifikohesh.',
         '\n\n', 'Përmes këtij meditimi do të mësosh të bëhesh observuesi i mendimeve dhe emocioneve të tua, duke i vëzhguar pa gjykim dhe pa u përfshirë automatikisht në to.',
         '\n\n', 'Do të krijosh hapësirë mes vetes dhe reagimeve të zakonshme, duke kuptuar se ti nuk je mendimet apo emocionet që përjeton, por vetëdija që arrin t’i vëzhgojë ato.',
         '\n\n', 'Sa më shumë ta kultivosh këtë gjendje, aq më shumë do të zhvillosh aftësinë për të zgjedhur me vetëdije mënyrën se si mendon, ndien dhe vepron në jetën e përditshme.'
       ),
       benefits = CONCAT(
         'Vetëdije më të lartë për mendimet dhe emocionet',
         '\n', 'Më pak identifikim me reagimet automatike',
         '\n', 'Qetësi, prani dhe liri të brendshme'
       )
 WHERE id = '73b9e100-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '73b9e100-ab5c-11f1-97ee-107c614af9b1';
