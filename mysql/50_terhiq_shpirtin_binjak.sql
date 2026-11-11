-- ═══════════════════════════════════════════════════════════════
--  "Manifesto partner" → "Tërhiq shpirtin binjak"
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditime manifestimi" → Manifestim.
--
--  ✓  VETËM TITULLI. Një urdhër, asnjë skedar, pa zip faqeje, pa
--     Restart Node-i. Titujt vijnë nga serveri dhe lexohen sa herë
--     hapet aplikacioni.
--
--  ⚠️  DY RRESHTA E MBAJNË KËTË TITULL. Përveç këtij, ka edhe një
--      "Manifesto partner" te teknika Frymëmarrje
--      (`5ecc193a-a510-11f1-b99e-107c614af9b1`). Ndryshohet VETËM ai i
--      Meditimeve të manifestimit — ai që u rrethua te fotoja. Prandaj
--      kushti është mbi `id`, kurrë mbi titullin: një
--      `WHERE title = 'Manifesto partner'` do t'i riemërtonte të dy.
--
--  ⚠️  PËRSHKRIMI NUK PREKET. "Manifestim i një lidhjeje. Puna nis nga
--      ajo që do të ndiesh pranë atij njeriu, jo nga pamja e tij, dhe
--      mbaron me hapjen ndaj takimit." — i rri po aq mirë titullit të ri
--      sa të vjetrit. Ndryshe nga "Aktivizo autoritetin", ku teksti i
--      vjetër fliste për diçka tjetër fare.
--
--  ⚠️  KY MBETET VENDMBAJTËS. Pas riemërtimit ka ende 10 minuta të
--      sajuara, pa zë dhe pa kopertinë. Kush shtyp "luaj" merr "Audio
--      ende nuk është ngarkuar". Për ta bërë të vërtetë duhen, si te
--      meditimet e tjera: mp3-ja, kopertina, dhe një urdhër që vendos
--      `audio_url`, `cover_url` dhe `duration_sec` e matur.

SET NAMES utf8mb4;

UPDATE meditations
   SET title = 'Tërhiq shpirtin binjak'
 WHERE id = '5ecaef91-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me titullin e ri.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ecaef91-a510-11f1-b99e-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  PËR TITULLIN E VJETËR, PO TË DUHET PRAPA
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations SET title = 'Manifesto partner'
--       WHERE id = '5ecaef91-a510-11f1-b99e-107c614af9b1';
