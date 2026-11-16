-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Aktivizo vetëvlerësimin"
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
         'Rizbulo vlerën tënde të vërtetë dhe lidhjen me atë pjesë të vetes që është gjithmonë e denjë për dashuri, respekt dhe lumturi.',
         '\n\n', 'Përmes këtij meditimi do të lëshosh besimet kufizuese, kritikat dhe gjykimet që të kanë bërë të dyshosh në vlerën tënde.',
         '\n\n', 'Do të aktivizosh ndjenjat e vetëbesimit, dashurisë dhe pranimit të pakushtëzuar, duke kuptuar se vlera jote nuk përcaktohet nga arritjet, mendimet e të tjerëve apo përvojat e së shkuarës.',
         '\n\n', 'Do të fillosh ta shohësh veten me sy të rinj, duke njohur potencialin, bukurinë dhe fuqinë që ke pasur gjithmonë brenda vetes.'
       ),
       benefits = CONCAT(
         'Rritje të vetëvlerësimit dhe vetëbesimit',
         '\n', 'Çlirim nga kritikat dhe besimet kufizuese',
         '\n', 'Pranim dhe dashuri më të thellë ndaj vetes'
       )
 WHERE id = '5ec89d2c-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec89d2c-a510-11f1-b99e-107c614af9b1';
