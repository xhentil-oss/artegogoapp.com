-- ═══════════════════════════════════════════════════════════════
--  TËRHIQ SHPIRTIN BINJAK — zëri, kopertina dhe koha
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditime manifestimi" → Manifestim. Vijon `50_terhiq_shpirtin_binjak.sql`,
--  që ndryshoi vetëm titullin; tani meditimi bëhet i plotë.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--
--  ⚠️  PËRSHKRIMI NUK PREKET — ndryshe nga "Ec dhe ndiej energjinë e
--      jetës së re", ku teksti i vjetër fliste për këmbët në dysheme
--      kurse meditimi ishte në ecje.
--
--      Këtu i vjetri rri saktë: "Manifestim i një lidhjeje. Puna nis nga
--      ajo që do të ndiesh pranë atij njeriu, jo nga pamja e tij, dhe
--      mbaron me hapjen ndaj takimit." Kjo është pikërisht ajo që bën
--      titulli i ri. `benefits` mbetet bosh; fletja i merr nga harta
--      sipas qëllimit.
--
--  ⚠️  DOSJA `meditime-manifestimi` NUK EKZISTON te serveri — u provua
--      më 11 nëntor, kthen 404. Duhet krijuar para ngarkimit të mp3-së.
--      Asnjë nga shtatë meditimet e manifestimit nuk ka pasur zë deri tani.
--
--  ⚠️  KUSHTI MBETET MBI `id`. Titulli u ndërrua tashmë nga `50`, ndaj
--      "Manifesto partner" që ka mbetur është ai i Frymëmarrjes
--      (`5ecc193a-a510-11f1-b99e-107c614af9b1`) — një rresht krejt tjetër,
--      që nuk preket as këtu.
--
--  Kohëzgjatja: 290 sekonda (4 min 50 s). E numëruar kornizë për kornizë
--  nga vetë mp3-ja — 12 078 korniza × 1152 mostra ÷ 48 000 Hz.
--  Karta do të shkruajë "5 min".

SET NAMES utf8mb4;

UPDATE meditations
   SET audio_url    = 'meditime/meditime-manifestimi/terhiq-shpirtin-binjak.mp3',
       cover_url    = '/kopertina/terhiq-shpirtin-binjak.jpeg',
       duration_sec = 290
 WHERE id = '5ecaef91-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me të dy rrugët, 290, dhe përshkrimin e ruajtur.
SELECT id, title, duration_sec, audio_url, cover_url, description
  FROM meditations
 WHERE id = '5ecaef91-a510-11f1-b99e-107c614af9b1';
