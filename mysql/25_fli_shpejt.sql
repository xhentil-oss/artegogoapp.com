-- ═══════════════════════════════════════════════════════════════
--  FLI SHPEJT — audioja dhe kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi i parë i plotë me audio (jo ushtrim frymëmarrjeje): teknika
--  "Meditime për Trupin", kategoria Gjumi. Titulli nuk ndryshon.
--
--  Audioja u mat: **529 sekonda (8:49)**, 192 kbps, 12.7 MB.
--
--  ⚠️  DOSJA E AUDIOS ËSHTË TJETËR nga ajo e ushtrimeve:
--        meditime/meditime-per-trupin/fli-shpejt.mp3
--
--      Çdo teknikë ka dosjen e vet, ashtu si te `scripts/audio-manifest.txt`.
--      Te serveri ekziston vetëm `meditime/vizualizim/` dhe
--      `meditime/frymemarrje/` — pra `meditime-per-trupin` duhet krijuar.
--
--  ⚠️  KUJDES ME PRAPASHTESËN: Windows-i e fsheh atë të njohurën. Kontrolloje
--      emrin te File Manager pas ngarkimit — duhet `fli-shpejt.mp3`.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR.

UPDATE meditations
   SET audio_url    = 'meditime/meditime-per-trupin/fli-shpejt.mp3',
       cover_url    = '/kopertina/fli-shpejt.jpeg',
       duration_sec = 529,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ec8a03b-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me të dyja rrugët dhe 529 sekonda.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ec8a03b-a510-11f1-b99e-107c614af9b1';
