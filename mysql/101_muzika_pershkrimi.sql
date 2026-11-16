-- ═══════════════════════════════════════════════════════════════
--  PËRSHKRIMI I MUZIKËS SË MEDITIMIT — një rresht, për të katërmbëdhjetat
--  16 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  E njëjta kërkesë si te këngët (`100_kenget_pershkrimi.sql`): përshkrimi
--  thotë thjesht "Muzikë meditimi". Pa të, aplikacioni gjeneronte vetë
--  «<Titulli> — praktikë e udhëhequr nga Arte Gogo.», e njëjta për të
--  katërmbëdhjetat.
--
--  ✓  ASGJË NUK MBISHKRUHET. U lexuan të 14-ta nga serveri: asnjëra nuk
--     kishte përshkrim të vërtetë.
--
--  ✓  I SIGURT PËR T'U EKZEKUTUAR DY HERË.
--
--  ✓  VETËM SQL. Pa ndërtim faqeje, pa Restart Node-i.
--
--  ✓  BLLOKU "ÇFARË DO TË NDJESH" NUK SHFAQET MË për këto, sepse `benefits`
--     rri NULL — që prej 16 nëntorit `MeditationSheet` e fsheh bllokun kur
--     përfitimet mungojnë, në vend që t'i sajojë nga qëllimi.

SET NAMES utf8mb4;

UPDATE meditations m
  JOIN techniques t ON t.id = m.technique_id
   SET m.description = 'Muzikë meditimi'
 WHERE t.slug = 'muzike-meditimi'
   AND m.is_block = 0;

-- Duhet "14 rows affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────

SELECT m.title, m.description
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'muzike-meditimi'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;
