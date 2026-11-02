-- ═══════════════════════════════════════════════════════════════
--  TEJKALO PROKRASTINIMIN — titulli, audioja, kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Produktiviteti" (teknika "Meditime për Trurin", kategoria
--  "Fokus dhe performancë") merr titullin e ri dhe përmbajtjen e vet.
--
--  Audioja u mat: **670 sekonda (11:10)**, 192 kbps, 48 kHz, 16.1 MB.
--
--  ⚠️  EMRI I SKEDARËVE MBETET `produktiviteti`, jo titulli i ri dhe jo emri
--      me të cilin erdhën ("Jam i mjaftuesshem.mp3", "jam i mjaftueshem.jpeg").
--
--      Rruga te baza dhe te `scripts/audio-manifest.txt` është
--      `meditime/meditime-per-trurin/produktiviteti.mp3`; titulli është ajo
--      që lexon përdoruesi, emri i skedarit nuk del askund. Po ashtu u bë me
--      "Fli shpejt", "Ndjehu i lehtë" dhe të tjerët.
--
--  ⚠️  Kohëzgjatja ngjitet nga 10 minuta në 11:10 — vlera 600 ishte e
--      përafërt, e mbjellë para se audioja të ekzistonte.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR:
--        audio     → public_html/meditime/meditime-per-trurin/
--        kopertina → public_html/kopertina/

UPDATE meditations
   SET title        = 'Tejkalo prokrastinimin dhe rrit produktivitetin',
       audio_url    = 'meditime/meditime-per-trurin/produktiviteti.mp3',
       cover_url    = '/kopertina/produktiviteti.jpeg',
       duration_sec = 670,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ed09755-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me titullin e ri dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ed09755-a510-11f1-b99e-107c614af9b1';
