-- ═══════════════════════════════════════════════════════════════
--  "Meditim për të manifestuar me dritë" — kopertina e re
--  dhe zëri që nuk ishte ngarkuar kurrë
--  12 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te Vizualizim → Manifestim, nën-grupi "Ndërgjegje e lartë".
--  I katërti sot nga të njëjtët gjashtë të 11 shtatorit.
--
--  ✓  SQL-ja prek VETËM KOPERTINËN.
--
--  ⚠️  ZËRI ISHTE NË DATABAZË QË NGA 11 SHTATORI, POR JO TE DISKU.
--      `meditime/vizualizim/meditim-per-te-manifestuar-me-drite.mp3`
--      kthen 404 edhe sot. Rruga te databaza NUK NDRYSHON — skedari
--      ngarkohet me pikërisht atë emër dhe adresa fillon të punojë.
--
--  ⚠️  KOHËZGJATJA NUK PREKET. Është 570 dhe mbetet 570. E rinumërova
--      kornizë për kornizë nga mp3-ja që dërgove — 23 760 korniza × 1152
--      mostra ÷ 48 000 Hz = 570,24 s (9 min 30 s). I njëjti regjistrim
--      për të cilin u shkrua rreshti në shtator; karta shkruan "10 min".
--
--  ⚠️  KOPERTINA E VJETËR NUK FSHIHET NGA SERVERI.
--      `meditim-per-te-manifestuar-me-drite.jpeg` mbetet aty (e provuar
--      sot: 200). E reja ngarkohet si `manifesto-me-drite.jpeg`, ashtu
--      siç e dërgove. Kthimi prapa është një rresht, pa ringarkuar asgjë.
--
--  ⚠️  TITULLI NUK NDRYSHON. Emri i skedarit ("manifesto me dritë") është
--      më i shkurtër se titulli ("Meditim për të manifestuar me dritë") —
--      me dashje, ashtu e dërgove. Karta nuk preket.
--
--  ⚠️  PËRSHKRIMI NUK PREKET. "Manifestim përmes dritës — qëllimi vishet
--      me ndjesi dhe formë." Nuk përmend asnjë numër minutash.
--
--  ✓  NUK ËSHTË MES 204-ve TË FSHEHURA. Nuk duhet urdhër kthimi nga
--     `fshehja_11_nentor`.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--
--  ⚠️  MP3-JA SHKON TE `public_html/meditime/vizualizim/`, JO TE
--      `public_html/meditime/`. Sot një skedar ngeci pikërisht atje dhe
--      karta mbeti e heshtur edhe pse ngarkimi kishte shkuar mirë.

SET NAMES utf8mb4;

UPDATE meditations
   SET cover_url = '/kopertina/manifesto-me-drite.jpeg'
 WHERE id = '73b9df5f-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me kopertinën e re, 570 dhe rrugën e zërit.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '73b9df5f-ab5c-11f1-97ee-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH KOPERTINËN E VJETËR, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET cover_url = '/kopertina/meditim-per-te-manifestuar-me-drite.jpeg'
--       WHERE id = '73b9df5f-ab5c-11f1-97ee-107c614af9b1';
