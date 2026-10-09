-- ═══════════════════════════════════════════════════════════════
--  BOX BREATHING — audioja, kopertina dhe kohëzgjatja e vërtetë
-- ═══════════════════════════════════════════════════════════════
--
--  Audioja `3Fryma4x4` u mat: **64.1 sekonda** — saktësisht 4 raunde × 16 s
--  (4-4-4-4), pa hyrje. Prandaj udhëzuesi pamor te player-i nis në sekondën
--  zero dhe nuk ka asnjë zhvendosje për të rregulluar.
--
--  ⚠️  RRUGËT DUHET TË JENË SAKTËSISHT KËTO:
--        audio      → meditime/frymemarrje/box-breathing.mp3
--        kopertina  → /kopertina/box-breathing.jpeg
--
--      `scripts/audio-manifest.txt` e pret skedarin te e para, dhe serveri e
--      nënshkruan lidhjen mbi të njëjtën rrugë. Një emër tjetër do të thoshte
--      404 te dëgjimi, me meditimin që duket i rregullt te lista.
--
--  ⚠️  KUJDES ME PRAPASHTESËN. Windows-i e fsheh atë të njohurën: një skedar
--      i riemërtuar në "box-breathing.mp3" ruhet në të vërtetë si
--      `box-breathing.mp3.mpeg`, dhe serveri nuk e gjen. Ndodhi pikërisht
--      kështu më 9 tetor 2026. Kontrolloje emrin te File Manager, ku
--      prapashtesa duket gjithmonë e plotë.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR. Përndryshe meditimi del si
--      i gatshëm dhe dëgjimi dështon — më keq se të mos jetë fare.
--
--  `duration_sec` ndryshon te 64: ishte një vlerë e planifikuar, ndërsa tani
--  dihet e vërteta. Pa këtë, shiriti i progresit do të matej mbi një gjatësi
--  që nuk ekziston.

UPDATE meditations
   SET audio_url    = 'meditime/frymemarrje/box-breathing.mp3',
       cover_url    = '/kopertina/box-breathing.jpeg',
       duration_sec = 64,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ecc1a98-a510-11f1-b99e-107c614af9b1';

-- Kontroll: duhet të dalë një rresht me të dyja rrugët dhe 64 sekonda.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ecc1a98-a510-11f1-b99e-107c614af9b1';
