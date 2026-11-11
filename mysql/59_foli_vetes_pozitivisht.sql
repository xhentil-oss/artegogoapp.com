-- ═══════════════════════════════════════════════════════════════
--  "Komunikimi" → "Foli vetes pozitivisht", me zë dhe kopertinë
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditime për Zemrën" → Dashuria ndaj vetes (nën-grupi "Brenda vetes").
--
--  ✓  NJË URDHËR I VETËM. Pa zip faqeje, pa Restart Node-i.
--     Dosja `meditime-per-zemren` ekziston tashmë te serveri.
--
--  ✓  PA PËRPLASJE TITULLI. Asnjë meditim tjetër nuk e ka fjalën
--     "pozitiv" te titulli.
--
--  ⚠️  PËRSHKRIMI HIQET SEPSE FLET PËR DIKË TJETËR.
--
--      I vjetri: "Për bisedat që nisin keq. Seanca të mëson ta dëgjosh
--      tjetrin pa përgatitur përgjigjen, dhe ta thuash atë që ke nevojë
--      me fjalë që nuk godasin."
--
--      Ai përshkrim ishte shkruar për titullin "Komunikimi" — për të
--      folurin me TË TJERËT. Meditimi i ri është për të folurin me
--      VETEN. Po të mbetej, karta do të premtonte një seancë për
--      bisedat e vështira dhe do të luante diçka krejt tjetër.
--
--      I vjetri, për kthim me një urdhër:
--        UPDATE meditations SET description = CONCAT(
--          'Për bisedat që nisin keq. Seanca të mëson ta dëgjosh tjetrin ',
--          'pa përgatitur përgjigjen, dhe ta thuash atë që ke nevojë me ',
--          'fjalë që nuk godasin.')
--         WHERE id = '5ecfb327-a510-11f1-b99e-107c614af9b1';
--
--  ⚠️  KY RRESHT ËSHTË TE PISHINA E MBRËMJES. `08_pools.sql` fut te
--      pishina `evening` çdo meditim të teknikës `meditime-per-zemren`
--      me nën-grupin "Brenda vetes" — pra edhe këtë. Pishina mban
--      `meditation_id`, ndaj riemërtimi nuk e prek: thjesht, nga sot
--      njoftimi i mbrëmjes mund të bjerë mbi një meditim me zë të
--      vërtetë. Nën-grupi nuk ndryshohet.
--
--  ⚠️  EMRI I SKEDARIT NDJEK TITULLIN. Te kompjuteri mp3-ja quhej
--      `Foli vetes pozitiv.mp3`; te serveri ngarkohet si
--      `foli-vetes-pozitivisht.mp3`, sipas titullit.
--
--  Karta kalon nga 10 min në 10 min — por tani numri është i vërtetë.
--
--  Kohëzgjatja: 589 sekonda (9 min 49 s). E numëruar kornizë për kornizë
--  nga vetë mp3-ja — 24 549 korniza × 1152 mostra ÷ 48 000 Hz.

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Foli vetes pozitivisht',
       audio_url    = 'meditime/meditime-per-zemren/foli-vetes-pozitivisht.mp3',
       cover_url    = '/kopertina/foli-vetes-pozitivisht.jpeg',
       duration_sec = 589,
       description  = NULL,
       benefits     = NULL
 WHERE id = '5ecfb327-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — kategoria "Dashuria ndaj vetes"
-- ───────────────────────────────────────────────────────────────
--  Tre rreshta — pikërisht ato që duken te folderi "Meditime për Zemrën":
--  "Foli vetes pozitivisht" me 589 s dhe të dy rrugët, dhe "Kufijtë" e
--  "Vetmia" që mbeten vendmbajtës me 600 s.
--
--  (Kategoria ka 10 meditime gjithsej, por të tjerët janë nën teknika të
--   tjera dhe shfaqen te dosjet e tyre. Prandaj kontrolli e kufizon edhe
--   teknikën — që tabela të përputhet me atë që sheh te ekrani.)

SELECT m.title, m.duration_sec, m.cover_url, m.audio_url
  FROM meditations m
  JOIN categories c ON c.id = m.category_id
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'meditime-per-zemren'
   AND c.slug = 'dashuria-vetes'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET title = 'Komunikimi', audio_url = NULL,
--             cover_url = NULL, duration_sec = 600
--       WHERE id = '5ecfb327-a510-11f1-b99e-107c614af9b1';
