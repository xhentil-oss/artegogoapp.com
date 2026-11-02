-- ═══════════════════════════════════════════════════════════════
--  FAL VETEN — audioja dhe kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Fal veten" (teknika "Meditime për Zemrën", kategoria "Falja")
--  merr audion dhe kopertinën e vet. Titulli NUK ndryshon.
--
--  Audioja u mat: **397 sekonda (6:37)**, 192 kbps, 48 kHz, 9.5 MB.
--
--  ⚠️  KOHËZGJATJA BIE NGA 10 MINUTA NË 6:37.
--
--      Te `04_meditations.sql` rreshti u mbill me 600 sekonda — një vlerë e
--      përafërt, e vendosur para se audioja të ekzistonte. Aplikacioni e
--      shfaq atë numër te kartela ("10 min" te pamja e klientes), ndaj pa
--      këtë ndreqje kartela do të premtonte tri minuta e gjysmë më shumë
--      nga sa luan vërtet.
--
--  ⚠️  EMRAT E SKEDARËVE: `fal-veten`, me vizë dhe pa shkronja të mëdha.
--
--      Skedarët e dërguar quheshin "Fal Veten.mp3" dhe "fal veten.jpeg";
--      `scripts/audio-manifest.txt:154` e pret rrugën pikërisht si
--      `meditime/meditime-per-zemren/fal-veten.mp3`, ndaj u riemërtuan.
--      Hapësira te një adresë interneti kthehet në `%20` dhe shkronja e
--      madhe te Linux-i është skedar tjetër — të dyja japin 404 në heshtje.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR:
--        audio     → public_html/meditime/meditime-per-zemren/
--        kopertina → public_html/kopertina/
--
--      Jo te `/home2/appdrartegogo/audio/`, siç e parashikon `audio/audio.php`:
--      ajo mbrojtje me link të nënshkruar rri te repo-ja dhe NUK është vendosur
--      te serveri. U mat më 2 nëntor 2026: `/audio/…` kthen 404, ndërsa
--      `/meditime/meditime-per-trupin/fli-shpejt.mp3` kthen 200 me audio/mpeg.
--      Dosja `meditime-per-zemren` nuk ekziston ende dhe duhet krijuar.

UPDATE meditations
   SET audio_url    = 'meditime/meditime-per-zemren/fal-veten.mp3',
       cover_url    = '/kopertina/fal-veten.jpeg',
       duration_sec = 397,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ec898fd-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht, me kohëzgjatjen e re dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ec898fd-a510-11f1-b99e-107c614af9b1';
