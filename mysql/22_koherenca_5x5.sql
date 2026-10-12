-- ═══════════════════════════════════════════════════════════════
--  KOHERENCA E ZEMRËS 5×5 — titulli, audioja dhe kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Coherence breathing" (teknika Frymëmarrje, kategoria Shëndeti)
--  merr titullin e plotë. Udhëzuesi pamor — rrethi me dy faza nga 5 sekonda,
--  gjashtë raunde — njihet nga id-ja dhe nga titulli; shih
--  `src/domain/breathing.js`.
--
--  Audioja u mat: **61.6 sekonda**. Ushtrimi zgjat 60 (6 × 10), ndaj sekonda e
--  gjysmë e mbetur rri në fund si bisht — figura mbyllet me "MBARUAR" ndërsa
--  zëri shuhet.
--
--  ⚠️  EMRAT E SKEDARËVE MBETEN `coherence-breathing`, jo titulli i ri — si te
--      `21_frymemarrje_4x6.sql`. `scripts/audio-manifest.txt` i pret ashtu, dhe
--      titulli është ajo që lexon përdoruesi, jo emri i skedarit.
--
--  ⚠️  KUJDES ME PRAPASHTESËN: Windows-i e fsheh atë të njohurën, dhe një
--      skedar i riemërtuar në "coherence-breathing.mp3" ruhet në të vërtetë si
--      `coherence-breathing.mp3.mpeg`. Ndodhi dy herë më parë. Kontrolloje te
--      File Manager, ku prapashtesa duket e plotë.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR.

UPDATE meditations
   SET title        = 'Rikthe koherencën e zemrës me frymëmarrje 5x5',
       audio_url    = 'meditime/frymemarrje/coherence-breathing.mp3',
       cover_url    = '/kopertina/coherence-breathing.jpeg',
       duration_sec = 62,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ecc1a59-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me titullin e ri dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ecc1a59-a510-11f1-b99e-107c614af9b1';
