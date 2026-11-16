-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI I KËNGËVE MOTIVUESE — një rresht, për të tetëmbëdhjetat
--  16 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Kërkesë e klientes: te një këngë, përshkrimi thotë thjesht "Këngë
--  motivuese". Pa të, aplikacioni gjeneronte vetë fjalinë
--  «<Titulli> — praktikë e udhëhequr nga Arte Gogo.», e njëjta për të
--  tetëmbëdhjetat, dhe ajo nuk shtonte asgjë mbi titullin që rri pak më lart.
--
--  ✓  ASGJË NUK MBISHKRUHET. U lexuan të 18-ta nga serveri para se të
--     shkruhej kjo: asnjëra nuk kishte përshkrim të vërtetë (`description`
--     ishte NULL te të gjitha).
--
--  ✓  I SIGURT PËR T'U EKZEKUTUAR DY HERË.
--
--  ✓  VETËM SQL. Pa ndërtim faqeje, pa Restart Node-i.
--
--  ⚠️  PËRFITIMET NUK PREKEN KËTU. Dy rreshtat poshtë ("Energji e ngrohtë
--      në trup"…) vijnë nga `benefitsFor(intent)` te `domain/benefits.js`,
--      sepse `benefits` rri NULL. Fshehja e tyre do të kërkonte ndryshim
--      kodi, jo SQL — dhe do të prekte çdo meditim pa përfitime, jo vetëm
--      këngët. Shih shënimin te `MeditationSheet.jsx`, rreshti ~123.

SET NAMES utf8mb4;

UPDATE meditations m
  JOIN techniques t ON t.id = m.technique_id
   SET m.description = 'Këngë motivuese'
 WHERE t.slug = 'kenge-motivuese'
   AND m.is_block = 0;

-- Duhet "18 rows affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT m.title, m.description
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'kenge-motivuese'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;
