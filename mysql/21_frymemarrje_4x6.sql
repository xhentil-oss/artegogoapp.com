-- ═══════════════════════════════════════════════════════════════
--  FRYMËMARRJE RITMIKE 4×6 — titulli, audioja dhe kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Për stres" (teknika Frymëmarrje, kategoria Stres) merr titullin e
--  plotë dhe përmbajtjen e vet. Udhëzuesi pamor te player-i — rrethi me dy
--  faza, 4 sekonda brenda dhe 6 jashtë, gjashtë raunde — njihet nga id-ja dhe
--  nga titulli; shih `src/domain/breathing.js`.
--
--  Audioja u mat: **62.2 sekonda**. Ushtrimi zgjat 60 (6 × 10), ndaj dy
--  sekondat e mbetura rrinë në fund si bisht — figura e mbyll ciklin dhe
--  tregon "MBARUAR" ndërsa zëri shuhet.
--
--  ⚠️  EMRAT E SKEDARËVE MBETEN `per-stres`, jo titulli i ri.
--
--      `scripts/audio-manifest.txt` e pret audion te
--      `meditime/frymemarrje/per-stres.mp3`, dhe ai manifest ka 250 rrugë që
--      përdoren nga skripti i ngarkimit. Një emër i ndryshuar vetëm për këtë
--      të vetmin do të thoshte dy burime që nuk pajtohen. Titulli është ai që
--      lexon përdoruesi; emri i skedarit është punë e brendshme.
--
--  ⚠️  KUJDES ME PRAPASHTESËN. Windows-i e fsheh atë të njohurën: një skedar i
--      riemërtuar në "per-stres.mp3" ruhet në të vërtetë si
--      `per-stres.mp3.mpeg` dhe serveri nuk e gjen. Ndodhi kështu me Box
--      breathing më 9 tetor 2026. Kontrolloje emrin te File Manager, ku
--      prapashtesa duket gjithmonë e plotë.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR.

UPDATE meditations
   SET title        = 'Frymëmarrje ritmike 4x6 për lirim nga stresi',
       audio_url    = 'meditime/frymemarrje/per-stres.mp3',
       cover_url    = '/kopertina/per-stres.jpeg',
       duration_sec = 62,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ecc1612-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me titullin e ri, 62 sekonda dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ecc1612-a510-11f1-b99e-107c614af9b1';
