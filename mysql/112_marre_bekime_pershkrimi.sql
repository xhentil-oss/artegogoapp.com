-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI DHE PËRFITIMET — "Meditim për të marrë bekime"
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
         'Hap zemrën dhe përgatite veten për të pranuar gjithë të mirat që jeta ka për të të ofruar.',
         '\n\n', 'Përmes këtij meditimi do të lëshosh ndjenjën e mungesës, frikën dhe besimet që të pengojnë të ndihesh i denjë për të marrë dashuri, lumturi, shëndet dhe bollëk.',
         '\n\n', 'Do të lidhesh me ndjenjat e falënderimit, besimit dhe plotësisë, duke kultivuar brenda vetes bindjen se meriton të përjetosh gjëra të mrekullueshme.',
         '\n\n', 'Do të hapesh ndaj mundësive të reja dhe do të mësosh t’i pranosh bekimet e jetës me një zemër të hapur, pa rezistencë dhe pa ndjenjën se duhet të luftosh për të merituar gjithçka.'
       ),
       benefits = CONCAT(
         'Ndjenjë plotësie, bollëku dhe falënderimi',
         '\n', 'Hapje ndaj mundësive dhe bekimeve të reja',
         '\n', 'Besim dhe ndjenjë se meriton gjithë të mirat e jetës'
       )
 WHERE id = '73b9e006-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '73b9e006-ab5c-11f1-97ee-107c614af9b1';
