-- ═══════════════════════════════════════════════════════════════
--  NDIEJ MOTIVIM — titulli, audioja, kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Fokus ekstrem" (teknika "Meditime për Trurin", kategoria
--  "Tru i fuqizuar") merr titullin e ri dhe përmbajtjen e vet.
--
--  Audioja u mat: **720 sekonda (12:00)**, 192 kbps, 48 kHz, 17.3 MB.
--
--  ⚠️  EMRI I SKEDARËVE MBETET `fokus-ekstrem`, jo titulli i ri dhe jo emri
--      me të cilin erdhën ("Ndiej motivim.mp3", "ndiej motivim.jpeg") —
--      rruga te baza dhe te `scripts/audio-manifest.txt` është
--      `meditime/meditime-per-trurin/fokus-ekstrem.mp3`.
--
--  ⚠️  Kohëzgjatja ngjitet nga 10 në 12 minuta — vlera 600 ishte e përafërt,
--      e mbjellë para se audioja të ekzistonte.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR:
--        audio     → public_html/meditime/meditime-per-trurin/
--        kopertina → public_html/kopertina/

UPDATE meditations
   SET title        = 'Ndiej motivim dhe përfundo punën me sukses',
       audio_url    = 'meditime/meditime-per-trurin/fokus-ekstrem.mp3',
       cover_url    = '/kopertina/fokus-ekstrem.jpeg',
       duration_sec = 720,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ec89d72-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me titullin e ri dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ec89d72-a510-11f1-b99e-107c614af9b1';
