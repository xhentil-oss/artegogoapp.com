-- ═══════════════════════════════════════════════════════════════
--  "Çifti" → "Fuqizo lidhjen", me zë dhe kopertinë
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditime për Zemrën" → Përmirësimi i marrëdhënieve.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--     Dosja `meditime-per-zemren` ekziston tashmë te serveri — aty janë
--     `fal-veten.mp3`, `fal-dike.mp3`, `aktivizo-dhembshurine.mp3`.
--
--  ✓  PA PËRPLASJE TITULLI. U kontrollua: asnjë meditim tjetër nuk
--     quhet "Fuqizo lidhjen". (Kërkimi për "Fuqizo" kthen një rresht,
--     por përputhja është te përshkrimi i "Aktivizo një cilësi", jo te
--     titulli.) Ndryshe nga "Aktivizo intuitën", ku u desh fshehja e një
--     dublikati.
--
--  ⚠️  PËRSHKRIMI NUK PREKET. "Meditim për dy veta që jetojnë bashkë.
--      Punon me mërzitë e vogla që mblidhen pa u thënë, dhe e rikthen
--      vëmendjen te ajo që të solli këtu. Mund të dëgjohet edhe së
--      bashku." — i rri saktë titullit të ri dhe zërit.
--
--  ⚠️  Te e njëjta teknikë rri edhe një vendmbajtës tjetër për çiftet:
--      "Meditim për marrëdhënien në çift" (`5ec89aab`, te kategoria
--      "Zemra plot"). Nuk është përplasje emri dhe nuk preket këtu, por
--      po të duash një meditim të vetëm për çiftet, ai fshihet si
--      dublikati i intuitës.
--
--  Kohëzgjatja: 691 sekonda (11 min 31 s). E numëruar kornizë për
--  kornizë nga vetë mp3-ja — 28 791 korniza × 1152 mostra ÷ 48 000 Hz.
--  Karta do të shkruajë "12 min".

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Fuqizo lidhjen',
       audio_url    = 'meditime/meditime-per-zemren/fuqizo-lidhjen.mp3',
       cover_url    = '/kopertina/fuqizo-lidhjen.jpeg',
       duration_sec = 691
 WHERE id = '5ecfb137-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me titullin e ri, 691 dhe të dy rrugët.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url, description
  FROM meditations
 WHERE id = '5ecfb137-a510-11f1-b99e-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  PËR TITULLIN E VJETËR, PO TË DUHET PRAPA
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET title = 'Çifti', audio_url = NULL, cover_url = NULL,
--             duration_sec = 600
--       WHERE id = '5ecfb137-a510-11f1-b99e-107c614af9b1';
