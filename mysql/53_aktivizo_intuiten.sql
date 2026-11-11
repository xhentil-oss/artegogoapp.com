-- ═══════════════════════════════════════════════════════════════
--  "Intuitë" → "Aktivizo intuitën", me zë dhe kopertinë
--  dhe fshehja e dublikatit
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  DY URDHRA.
--
--  ⚠️  PSE DUHET EDHE I DYTI
--
--      Titulli "Aktivizo intuitën" ekzistonte TASHMË, te një meditim
--      tjetër: `5eccfe10`, Teknika Energjetike → Intuita. Të dy ishin
--      vendmbajtës, të dy te e njëjta kategori, me përshkrime që thonë
--      thuajse të njëjtën gjë ("dallimin mes një sinjali të qetë dhe një
--      frike…").
--
--      Pa urdhrin e dytë, te folderi i kategorisë "Intuita" do të dilnin
--      dy karta me emër identik — njëra me kopertinë e 11 minuta, tjetra
--      vendmbajtës me 10. Klientja zgjodhi: zëri shkon te ai i
--      Meditimeve për Trurin, dhe tjetri fshihet.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--     Dosja `meditime-per-trurin` ekziston tashmë te serveri.
--
--  ⚠️  PËRSHKRIMI I TË PARIT NUK PREKET. "Për zërin e brendshëm që
--      dëgjohet vetëm kur bie zhurma. Seanca e ul analizën dhe pastaj
--      ushtron dallimin mes një sinjali të qetë dhe një frike të
--      nxituar." — i rri saktë titullit të ri.
--
--  Kohëzgjatja: 660 sekonda, fiks 11 minuta. E numëruar kornizë për
--  kornizë nga vetë mp3-ja — 27 512 korniza × 1152 mostra ÷ 48 000 Hz.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  1 — MEDITIMI (Meditime për Trurin → Intuita)
-- ───────────────────────────────────────────────────────────────

UPDATE meditations
   SET title        = 'Aktivizo intuitën',
       audio_url    = 'meditime/meditime-per-trurin/aktivizo-intuiten.mp3',
       cover_url    = '/kopertina/aktivizo-intuiten.jpeg',
       duration_sec = 660
 WHERE id = '5ec89f52-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  2 — FSHIHET DUBLIKATI (Teknika Energjetike → Intuita)
-- ───────────────────────────────────────────────────────────────
--
--  ⚠️  NUK FSHIHET NGA DATABAZA. `published_at = NULL` është çelësi që
--      përdor i gjithë API-ja — biblioteka, numëruesit e teknikave dhe
--      të kategorive, dhe `/audio/:id`. Rreshti rri i plotë.
--      Teknika Energjetike kalon nga 14 në 13 meditime.

UPDATE meditations
   SET published_at = NULL
 WHERE id = '5eccfe10-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — kategoria Intuita
-- ───────────────────────────────────────────────────────────────
--  Një "Aktivizo intuitën" i vetëm, me zë dhe kopertinë.

SELECT m.title, t.name AS teknika, m.duration_sec, m.audio_url, m.cover_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
  JOIN categories c ON c.id = m.category_id
 WHERE c.slug = 'intuita'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY t.name, m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH DUBLIKATIN, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--  Data e vjetër nuk duhet mbajtur mend: merret nga një motër e tij që
--  mbetet e dukshme ("Tokëzim", po te Teknikat Energjetike). Tabela e
--  brendshme me emër (`AS burim`) është e domosdoshme — MySQL nuk lejon
--  një nënpyetje mbi të njëjtën tabelë që po përditësohet, dhe pa të
--  kthen #1093.
--
--      UPDATE meditations
--         SET published_at = (
--               SELECT p FROM (
--                 SELECT published_at AS p FROM meditations
--                  WHERE id = '5eccfee4-a510-11f1-b99e-107c614af9b1'
--               ) AS burim
--             )
--       WHERE id = '5eccfe10-a510-11f1-b99e-107c614af9b1';
