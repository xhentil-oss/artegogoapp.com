-- ═══════════════════════════════════════════════════════════════
--  "Dil nga paniku" → "Sill një emocion të ri", me zë dhe kopertinë
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditime riprogramimi" → Emocionet (nën-grupi "Emocione").
--
--  ✓  NJË URDHËR I VETËM. Pa zip faqeje, pa Restart Node-i.
--     Dosja `meditime-riprogramimi` ekziston tashmë te serveri.
--
--  ✓  PA PËRPLASJE TITULLI. Asnjë meditim tjetër nuk quhet kështu.
--     Kategoria Emocionet ka 13 meditime; asnjëri s'i afrohet.
--
--  ⚠️  PËRSHKRIMI HIQET SEPSE FLET PËR DIÇKA TJETËR.
--
--      I vjetri: "Për çastin kur paniku po ngrihet. Seanca e ndal ciklin
--      në pikën ku mendimi dhe trupi ushqejnë njëri-tjetrin: fryma
--      ngadalësohet e para, pastaj vëmendja kthehet te dy-tre gjëra të
--      prekshme rreth teje."
--
--      Ishte shkruar për panikun — për ta NDALUAR diçka që po ngjitet.
--      Meditimi i ri është për ta SJELLË një emocion të ri. Po të
--      mbetej, karta do të premtonte ndihmë në krizë dhe do të luante
--      diçka krejt tjetër.
--
--      I vjetri, për kthim me një urdhër:
--        UPDATE meditations SET description = CONCAT(
--          'Për çastin kur paniku po ngrihet. Seanca e ndal ciklin në pikën ',
--          'ku mendimi dhe trupi ushqejnë njëri-tjetrin: fryma ngadalësohet ',
--          'e para, pastaj vëmendja kthehet te dy-tre gjëra të prekshme rreth teje.')
--         WHERE id = '5ec89463-a510-11f1-b99e-107c614af9b1';
--
--  ✓  NUK PREK ASNJË NJOFTIM. Nga kjo teknikë, `08_pools.sql` merr vetëm
--     nën-grupin "Vetëbesimi" (te pishina `morning`). "Emocione" nuk është
--     te asnjë pishinë.
--
--  ⚠️  EMRI I SKEDARIT NDJEK TITULLIN. Te kompjuteri mp3-ja quhej
--      `Krijo Nje Emocion Te Ri.mp3` — me folje tjetër dhe me shkronja
--      të mëdha. Te serveri ngarkohet si `sill-nje-emocion-te-ri.mp3`.
--
--  Karta kalon nga "10 min" në "6 min".
--
--  Kohëzgjatja: 334 sekonda (5 min 34 s). E numëruar kornizë për kornizë
--  nga vetë mp3-ja — 13 937 korniza × 1152 mostra ÷ 48 000 Hz.

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Sill një emocion të ri',
       audio_url    = 'meditime/meditime-riprogramimi/sill-nje-emocion-te-ri.mp3',
       cover_url    = '/kopertina/sill-nje-emocion-te-ri.jpeg',
       duration_sec = 334,
       description  = NULL,
       benefits     = NULL
 WHERE id = '5ec89463-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — vetëm meditimi, dhe fqinjët e tij
-- ───────────────────────────────────────────────────────────────
--  Trembëdhjetë rreshta. "Sill një emocion të ri" i pari sipas alfabetit
--  pas "Rikthe shpresën"… me 334 s dhe të dy rrugët; të tjerët me 600.

SELECT m.title, m.duration_sec, m.cover_url
  FROM meditations m
  JOIN categories c ON c.id = m.category_id
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'meditime-riprogramimi'
   AND c.slug = 'emocionet'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET title = 'Dil nga paniku', audio_url = NULL,
--             cover_url = NULL, duration_sec = 600
--       WHERE id = '5ec89463-a510-11f1-b99e-107c614af9b1';
