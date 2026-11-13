-- ═══════════════════════════════════════════════════════════════
--  NËNTË KOPERTINA PËR "MUZIKË MEDITIMI"
--  13 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  ✓  VETËM SQL. Rruga e kopertinës rri te databaza (`cover_url`), ndaj
--     aplikacioni e merr vetë te hapja e radhës — pa ndërtim faqeje, pa
--     Restart Node-i. Skedarët ngarkohen me File Manager te
--     `public_html/kopertina/`.
--
--  ✓  EMRAT NDJEKIN AUDION. Çdo kopertinë merr të njëjtin slug si mp3-ja e
--     vet (`mbi-re.mp3` → `mbi-re.jpeg`). Emrat e ardhur kishin hapësira dhe
--     njëri ishte i gabuar: `kur qielli prek token.jpeg` — ndërsa vetë fotoja
--     shkruan "Ku qielli prek detin", dhe ky është titulli te databaza.
--
--  ✓  TITULLI U LEXUA NGA VETË FOTOJA, JO NGA EMRI I SKEDARIT. Të dhjetat e
--     mbajnë titullin të shtypur mbi to; u hapën një nga një dhe u krahasuan
--     me titujt e databazës. Nëntë përputhen shkronjë për shkronjë. Pas asaj
--     që ndodhi me këngët motivuese (shih `77_kenget_emrat_e_sakte.sql`, ku
--     17 skedarë mbanin emrin e njërit dhe përmbajtjen e tjetrit), emri i
--     skedarit nuk pranohet më si provë.
--
--  ⚠️  E DHJETA RRI JASHTË. `aty-ku-lind-drita.jpeg` është kopertinë e
--      vërtetë, me titullin "Aty ku lind drita" të shtypur mbi të — por
--      asnjë nga 13 pjesët nuk e mban atë titull. Katër mbeten pa kopertinë:
--      "Një çast pafundësi", "Nën të njëjtin qiell", "Përtej kohës",
--      "Si ujë i qetë". Derisa klientja të thotë së cilës i përket, skedari
--      rri te `public/kopertina/` pa u lidhur me asgjë.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  NËNTË RRESHTA
-- ───────────────────────────────────────────────────────────────

UPDATE meditations SET cover_url = '/kopertina/gjithcka-qe-ndiej.jpeg'    WHERE id = '01ca537f-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/hapesire-pa-fund.jpeg'     WHERE id = '01ca5607-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/jehone-brenda-meje.jpeg'   WHERE id = '01ca5684-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/ku-qielli-prek-detin.jpeg' WHERE id = '01ca56db-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/kur-koha-ndalet.jpeg'      WHERE id = '01ca5837-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/mbi-re.jpeg'               WHERE id = '01ca588d-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/me-syte-mbyllur.jpeg'      WHERE id = '01ca58d3-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/mes-meje-dhe-qiellit.jpeg' WHERE id = '01ca5914-deae-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/ne-ajer.jpeg'              WHERE id = '01ca5999-deae-11f1-af71-107c614af9b1';


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────
--  Duhen 13 rreshta: nëntë me kopertinë, katër me NULL.

SELECT m.title, m.cover_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'muzike-meditimi'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.cover_url IS NULL, m.title;
