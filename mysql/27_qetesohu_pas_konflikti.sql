-- ═══════════════════════════════════════════════════════════════
--  QETËSOHU PAS NJË KONFLIKTI — titulli, audioja, kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Meditime familjare" (teknika "Meditime për Trupin", kategoria
--  "Përmirësimi i marrëdhënieve") merr titullin e ri dhe përmbajtjen e vet.
--
--  Audioja u mat: **540 sekonda (9:00)**, 192 kbps, 12.4 MB.
--
--  ⚠️  EMRI I SKEDARËVE MBETET `meditime-familjare`, jo titulli i ri — si te
--      të gjitha SQL-të e mëparshme; `scripts/audio-manifest.txt` e pret ashtu.
--
--  ⚠️  Dosja është e njëjta si te dy meditimet e fundit:
--        meditime/meditime-per-trupin/meditime-familjare.mp3
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR.

UPDATE meditations
   SET title        = 'Qetësohu pas një konflikti',
       audio_url    = 'meditime/meditime-per-trupin/meditime-familjare.mp3',
       cover_url    = '/kopertina/meditime-familjare.jpeg',
       duration_sec = 540,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ed099cc-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me titullin e ri dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ed099cc-a510-11f1-b99e-107c614af9b1';
