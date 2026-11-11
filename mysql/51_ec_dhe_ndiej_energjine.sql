-- ═══════════════════════════════════════════════════════════════
--  "Grounding" → "Ec dhe ndiej energjinë e jetës së re"
--  me zë, kopertinë dhe kohë të vërtetë
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditim në ecje" → Qetësim.
--
--  ⚠️  KY SKEDAR U RISHKRUA. Versioni i parë ndryshonte vetëm titullin;
--      klientja dërgoi zërin dhe kopertinën para se ai të rrotullohej,
--      ndaj gjithçka bëhet me një urdhër të vetëm. Po e pate rrotulluar
--      tashmë atë të parin, ky prapë punon: vendos çdo fushë nga e para,
--      pavarësisht se ç'titull gjen.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--
--  ✓  TITULL I VETËM. Ndryshe nga "Manifesto partner", që e mbanin dy
--     rreshta, "Grounding" ishte vetëm ky. Kushti mbetet prapë mbi `id`.
--
--  ⚠️  PËRSHKRIMI HIQET.
--
--      I vjetri: "Tokëzim me këmbët në dysheme. Vëmendja zbret poshtë,
--      pesha ndihet te thembrat, dhe ankthi që rri lart te gjoksi gjen
--      ku të shkarkohet."
--
--      Kur ky ishte vendmbajtës pa zë, teksti thjesht nuk i rrinte mirë
--      titullit. Tani që meditimi ka zë të vërtetë, ai përshkrim do t'i
--      premtonte dëgjuesit diçka tjetër nga ajo që dëgjon: këmbë në
--      dysheme dhe shkarkim ankthi, kurse meditimi është në ecje dhe
--      flet për energjinë e një jete të re.
--
--      I vjetri, për kthim me një urdhër:
--        UPDATE meditations SET description = CONCAT(
--          'Tokëzim me këmbët në dysheme. Vëmendja zbret poshtë, pesha ',
--          'ndihet te thembrat, dhe ankthi që rri lart te gjoksi gjen ku ',
--          'të shkarkohet.')
--         WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1';
--
--  ⚠️  DOSJA `meditim-ne-ecje` NUK EKZISTON te serveri — u provua më
--      11 nëntor, kthen 404. Duhet krijuar para ngarkimit të mp3-së.
--
--  Kohëzgjatja: 475 sekonda (7 min 55 s). E numëruar kornizë për kornizë
--  nga vetë mp3-ja — 19 779 korniza × 1152 mostra ÷ 48 000 Hz.
--  Karta do të shkruajë "8 min".
--
--  Te e njëjta dosje kanë mbetur edhe tre tituj anglisht: "Body scan",
--  "Somatic walking", "Somatic dancing".

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Ec dhe ndiej energjinë e jetës së re',
       audio_url    = 'meditime/meditim-ne-ecje/meditim-ne-ecje.mp3',
       cover_url    = '/kopertina/meditim-ne-ecje.jpeg',
       duration_sec = 475,
       description  = NULL,
       benefits     = NULL
 WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me titullin e ri, 475 dhe të dy rrugët.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url, description
  FROM meditations
 WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1';
