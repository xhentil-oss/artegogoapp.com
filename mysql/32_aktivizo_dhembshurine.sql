-- ═══════════════════════════════════════════════════════════════
--  AKTIVIZO DHEMBSHURINË — audioja dhe kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Aktivizo dhembshurinë" (teknika "Meditime për Zemrën", kategoria
--  "Zemra plot") merr audion dhe kopertinën e vet. Titulli NUK ndryshon.
--
--  Audioja u mat: **585 sekonda (9:44)**, 192 kbps, 48 kHz, 14.0 MB.
--
--  ⚠️  EMRAT E SKEDARËVE NDRYSHOJNË NGA ATA TË DËRGUAR.
--
--      Erdhën si "Ndiej dhembshuri.mp3" dhe "aktivizo dhembsurine.jpeg" —
--      emri i audios i përket përmbajtjes, jo rreshtit. Te baza rruga është
--      `aktivizo-dhembshurine.mp3` (shih `04_meditations.sql:50` dhe
--      `scripts/audio-manifest.txt`), ndaj të dy skedarët u riemërtuan ashtu.
--      Vër re edhe "dhembsurine" → "dhembshurine": mungonte një `sh`.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR:
--        audio     → public_html/meditime/meditime-per-zemren/
--        kopertina → public_html/kopertina/

UPDATE meditations
   SET audio_url    = 'meditime/meditime-per-zemren/aktivizo-dhembshurine.mp3',
       cover_url    = '/kopertina/aktivizo-dhembshurine.jpeg',
       duration_sec = 585,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ec898b3-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht, me kohëzgjatjen e re dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ec898b3-a510-11f1-b99e-107c614af9b1';
