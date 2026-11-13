-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Foli vetes pozitivisht"
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
         'Transformo mënyrën se si komunikon me veten dhe fillo të kultivosh një zë të brendshëm të mbushur me dashuri, besim dhe mbështetje.',
         '\n\n', 'Përmes këtij meditimi do të ndërgjegjësohesh për mendimet dhe fjalët që i drejton vetes çdo ditë, duke lëshuar gradualisht kritikat, gjykimet dhe besimet që të kufizojnë.',
         '\n\n', 'Do të zëvendësosh dialogun e brendshëm negativ me afirmime pozitive që të ndihmojnë të ndihesh më i sigurt, më i vlerësuar dhe më i dashur.',
         '\n\n', 'Do të mësosh të bëhesh mbështetësi më i madh i vetes, duke krijuar një marrëdhënie të re me mendjen dhe me identitetin tënd.'
       ),
       benefits = CONCAT(
         'Më shumë dashuri dhe pranim ndaj vetes',
         '\n', 'Çlirim nga vetëkritika dhe mendimet kufizuese',
         '\n', 'Vetëbesim, siguri dhe mbështetje të brendshme'
       )
 WHERE id = '5ecfb327-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecfb327-a510-11f1-b99e-107c614af9b1';
