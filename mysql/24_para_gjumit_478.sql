-- ═══════════════════════════════════════════════════════════════
--  4-7-8 PARA GJUMIT — titulli, audioja dhe kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Për ankth" (teknika Frymëmarrje, kategoria Stres) merr titullin e
--  plotë. Udhëzuesi pamor — rrethi me TRI faza: 4 brenda, 7 mbajtje, 8 jashtë,
--  katër raunde — njihet nga id-ja dhe nga titulli; shih
--  `src/domain/breathing.js`.
--
--  Audioja u mat: **78.0 sekonda**. Ushtrimi zgjat 76 (4 × 19), ndaj dy
--  sekondat e fundit mbeten bisht.
--
--  ⚠️  EMRAT E SKEDARËVE MBETEN `per-ankth`, si te SQL-të e mëparshme:
--      `scripts/audio-manifest.txt` i pret ashtu.
--
--  ⚠️  KUJDES ME PRAPASHTESËN. Kontrolloje emrin te File Manager pas
--      ngarkimit — duhet `per-ankth.mp3`, pa `.mpeg`.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR.

UPDATE meditations
   SET title        = 'Frymëmarrje ritmike 4x7x8 para gjumit për qetësim',
       audio_url    = 'meditime/frymemarrje/per-ankth.mp3',
       cover_url    = '/kopertina/per-ankth.jpeg',
       duration_sec = 78,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ecc15d3-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me titullin e ri dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ecc15d3-a510-11f1-b99e-107c614af9b1';
