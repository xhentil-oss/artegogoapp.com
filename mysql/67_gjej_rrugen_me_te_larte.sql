-- ═══════════════════════════════════════════════════════════════
--  "Meditim për të gjetur rrugën më të lartë" — kopertina e re
--  dhe zëri që nuk ishte ngarkuar kurrë
--  12 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te Vizualizim → Intuita, nën-grupi "Ndërgjegje e lartë".
--
--  ✓  SQL-ja prek VETËM KOPERTINËN. Pjesa tjetër e punës sot nuk është
--     te databaza — është një skedar që mungonte te serveri.
--
--  ⚠️  ZËRI ISHTE NË DATABAZË QË NGA 11 SHTATORI, POR JO TE DISKU.
--
--      `13_gjashte_meditime.sql` e futi këtë rresht me
--        audio_url = 'meditime/vizualizim/meditim-per-te-gjetur-rrugen-me-te-larte.mp3'
--      por mp3-ja nuk u ngarkua kurrë. Sot, para se të nisim, adresa
--      ktheu 404. Prandaj karta hapej dhe nuk luante asgjë.
--
--      Rruga te databaza NUK NDRYSHON. Skedari ngarkohet me pikërisht
--      atë emër, te `public_html/meditime/vizualizim/`, dhe adresa që
--      ekziston prej dy muajsh fillon të punojë. Një rresht SQL më pak.
--
--  ⚠️  KOHËZGJATJA NUK PREKET. Është 498 dhe mbetet 498. E rinumërova
--      kornizë për kornizë nga vetë mp3-ja që dërgove — 20 753 korniza
--      × 1152 mostra ÷ 48 000 Hz = 498,07 s (8 min 18 s). Pra është i
--      njëjti regjistrim për të cilin u shkrua rreshti në shtator; karta
--      shkruan "8 min" dhe do të vazhdojë ta shkruajë saktë.
--
--  ⚠️  KOPERTINA E VJETËR NUK FSHIHET NGA SERVERI.
--      `meditim-per-te-gjetur-rrugen-me-te-larte.jpeg` mbetet aty ku
--      është (e provuar sot: kthen 206). E reja ngarkohet me emër tjetër,
--      `gjej-rrugen-me-te-larte.jpeg`, ashtu siç e dërgove. Kështu kthimi
--      prapa është një rresht i vetëm, pa ringarkuar asgjë.
--
--  ⚠️  PËRSHKRIMI NUK PREKET. "Udhërrëfim i brendshëm drejt zgjedhjes më
--      të lartë — kur mendja nuk e di nga t'ia mbajë." Titulli nuk ndryshon
--      dhe përshkrimi nuk përmend asnjë numër minutash.
--
--  ✓  NUK ËSHTË MES 204-ve TË FSHEHURA. Ky meditim kishte kopertinë që
--      më 11 shtator, ndaj `65_fshehja_e_vendmbajtesve.sql` e la jashtë.
--      Nuk duhet asnjë urdhër kthimi nga `fshehja_11_nentor`.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--     Të dyja dosjet ekzistojnë tashmë te serveri.

SET NAMES utf8mb4;

UPDATE meditations
   SET cover_url = '/kopertina/gjej-rrugen-me-te-larte.jpeg'
 WHERE id = '73b9c201-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me kopertinën e re, 498 dhe rrugën e zërit.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '73b9c201-ab5c-11f1-97ee-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH KOPERTINËN E VJETËR, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET cover_url = '/kopertina/meditim-per-te-gjetur-rrugen-me-te-larte.jpeg'
--       WHERE id = '73b9c201-ab5c-11f1-97ee-107c614af9b1';
