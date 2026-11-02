-- ═══════════════════════════════════════════════════════════════
--  FAL DIKË — audioja dhe kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Fal dikë" (teknika "Meditime për Zemrën", kategoria "Falja")
--  merr audion dhe kopertinën e vet. Titulli NUK ndryshon.
--
--  Audioja u mat: **670 sekonda (11:10)**, 192 kbps, 48 kHz, 16.1 MB.
--
--  ⚠️  KOHËZGJATJA NGJITET NGA 10 MINUTA NË 11:10 — si te "Fal veten", vlera
--      600 ishte e përafërt, e mbjellë para se audioja të ekzistonte.
--
--  ⚠️  EMRAT E SKEDARËVE: `fal-dike`, me vizë dhe pa shkronja të mëdha.
--
--      Skedarët e dërguar quheshin "Fal Dike Tjeter.mp3" dhe "fal dike.jpeg".
--      Te "Fal veten" ngarkimi u bë me emrat e vjetër dhe të dy skedarët u
--      ndodhën te serveri pa u parë nga aplikacioni, ndaj këtë radhë emrat u
--      ndreqën që te burimi — edhe te dosja e Shkarkimeve.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR:
--        audio     → public_html/meditime/meditime-per-zemren/
--        kopertina → public_html/kopertina/
--
--      Dosja `meditime-per-zemren` tani ekziston; u krijua me "Fal veten".

UPDATE meditations
   SET audio_url    = 'meditime/meditime-per-zemren/fal-dike.mp3',
       cover_url    = '/kopertina/fal-dike.jpeg',
       duration_sec = 670,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ec89944-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht, me kohëzgjatjen e re dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ec89944-a510-11f1-b99e-107c614af9b1';
