-- ═══════════════════════════════════════════════════════════════
--  RELAKSIM I THELLË 4×8 — titulli, audioja dhe kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Për panik" (teknika Frymëmarrje, kategoria Stres) merr titullin e
--  plotë. Udhëzuesi pamor — rrethi me 4 sekonda brenda dhe 8 jashtë, pesë
--  raunde — njihet nga id-ja dhe nga titulli; shih `src/domain/breathing.js`.
--
--  Audioja u mat: **61.2 sekonda**. Ushtrimi zgjat 60 (5 × 12).
--
--  ⚠️  EMRAT E SKEDARËVE MBETEN `per-panik`, jo titulli i ri — si te dy SQL-të
--      e mëparshme. `scripts/audio-manifest.txt` i pret ashtu.
--
--  ⚠️  KUJDES ME PRAPASHTESËN: Windows-i e fsheh atë të njohurën. Kontrolloje
--      emrin te File Manager pas ngarkimit — duhet `per-panik.mp3`, pa `.mpeg`.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR.

UPDATE meditations
   SET title        = 'Relaksim i thellë me frymëmarrje 4x8',
       audio_url    = 'meditime/frymemarrje/per-panik.mp3',
       cover_url    = '/kopertina/per-panik.jpeg',
       duration_sec = 61,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ecc158c-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me titullin e ri dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ecc158c-a510-11f1-b99e-107c614af9b1';
