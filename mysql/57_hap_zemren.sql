-- ═══════════════════════════════════════════════════════════════
--  "Hap zemrën" — zëri, kopertina dhe koha
--  dhe fshehja e dublikatit
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  DY URDHRA. E njëjta situatë si te "Aktivizo intuitën" sot.
--
--  ⚠️  DY MEDITIME QUHEN "Hap zemrën", të dy te kategoria "Zemra plot",
--      të dy vendmbajtës me 10 minuta të sajuara:
--
--        5ec89868  Meditime për Zemrën  → Zemra plot  (nën-grupi "Zemra")
--                  "Për kraharorin që rri i mbyllur pas një lëndimi…"
--        5eccfdc8  Teknika Energjetike  → Zemra plot  (nën-grupi "Aktivizim")
--                  "Hapje energjetike e zonës së kraharorit…"
--
--      Zëri shkon te i pari — ai që rrethoi klientja. Pa urdhrin e dytë,
--      te folderi i kategorisë "Zemra plot" do të dilnin dy karta me emër
--      identik: njëra me kopertinë e 9 minuta, tjetra vendmbajtës me 10.
--
--      Fshehja ndjek zgjedhjen që bëri klientja për të njëjtën situatë te
--      intuita (`53_aktivizo_intuiten.sql`), jo një pyetje të re. Po të
--      dojë ndryshe, urdhri i kthimit është te fundi.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--     Dosja `meditime-per-zemren` ekziston tashmë te serveri.
--
--  ✓  TITULLI NUK NDRYSHON. Klientja e deshi ashtu siç është.
--
--  ⚠️  PËRSHKRIMI NUK PREKET. "Për kraharorin që rri i mbyllur pas një
--      lëndimi. Fryma çohet drejt zemrës, mbrojtja njihet e falënderohet,
--      dhe hapja bëhet me ritmin tënd." — i rri saktë zërit, dhe nuk
--      përmend asnjë numër minutash që do të bëhej i pasaktë.
--
--  Kohëzgjatja: 564 sekonda (9 min 24 s). E numëruar kornizë për kornizë
--  nga vetë mp3-ja — 23 501 korniza × 1152 mostra ÷ 48 000 Hz.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  1 — MEDITIMI (Meditime për Zemrën → Zemra plot)
-- ───────────────────────────────────────────────────────────────

UPDATE meditations
   SET audio_url    = 'meditime/meditime-per-zemren/hap-zemren.mp3',
       cover_url    = '/kopertina/hap-zemren.jpeg',
       duration_sec = 564
 WHERE id = '5ec89868-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  2 — FSHIHET DUBLIKATI (Teknika Energjetike → Zemra plot)
-- ───────────────────────────────────────────────────────────────
--
--  ⚠️  NUK FSHIHET NGA DATABAZA. Rreshti rri i plotë, me titull dhe
--      përshkrim; hiqet vetëm data e botimit, çelësi me të cilin API-ja
--      vendos se çfarë shfaqet. Teknika Energjetike kalon nga 13 në 12.

UPDATE meditations
   SET published_at = NULL
 WHERE id = '5eccfdc8-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — kategoria "Zemra plot"
-- ───────────────────────────────────────────────────────────────
--  Një "Hap zemrën" i vetëm, me zë dhe kopertinë.

SELECT m.title, t.name AS teknika, m.duration_sec, m.cover_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
  JOIN categories c ON c.id = m.category_id
 WHERE c.slug = 'zemra-plot'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY t.name, m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH DUBLIKATIN, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--  Data e vjetër merret nga një motër e tij që mbetet e dukshme
--  ("Tokëzim", po te Teknikat Energjetike). Tabela e brendshme me emër
--  (`AS burim`) është e domosdoshme — MySQL nuk lejon një nënpyetje mbi
--  të njëjtën tabelë që po përditësohet, dhe pa të kthen #1093.
--
--      UPDATE meditations
--         SET published_at = (
--               SELECT p FROM (
--                 SELECT published_at AS p FROM meditations
--                  WHERE id = '5eccfee4-a510-11f1-b99e-107c614af9b1'
--               ) AS burim
--             )
--       WHERE id = '5eccfdc8-a510-11f1-b99e-107c614af9b1';
