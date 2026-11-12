-- ═══════════════════════════════════════════════════════════════
--  "Meditim për të marrë dhe rrezatuar dritë" — kopertina e re
--  dhe zëri që nuk ishte ngarkuar kurrë
--  12 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te Vizualizim → Energji e lartë, nën-grupi "Ndërgjegje e lartë".
--  I pesti sot nga të njëjtët gjashtë të 11 shtatorit. Mbetet vetëm
--  "Meditim për të marrë bekime".
--
--  ✓  SQL-ja prek VETËM KOPERTINËN.
--
--  ⚠️  ZËRI ISHTE NË DATABAZË QË NGA 11 SHTATORI, POR JO TE DISKU.
--      `meditime/vizualizim/meditim-per-te-marre-dhe-rrezatuar-drite.mp3`
--      kthen 404 edhe sot. Rruga te databaza NUK NDRYSHON — skedari
--      ngarkohet me pikërisht atë emër dhe adresa fillon të punojë.
--
--  ⚠️  KOHËZGJATJA NUK PREKET. Është 547 dhe mbetet 547. E rinumërova
--      kornizë për kornizë nga mp3-ja që dërgove — 22 807 korniza × 1152
--      mostra ÷ 48 000 Hz = 547,37 s (9 min 7 s). I njëjti regjistrim
--      për të cilin u shkrua rreshti në shtator; karta shkruan "9 min".
--
--  ⚠️  KOPERTINA E VJETËR NUK FSHIHET NGA SERVERI.
--      `meditim-per-te-marre-dhe-rrezatuar-drite.jpeg` mbetet aty
--      (e provuar sot: 200, 352 496 bajt). E reja ngarkohet si
--      `merr-dhe-rezato-drite.jpeg`, ashtu siç e dërgove. Kthimi prapa
--      është një rresht, pa ringarkuar asgjë.
--
--  ⚠️  EMRI I SKEDARIT SHKRUHET "rezato", ME NJË R. Kështu e dërgove dhe
--      kështu mbetet — por kujdes të mos ngatërrohet me titullin, që
--      shkruhet "rrezatuar", me dy. Emri i skedarit nuk duket askund te
--      aplikacioni; rëndësi ka vetëm që të përputhet me rreshtin këtu.
--
--  ⚠️  PËRSHKRIMI DHE TITULLI NUK PREKEN. "Marrje dhe rrezatim drite —
--      mbushje e fushës dhe dhurim i saj."
--
--  ✓  NUK ËSHTË MES 204-ve TË FSHEHURA. Nuk duhet urdhër kthimi nga
--     `fshehja_11_nentor`.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--
--  ⚠️  MP3-JA SHKON TE `public_html/meditime/vizualizim/`, JO TE
--      `public_html/meditime/`. Sot një skedar ngeci pikërisht atje.

SET NAMES utf8mb4;

UPDATE meditations
   SET cover_url = '/kopertina/merr-dhe-rezato-drite.jpeg'
 WHERE id = '73b9e07d-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me kopertinën e re, 547 dhe rrugën e zërit.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '73b9e07d-ab5c-11f1-97ee-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH KOPERTINËN E VJETËR, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET cover_url = '/kopertina/meditim-per-te-marre-dhe-rrezatuar-drite.jpeg'
--       WHERE id = '73b9e07d-ab5c-11f1-97ee-107c614af9b1';
