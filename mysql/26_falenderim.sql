-- ═══════════════════════════════════════════════════════════════
--  MEDITIM PËR TË NDIER FALENDERIM — titulli, audioja, kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Ndjehu i lehtë" (teknika "Meditime për Trupin", kategoria
--  "Energji e lartë") merr titullin e ri dhe përmbajtjen e vet.
--
--  Audioja u mat: **368 sekonda (6:08)**, 192 kbps, 8.4 MB.
--
--  ⚠️  EMRAT E SKEDARËVE MBETEN `ndjehu-i-lehte`, jo titulli i ri — si te të
--      gjitha SQL-të e mëparshme. `scripts/audio-manifest.txt` i pret ashtu,
--      dhe titulli është ajo që lexon përdoruesi, jo emri i skedarit.
--
--  ⚠️  Dosja është e njëjta si te "Fli shpejt":
--        meditime/meditime-per-trupin/ndjehu-i-lehte.mp3
--      Ajo u krijua me ngarkimin e mëparshëm, ndaj tani vetëm shtohet skedari.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR.

UPDATE meditations
   SET title        = 'Meditim për të ndier falenderim',
       audio_url    = 'meditime/meditime-per-trupin/ndjehu-i-lehte.mp3',
       cover_url    = '/kopertina/ndjehu-i-lehte.jpeg',
       duration_sec = 368,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ecaeefc-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me titullin e ri dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ecaeefc-a510-11f1-b99e-107c614af9b1';
