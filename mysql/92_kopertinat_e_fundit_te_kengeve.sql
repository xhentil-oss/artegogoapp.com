-- ═══════════════════════════════════════════════════════════════
--  DHJETË KOPERTINAT E FUNDIT TË "KËNGËVE MOTIVUESE"
--  13 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Me këto, të tetëmbëdhjetë këngët kanë kopertinë. Tetë të parat erdhën më
--  13 nëntor (`78_kopertinat_e_kengeve.sql`); këto janë të mbeturat.
--
--  ✓  VETËM SQL. `cover_url` rri te databaza, ndaj aplikacioni e merr vetë te
--     hapja e radhës — pa ndërtim faqeje, pa Restart Node-i. Skedarët shkojnë
--     te `public_html/kopertina/` me File Manager.
--
--  ✓  EMRAT NDJEKIN AUDION, si te `90_kopertinat_e_muzikes.sql`. Dy emra të
--     ardhur ishin të pasaktë dhe u ndreqën sipas titullit: "zgjidhje e nje
--     sfide" → `zgjidhja-e-nje-sfide`, dhe "sot po eci si vetja ime e vertet"
--     → `sot-po-eci-si-vetja-ime` (slug-u i mp3-së).
--
--  ✓  TITULLI U LEXUA NGA VETË FOTOJA. Të dhjetat e mbajnë titullin të
--     shtypur mbi to; u hapën një nga një dhe u krahasuan me databazën. Të
--     dhjetat përputhen shkronjë për shkronjë.
--
--     Kjo ka rëndësi të veçantë këtu. Më 12 nëntor, te kjo praktikë, 17
--     skedarë mbanin emrin e njërës këngë dhe përmbajtjen e asaj para saj
--     (shih `77_kenget_emrat_e_sakte.sql`). Njëra prej tyre, "Vlera jote je
--     ti", mbante brenda etiketë ID3 që thoshte "Toka do që të dëgjohet".
--     Kopertina e saj shkruan "Vlera jote je ti" — pra përputhet me titullin
--     e rregulluar, jo me etiketën e vjetër. Zhvendosja nuk u përsërit.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  DHJETË RRESHTA
-- ───────────────────────────────────────────────────────────────

UPDATE meditations SET cover_url = '/kopertina/pranimi-i-vetes.jpeg'         WHERE id = 'cc7f8d99-deab-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/sherimi-ka-ndodhur.jpeg'      WHERE id = 'cc7f8de3-deab-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/simfonia-e-jetes.jpeg'        WHERE id = 'cc7f8e29-deab-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/te-shoh.jpeg'                 WHERE id = 'cc7f8e95-deab-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/thirrja-per-aventure.jpeg'    WHERE id = 'cc7f8eda-deab-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/sot-po-eci-si-vetja-ime.jpeg' WHERE id = 'cc7f8f18-deab-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/toka-do-qe-te-degjohet.jpeg'  WHERE id = 'cc7f8f60-deab-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/zeri-im-le-te-degjohet.jpeg'  WHERE id = 'cc7f8fac-deab-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/vlera-jote-je-ti.jpeg'        WHERE id = 'cc7f8ffb-deab-11f1-af71-107c614af9b1';
UPDATE meditations SET cover_url = '/kopertina/zgjidhja-e-nje-sfide.jpeg'    WHERE id = '3c09074b-df4a-11f1-af71-107c614af9b1';


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────
--  Duhen 18 rreshta, TË GJITHË me kopertinë. Asnjë `NULL`.

SELECT m.title, m.cover_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'kenge-motivuese'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.cover_url IS NULL, m.title;
