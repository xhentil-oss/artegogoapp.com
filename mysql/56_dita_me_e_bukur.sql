-- ═══════════════════════════════════════════════════════════════
--  "3 minuta energji" → "Dita më e bukur", me zë dhe kopertinë
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditime për Trupin" → Mëngjes.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Pa zip faqeje, pa Restart Node-i.
--     Dosja `meditime-per-trupin` ekziston tashmë te serveri.
--
--  ✓  PA PËRPLASJE TITULLI. Asnjë meditim tjetër nuk quhet "Dita më e
--     bukur". Kujdes të mos ngatërrohet me "Dita perfekte", vendmbajtës
--     te Vizualizim → Jeta ideale: skedari që dërgoi klientja quhej
--     `Dita perfekte.mp3`, por titulli dhe meditimi janë të tjerë.
--     Prandaj mp3-ja te serveri ngarkohet si `dita-me-e-bukur.mp3`, sipas
--     titullit, jo sipas emrit që kishte te kompjuteri.
--
--  ⚠️  PËRSHKRIMI HIQET SEPSE NUMRI BËHET I PASAKTË.
--
--      I vjetri: "Tre minuta për ta zgjuar trupin pa kafe. Fryma
--      shkurtohet e thellohet, shpatullat dhe qafa lirohen, dhe
--      gjymtyrët aktivizohen me lëvizje të vogla."
--
--      Meditimi i ri zgjat 5 minuta e 23 sekonda. "Tre minuta" te rreshti
--      i parë do ta gënjente dëgjuesin para se ta niste, dhe karta pranë
--      tij do të shkruante "5 min".
--
--      I vjetri, për kthim me një urdhër:
--        UPDATE meditations SET description = CONCAT(
--          'Tre minuta për ta zgjuar trupin pa kafe. Fryma shkurtohet e ',
--          'thellohet, shpatullat dhe qafa lirohen, dhe gjymtyrët ',
--          'aktivizohen me lëvizje të vogla.')
--         WHERE id = '5ecde47e-a510-11f1-b99e-107c614af9b1';
--
--  ⚠️  KY RRESHT ËSHTË TE PISHINA E MËNGJESIT. `08_pools.sql` fut te
--      pishina `morning` çdo meditim të teknikës `meditime-per-trupin`
--      me nën-grupin `Mëngjes` — pra edhe këtë. Pishina mban `meditation_id`,
--      ndaj riemërtimi nuk e prek: thjesht, nga sot njoftimi i mëngjesit
--      mund të bjerë mbi një meditim me zë të vërtetë, jo mbi një
--      vendmbajtës. Nën-grupi nuk ndryshohet pikërisht për këtë arsye.
--
--  Kohëzgjatja: 323 sekonda (5 min 23 s). E numëruar kornizë për kornizë
--  nga vetë mp3-ja — 13 452 korniza × 1152 mostra ÷ 48 000 Hz.

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Dita më e bukur',
       audio_url    = 'meditime/meditime-per-trupin/dita-me-e-bukur.mp3',
       cover_url    = '/kopertina/dita-me-e-bukur.jpeg',
       duration_sec = 323,
       description  = NULL,
       benefits     = NULL
 WHERE id = '5ecde47e-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me titullin e ri, 323 dhe të dy rrugët.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5ecde47e-a510-11f1-b99e-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  PËR TITULLIN E VJETËR, PO TË DUHET PRAPA
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET title = '3 minuta energji', audio_url = NULL,
--             cover_url = NULL, duration_sec = 180
--       WHERE id = '5ecde47e-a510-11f1-b99e-107c614af9b1';
