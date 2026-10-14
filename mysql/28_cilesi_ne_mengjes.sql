-- ═══════════════════════════════════════════════════════════════
--  AKTIVIZO NJË CILËSI — titulli, audioja, kopertina
-- ═══════════════════════════════════════════════════════════════
--
--  Meditimi "Energjia e mëngjesit" (teknika "Meditime për Trupin", kategoria
--  "Energji e lartë") merr titullin e ri dhe përmbajtjen e vet.
--
--  Audioja u mat: **330 sekonda (5:30)**, 192 kbps, 7.6 MB.
--
--  ⚠️  EMRI I SKEDARËVE MBETET `energjia-e-mengjesit`, jo titulli i ri.
--
--      Kujdes: te `scripts/audio-manifest.txt` ekziston edhe
--      `meditime/frymemarrje/energji-ne-mengjes.mp3` — një meditim TJETËR, te
--      teknika e frymëmarrjes. Dy emra të ngjashëm, dy skedarë të ndryshëm.
--
--  ⚠️  EKZEKUTOHET PASI SKEDARËT TË JENË NGARKUAR.

UPDATE meditations
   SET title        = 'Aktivizo një cilësi dhe fito energji në mëngjes',
       audio_url    = 'meditime/meditime-per-trupin/energjia-e-mengjesit.mp3',
       cover_url    = '/kopertina/energjia-e-mengjesit.jpeg',
       duration_sec = 330,
       published_at = COALESCE(published_at, NOW())
 WHERE id = '5ecaed4e-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht me titullin e ri dhe të dyja rrugët.
SELECT id, title, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ecaed4e-a510-11f1-b99e-107c614af9b1';
