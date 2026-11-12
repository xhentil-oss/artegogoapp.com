-- ═══════════════════════════════════════════════════════════════
--  "Meditim për të lexuar librin e jetës" — kopertina e re
--  dhe zëri që nuk ishte ngarkuar kurrë
--  12 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te Vizualizim → Intuita, nën-grupi "Ndërgjegje e lartë".
--  E njëjta situatë si te `67_gjej_rrugen_me_te_larte.sql` sot.
--
--  ✓  SQL-ja prek VETËM KOPERTINËN.
--
--  ⚠️  ZËRI ISHTE NË DATABAZË QË NGA 11 SHTATORI, POR JO TE DISKU.
--
--      `13_gjashte_meditime.sql` e futi këtë rresht me
--        audio_url = 'meditime/vizualizim/meditim-per-te-lexuar-librin-e-jetes.mp3'
--      por mp3-ja nuk u ngarkua kurrë. Sot, para se të nisim, adresa
--      ktheu 404. Karta hapej dhe nuk luante asgjë.
--
--      Rruga te databaza NUK NDRYSHON. Skedari ngarkohet me pikërisht
--      atë emër, te `public_html/meditime/vizualizim/`.
--
--  ⚠️  KOHËZGJATJA NUK PREKET. Është 636 dhe mbetet 636. E rinumërova
--      kornizë për kornizë nga mp3-ja që dërgove — 26 487 korniza × 1152
--      mostra ÷ 48 000 Hz = 635,69 s (10 min 36 s). Pra është i njëjti
--      regjistrim për të cilin u shkrua rreshti në shtator; karta shkruan
--      "11 min" dhe do të vazhdojë ta shkruajë ashtu.
--
--  ⚠️  KOPERTINA E VJETËR NUK FSHIHET NGA SERVERI.
--      `meditim-per-te-lexuar-librin-e-jetes.jpeg` mbetet aty ku është
--      (e provuar sot: kthen 200). E reja ngarkohet me emër tjetër,
--      `meditim-per-te-lexuar.jpeg`, ashtu siç e dërgove. Kështu kthimi
--      prapa është një rresht i vetëm, pa ringarkuar asgjë.
--
--  ⚠️  TITULLI NUK NDRYSHON. Emri i skedarit është më i shkurtër se
--      titulli — kjo është me dashje, ashtu e dërgove. Te aplikacioni
--      karta vazhdon të shkruajë "Meditim për të lexuar librin e jetës".
--
--  ⚠️  PËRSHKRIMI NUK PREKET. "Hapje ndaj dijes që mban historia e
--      shpirtit tënd." — nuk përmend asnjë numër minutash.
--
--  ✓  NUK ËSHTË MES 204-ve TË FSHEHURA. Kishte kopertinë që më 11
--      shtator, ndaj `65_fshehja_e_vendmbajtesve.sql` e la jashtë.
--      Nuk duhet asnjë urdhër kthimi nga `fshehja_11_nentor`.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.

SET NAMES utf8mb4;

UPDATE meditations
   SET cover_url = '/kopertina/meditim-per-te-lexuar.jpeg'
 WHERE id = '73b9de8a-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me kopertinën e re, 636 dhe rrugën e zërit.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '73b9de8a-ab5c-11f1-97ee-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH KOPERTINËN E VJETËR, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET cover_url = '/kopertina/meditim-per-te-lexuar-librin-e-jetes.jpeg'
--       WHERE id = '73b9de8a-ab5c-11f1-97ee-107c614af9b1';
