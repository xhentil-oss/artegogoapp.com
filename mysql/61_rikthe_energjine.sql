-- ═══════════════════════════════════════════════════════════════
--  "Para gjumit" → "Rikthe energjinë", me zë dhe kopertinë
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditime për Trupin" → Mbrëmje (nën-grupi "Në shtëpi").
--
--  ✓  NJË URDHËR I VETËM. Pa zip faqeje, pa Restart Node-i.
--     Dosja `meditime-per-trupin` ekziston tashmë te serveri.
--
--  ⚠️  DY MEDITIME QUHEN "Para gjumit". I DUHURI ËSHTË KY:
--
--        5ecde7a2  Meditime për Trupin → Mbrëmje        (nën-grupi "Në shtëpi")
--        5ed097f2  Meditime për Trupin → Fëmijët 8–12   (nën-grupi "Për fëmijë")
--
--      I dyti është për fëmijë dhe nuk preket. Prandaj WHERE-i është mbi
--      `id`, kurrë mbi titullin — një UPDATE mbi `title = 'Para gjumit'`
--      do t'i riemëronte të dy.
--
--  ⚠️  PËRSHKRIMI HIQET. TRE GJËRA TË TIJA BËHEN TË PASAKTA.
--
--      I vjetri: "Rituali i shkurtër i mbrëmjes. Trupi lëshohet zonë pas
--      zone, dita mbyllet me një fjali, dhe mendimet për nesër lihen
--      jashtë dhomës. Pesë minuta që e përgatitin gjumin para se të
--      shtrihesh."
--
--        1. "Pesë minuta" — zgjat 13 minuta e 43 sekonda.
--        2. "i shkurtër" — nuk është më.
--        3. "e përgatitin gjumin" — titulli i ri thotë të kundërtën,
--           se energjia kthehet.
--
--      I vjetri, për kthim me një urdhër:
--        UPDATE meditations SET description = CONCAT(
--          'Rituali i shkurtër i mbrëmjes. Trupi lëshohet zonë pas zone, ',
--          'dita mbyllet me një fjali, dhe mendimet për nesër lihen jashtë ',
--          'dhomës. Pesë minuta që e përgatitin gjumin para se të shtrihesh.')
--         WHERE id = '5ecde7a2-a510-11f1-b99e-107c614af9b1';
--
--  ⚠️  FQINJ ME KUPTIM TË AFËRT: "Rimbush energjinë" (`5ecaeec0`,
--      Afirmime → Energji e lartë). Nuk përplasen — fjalë të ndryshme,
--      dosje të ndryshme — por thonë thuajse të njëjtën gjë. Po të duash
--      ta ndash, titulli bëhet p.sh. "Rikthe energjinë e mbrëmjes".
--
--  ⚠️  KY RRESHT ËSHTË TE PISHINA E MBRËMJES. `08_pools.sql` fut te
--      pishina `evening` çdo meditim të teknikës `meditime-per-trupin`
--      me nën-grupin "Në shtëpi" — pra edhe këtë. Pishina mban
--      `meditation_id`, ndaj riemërtimi nuk e prek. Nën-grupi nuk
--      ndryshohet.
--
--  ⚠️  EMRI I SKEDARIT NDJEK TITULLIN. Te kompjuteri mp3-ja quhej
--      `Meditim mbremje 2.mp3`; te serveri ngarkohet si
--      `rikthe-energjine.mp3`.
--
--  Karta kalon nga "5 min" në "14 min".
--
--  Kohëzgjatja: 823 sekonda (13 min 43 s). E numëruar kornizë për kornizë
--  nga vetë mp3-ja — 34 305 korniza × 1152 mostra ÷ 48 000 Hz.

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Rikthe energjinë',
       audio_url    = 'meditime/meditime-per-trupin/rikthe-energjine.mp3',
       cover_url    = '/kopertina/rikthe-energjine.jpeg',
       duration_sec = 823,
       description  = NULL,
       benefits     = NULL
 WHERE id = '5ecde7a2-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — kategoria Mbrëmje
-- ───────────────────────────────────────────────────────────────
--  Katër rreshta. "Rikthe energjinë" me 823 s dhe të dy rrugët;
--  "Para darkës", "Pas debatit" dhe "Pas lajmit të keq" mbeten me 300 s.

SELECT m.title, m.duration_sec, m.subgroup, m.cover_url
  FROM meditations m
  JOIN categories c ON c.id = m.category_id
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'meditime-per-trupin'
   AND c.slug = 'mbremje'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET title = 'Para gjumit', audio_url = NULL,
--             cover_url = NULL, duration_sec = 300
--       WHERE id = '5ecde7a2-a510-11f1-b99e-107c614af9b1';
