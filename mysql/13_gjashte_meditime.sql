-- ═══════════════════════════════════════════════════════════════
--  GJASHTË MEDITIME TË RE — "Ndërgjegje e lartë"
--
--  Vijnë me audio dhe kopertinë të vërtetë; janë të parat që i kanë.
--
--  ⚠️  Rrugët nuk janë hamendësime: `duration_sec` u lexua nga kokat e
--      skedarëve MP3 (192 kbps CBR, ndaj llogaritja është e saktë), dhe emrat
--      e skedarëve u caktuan nga këtu — pra databaza dhe disku përputhen sepse
--      i njëjti slug shkroi të dyja.
--
--  ⚠️  `is_premium = 1` si të gjitha të tjerat. Shih `mysql/12_no_free.sql`:
--      modeli nuk njeh meditime falas, dhe një përjashtim i vetëm do të bëhej
--      vrimë te porta e abonimit.
--
--  I sigurt për t'u ri-ekzekutuar: `NOT EXISTS` mbi titullin e ndal dyfishimin.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

INSERT INTO meditations
  (title, subgroup, technique_id, category_id, duration_sec,
   audio_url, cover_url, description, is_premium, is_block, narrator, published_at)
SELECT t.title, t.subgroup, tec.id, cat.id, t.duration_sec,
       t.audio_url, t.cover_url, t.description, 1, 0, 'Arte Gogo', NOW()
  FROM (
    SELECT 'Meditim për të gjetur rrugën më të lartë' AS title, 'Ndërgjegje e lartë' AS subgroup,
           'vizualizim' AS technique_slug, 'intuita' AS category_slug, 498 AS duration_sec,
           'meditime/vizualizim/meditim-per-te-gjetur-rrugen-me-te-larte.mp3' AS audio_url,
           '/kopertina/meditim-per-te-gjetur-rrugen-me-te-larte.jpeg' AS cover_url,
           'Udhërrëfim i brendshëm drejt zgjedhjes më të lartë — kur mendja nuk e di nga t''ia mbajë.' AS description
    UNION ALL SELECT 'Meditim për të lexuar librin e jetës' AS title, 'Ndërgjegje e lartë' AS subgroup,
           'vizualizim' AS technique_slug, 'intuita' AS category_slug, 636 AS duration_sec,
           'meditime/vizualizim/meditim-per-te-lexuar-librin-e-jetes.mp3' AS audio_url,
           '/kopertina/meditim-per-te-lexuar-librin-e-jetes.jpeg' AS cover_url,
           'Hapje ndaj dijes që mban historia e shpirtit tënd.' AS description
    UNION ALL SELECT 'Meditim për të manifestuar me dritë' AS title, 'Ndërgjegje e lartë' AS subgroup,
           'vizualizim' AS technique_slug, 'manifestim' AS category_slug, 570 AS duration_sec,
           'meditime/vizualizim/meditim-per-te-manifestuar-me-drite.mp3' AS audio_url,
           '/kopertina/meditim-per-te-manifestuar-me-drite.jpeg' AS cover_url,
           'Manifestim përmes dritës — qëllimi vishet me ndjesi dhe formë.' AS description
    UNION ALL SELECT 'Meditim për të marrë bekime' AS title, 'Ndërgjegje e lartë' AS subgroup,
           'vizualizim' AS technique_slug, 'bolleku' AS category_slug, 600 AS duration_sec,
           'meditime/vizualizim/meditim-per-te-marre-bekime.mp3' AS audio_url,
           '/kopertina/meditim-per-te-marre-bekime.jpeg' AS cover_url,
           'Hapja e duarve dhe e zemrës për të pranuar atë që vjen.' AS description
    UNION ALL SELECT 'Meditim për të marrë dhe rrezatuar dritë' AS title, 'Ndërgjegje e lartë' AS subgroup,
           'vizualizim' AS technique_slug, 'energji-e-larte' AS category_slug, 547 AS duration_sec,
           'meditime/vizualizim/meditim-per-te-marre-dhe-rrezatuar-drite.mp3' AS audio_url,
           '/kopertina/meditim-per-te-marre-dhe-rrezatuar-drite.jpeg' AS cover_url,
           'Marrje dhe rrezatim drite — mbushje e fushës dhe dhurim i saj.' AS description
    UNION ALL SELECT 'Meditim për të rritur ndërgjegjen' AS title, 'Ndërgjegje e lartë' AS subgroup,
           'vizualizim' AS technique_slug, 'intuita' AS category_slug, 450 AS duration_sec,
           'meditime/vizualizim/meditim-per-te-rritur-ndergjegjen.mp3' AS audio_url,
           '/kopertina/meditim-per-te-rritur-ndergjegjen.jpeg' AS cover_url,
           'Zgjerim i ndërgjegjes, vëzhgim i vetes pa gjykim.' AS description
  ) AS t
  JOIN techniques tec ON tec.slug = t.technique_slug
  JOIN categories cat ON cat.slug = t.category_slug
 WHERE NOT EXISTS (
   SELECT 1 FROM meditations m WHERE m.title = t.title AND m.is_block = 0
 );

-- Kopertina e provës mbi "Takimi me veten e ardhshme" hiqet: ajo foto tani i
-- takon meditimit të vet.
UPDATE meditations SET cover_url = NULL
 WHERE id = '5ecd003e-a510-11f1-b99e-107c614af9b1';

-- Kontroll: duhet 250 gjithsej, 6 me kopertinë, 6 te nën-grupi i re.
SELECT COUNT(*) AS gjithsej,
       SUM(cover_url IS NOT NULL) AS me_kopertine,
       SUM(subgroup = 'Ndërgjegje e lartë') AS ndergjegje_e_larte
  FROM meditations WHERE is_block = 0;
