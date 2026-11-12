-- ═══════════════════════════════════════════════════════════════
--  "Meditim për të marrë bekime" — kopertina e re
--  dhe zëri që nuk ishte ngarkuar kurrë
--  12 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te Vizualizim → Ndiej bollëkun, nën-grupi "Ndërgjegje e lartë".
--
--  ✓  I FUNDIT NGA GJASHTË TË 11 SHTATORIT. Me këtë mbyllet puna e
--     nisur te `13_gjashte_meditime.sql`: të gjashtë kanë tani kopertinë
--     dhe zë që luan vërtet. Pesë prej tyre kishin dy muaj që ishin të
--     heshtur pa e ditur askush — rreshti ishte i plotë te databaza,
--     por skedari nuk ndodhej te disku.
--
--  ✓  SQL-ja prek VETËM KOPERTINËN.
--
--  ⚠️  ZËRI ISHTE NË DATABAZË QË NGA 11 SHTATORI, POR JO TE DISKU.
--      `meditime/vizualizim/meditim-per-te-marre-bekime.mp3` kthen 404
--      edhe sot. Rruga te databaza NUK NDRYSHON — skedari ngarkohet me
--      pikërisht atë emër dhe adresa fillon të punojë.
--
--  ⚠️  KOHËZGJATJA NUK PREKET. Është 600 dhe mbetet 600. E rinumërova
--      kornizë për kornizë nga mp3-ja që dërgove — 25 002 korniza × 1152
--      mostra ÷ 48 000 Hz = 600,05 s, pra fiks 10 minuta. I njëjti
--      regjistrim për të cilin u shkrua rreshti në shtator.
--
--  ⚠️  KOPERTINA E VJETËR NUK FSHIHET NGA SERVERI.
--      `meditim-per-te-marre-bekime.jpeg` mbetet aty (e provuar sot:
--      200, 174 067 bajt). E reja ngarkohet me "-2" te fundi, siç e
--      dërgove. Dy arsye, të njëjtat si te ndërgjegjja sot: kthimi prapa
--      bëhet me një rresht, dhe telefonat që e kanë ruajtur foton e
--      vjetër te memoria nuk vazhdojnë ta shfaqin atë me ditë.
--
--  ⚠️  PËRSHKRIMI DHE TITULLI NUK PREKEN. "Hapja e duarve dhe e zemrës
--      për të pranuar atë që vjen."
--
--  ✓  NUK ËSHTË MES 204-ve TË FSHEHURA. Nuk duhet urdhër kthimi nga
--     `fshehja_11_nentor`.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--
--  ⚠️  MP3-JA SHKON TE `public_html/meditime/vizualizim/`, JO TE
--      `public_html/meditime/`.

SET NAMES utf8mb4;

UPDATE meditations
   SET cover_url = '/kopertina/meditim-per-te-marre-bekime-2.jpeg'
 WHERE id = '73b9e006-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me kopertinën e re, 600 dhe rrugën e zërit.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '73b9e006-ab5c-11f1-97ee-107c614af9b1';


-- Kontroll i dytë: të gjashtë meditimet e "Ndërgjegje e lartë",
-- secili me kopertinën e vet. Duhen 6 rreshta.
SELECT title, duration_sec, cover_url
  FROM meditations
 WHERE subgroup = 'Ndërgjegje e lartë'
   AND published_at IS NOT NULL
   AND is_block = 0
 ORDER BY title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH KOPERTINËN E VJETËR, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET cover_url = '/kopertina/meditim-per-te-marre-bekime.jpeg'
--       WHERE id = '73b9e006-ab5c-11f1-97ee-107c614af9b1';
