-- ═══════════════════════════════════════════════════════════════
--  FSHEHJA E VENDMBAJTËSVE — 204 meditime pa zë dalin nga ekrani
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Kërkesa e klientes: çdo meditim që nuk ka ende zë dhe kopertinë të
--  fshihet nga aplikacioni, pa u fshirë nga databaza. Kthehen kur të jenë
--  gati.
--
--  ⚠️  KY SKEDAR PREK 204 RRESHTA. Lexoje para se ta rrotullosh.
--
--      241 meditime janë të dukshme sot. Pas tij mbeten 37.
--
--  ✓  VETËM SQL. Pa ngarkim skedari, pa zip faqeje, pa Restart Node-i.
--     `published_at = NULL` është çelësi që përdor i gjithë API-ja:
--     biblioteka, numëruesit e teknikave e të kategorive, `/audio/:id`
--     dhe zgjedhja e njoftimit ditor. Rreshtat rrinë të plotë.
--
--  ⚠️  PSE KRITERI ËSHTË KOPERTINA, JO `audio_url`.
--
--      `audio_url` është e mbushur te TË GJITHË — edhe te vendmbajtësit,
--      me rrugë të sajuara nga `04_meditations.sql` që nuk ekzistojnë te
--      serveri. Një kusht mbi të nuk do të kapte asgjë.
--
--      Kopertina, përkundrazi, vendoset vetëm kur vjen regjistrimi i
--      vërtetë. Provuar nga jashtë më 11 nëntor 2026: nga 205 meditimet
--      pa kopertinë, u nxorën 189 rrugë mp3-sh nga seed-i dhe u godit
--      secila me një kërkesë HEAD. TË 189 KTHYEN 404. Asnjë meditim pa
--      kopertinë nuk ka zë të vërtetë.
--
--  ⚠️  `video_url IS NULL` NUK ËSHTË ZBUKURIM — MBRON NJË MEDITIM.
--
--      "Shkundje somatike" (`5ecc1ba5`, Teknika Somatike → Shëndeti) nuk
--      ka kopertinë, por ka video që punon: 19 MB te serveri, 136 s.
--      Pa këtë kusht, rregulli "pa kopertinë" do ta kishte fshehur
--      përmbajtje të gatshme. Kushti mbron edhe çdo video të ardhshme.
--
--  ✓  NJOFTIMET VAZHDOJNË. `pickForSlot` filtron tashmë
--     `m.published_at IS NOT NULL`, dhe të tria pishinat mbijetojnë:
--       mëngjes   5 meditime    mesditë   5 meditime    mbrëmje  12 meditime
--     Pa këtë kontroll, një pishinë bosh do të linte njoftimin pa çfarë
--     të propozonte.
--
--  ✓  PROGRAMET NUK PREKEN. Të katër (MISTIK ZEMËR, TRANSFORMIM,
--     GJUMË I QETË, BOLLËK) nuk kanë ende asnjë meditim të lidhur.
--
--  ⚠️  TRI TEKNIKA MBETEN BOSH dhe dalin fare nga ekrani:
--        Teknika Energjetike (12)   Hipnoterapi (8)   Teknika Somatike (10)
--      Teknika Somatike ruan "Shkundje somatike"-n, ndaj nuk zhduket.
--
--  ⚠️  PESË VIZUALIZIME MBETEN TË DUKSHME POR TË HESHTURA — me vendim
--      të klientes. Kanë kopertinë, por mp3-ja e tyre kthen 404:
--        Meditim për të gjetur rrugën më të lartë
--        Meditim për të lexuar librin e jetës
--        Meditim për të manifestuar me dritë
--        Meditim për të marrë bekime
--        Meditim për të marrë dhe rrezatuar dritë
--      Kur të vijnë mp3-të, ngarkohen te `meditime/vizualizim/` me emrat
--      që kanë tashmë te `audio_url` dhe çështja mbyllet vetvetiu.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  1 — KOPJA E SIGURISË
-- ───────────────────────────────────────────────────────────────
--
--  ⚠️  KY URDHËR I PARI ËSHTË RRUGA E KTHIMIT. Pa të, datat e botimit
--      humbasin dhe kthimi bëhet me një datë të sajuar.
--
--      Një tabelë e vogël me dy kolona: `id` dhe data e vjetër. Mbetet te
--      databaza derisa të mos duhet më.
--
--  ⚠️  Nëse kthen #1142 ose #1044 (mungesë të drejtash për CREATE), MOS
--      vazhdo me urdhrin 2 — më thuaj dhe e bëjmë ndryshe. phpMyAdmin-i
--      ndalon vetë te urdhri i parë që dështon, ndaj kjo është e sigurt.

DROP TABLE IF EXISTS fshehja_11_nentor;

CREATE TABLE fshehja_11_nentor AS
SELECT id, published_at
  FROM meditations
 WHERE published_at IS NOT NULL
   AND is_block = 0
   AND cover_url IS NULL
   AND video_url IS NULL;

-- Duhet "204 rows affected".


-- ───────────────────────────────────────────────────────────────
--  2 — FSHEHJA
-- ───────────────────────────────────────────────────────────────

UPDATE meditations
   SET published_at = NULL
 WHERE published_at IS NOT NULL
   AND is_block = 0
   AND cover_url IS NULL
   AND video_url IS NULL;

-- Duhet "204 rows affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — çfarë mbeti, sipas teknikës
-- ───────────────────────────────────────────────────────────────
--  Njëmbëdhjetë rreshta, 37 meditime gjithsej:
--    Meditime për Trupin 8 · Vizualizim 7 · Meditime për Zemrën 6
--    Frymëmarrje 5 · Meditime për Trurin 3 · Meditime riprogramimi 2
--    Afirmime 1 · EFT / Tapping 1 · Meditim në ecje 1
--    Meditime manifestimi 1 · Rigjenerim dhe shërim 1 · Teknika Somatike 1

SELECT t.name AS teknika, COUNT(*) AS sa
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE m.published_at IS NOT NULL
   AND m.is_block = 0
 GROUP BY t.name
 ORDER BY sa DESC, t.name;


-- ═══════════════════════════════════════════════════════════════
--  SI T'I KTHESH TË GJITHA, KUR TË DUASH
-- ═══════════════════════════════════════════════════════════════
--  Datat e vjetra merren nga tabela e kopjes, një për një:
--
--      UPDATE meditations m
--        JOIN fshehja_11_nentor b ON b.id = m.id
--         SET m.published_at = b.published_at;
--
--  Dhe pastaj, po të duash ta heqësh tabelën:
--
--      DROP TABLE fshehja_11_nentor;
--
--  ───────────────────────────────────────────────────────────────
--  PËR TË KTHYER VETËM NJË MEDITIM, kur t'i vijë zëri:
--
--      UPDATE meditations m
--        JOIN fshehja_11_nentor b ON b.id = m.id
--         SET m.published_at = b.published_at
--       WHERE m.id = '<id-ja>';
--
--  Ose thjesht, pa tabelën — `published_at` nuk përdoret askund për
--  renditje te meditimet, vetëm si çelës dukshmërie, ndaj çdo datë vlen:
--
--      UPDATE meditations SET published_at = NOW() WHERE id = '<id-ja>';
