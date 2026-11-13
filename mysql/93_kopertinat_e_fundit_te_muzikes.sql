-- ═══════════════════════════════════════════════════════════════
--  KATËR KOPERTINAT E FUNDIT TË "MUZIKËS SË MEDITIMIT"
--  13 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Me këto, TË GJITHA praktikat kanë kapak kudo: 14 pjesët e muzikës, 18
--  këngët (`92_kopertinat_e_fundit_te_kengeve.sql`) dhe 14 pllakat e vetë
--  praktikave te `src/data/techniques.js`.
--
--  ✓  VETËM SQL. Pa ndërtim faqeje, pa Restart Node-i. Skedarët shkojnë te
--     `public_html/kopertina/` me File Manager.
--
--  ✓  TITULLI U LEXUA NGA VETË FOTOJA, si te `90` dhe `92`. Të katërtat e
--     mbajnë titullin të shtypur mbi to dhe përputhen shkronjë për shkronjë
--     me databazën. Emrat e skedarëve kishin vetëm hapësira — asnjë gabim.
--
--  ✓  EMRAT NDJEKIN AUDION: `si-uje-i-qete.mp3` → `si-uje-i-qete.jpeg`.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  KATËR RRESHTA
-- ───────────────────────────────────────────────────────────────

UPDATE meditations SET cover_url = '/kopertina/nje-cast-pafundesi.jpeg'   WHERE id = '01ca5956-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/nen-te-njejtin-qiell.jpeg' WHERE id = '01ca59da-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/pertej-kohes.jpeg'         WHERE id = '01ca5a1a-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/si-uje-i-qete.jpeg'        WHERE id = '01ca5a58-deae-11f1-af71-107c614af9b1';


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────
--  Duhen 32 rreshta — 14 muzikë + 18 këngë — dhe asnjë `pa kopertinë`.

SELECT t.slug, m.title, m.cover_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug IN ('muzike-meditimi', 'kenge-motivuese')
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.cover_url IS NULL DESC, t.slug, m.title;
