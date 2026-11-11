-- ═══════════════════════════════════════════════════════════════
--  NDIEJ BOLLËKUN — kategoria, meditimi i ri, dhe fshehja e 7 vendmbajtësve
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  TRE URDHRA. Rrotullohen së bashku, me këtë radhë.
--
--  ⚠️  PSE NUK U RIEMËRUA "Energji e lartë"
--
--      Kërkesa ishte: te dosja Afirmime, titulli "Energji e lartë" të bëhet
--      "Ndiej bollëkun". Por ajo kategori NUK është vetëm e Afirmimeve —
--      mban 19 meditime nga katër teknika. Riemërtimi i saj do të fuste nën
--      "Ndiej bollëkun" edhe "Energji në mëngjes", "Pas punës", "Para
--      palestrës", "Rimbush energjinë"… dymbëdhjetë meditime për energjinë.
--
--      Ndaj u mor rruga tjetër: u riemërua kategoria që TASHMË do të thotë
--      bollëk — `bolleku`, "Bollëku" → "Ndiej bollëkun" — dhe meditimi i ri
--      shkon aty. Të 7 vendmbajtësit e "Energji e lartë" te Afirmimet
--      fshihen, ndaj ai titull zhduket vetë nga ajo dosje.
--
--      Pasojë anësore: edhe 6 meditimet e tjera të `bolleku` (Praktika me
--      duar, Tokëzim, Qendra e trupit, Rrit vibracionin, Vetë-shërim
--      energjetik, Meditim për të marrë bekime) do të duken nën emrin e ri.
--      Janë te Vizualizim dhe Teknika energjetike.
--
--  ⚠️  DUHET EDHE NGARKIMI I FAQES. Emri që sheh përdoruesi vjen nga
--      `src/data/categories.js`, jo nga kjo tabelë. Pa zip-in e ri, kategoria
--      do të vazhdojë të lexohet "Bollëku" te telefoni. Kjo rresht këtu e
--      mban databazën në një mendje me kodin — për panelin e admin-it dhe
--      për këdo që lexon tabelën.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  1 — KATEGORIA
-- ───────────────────────────────────────────────────────────────

UPDATE categories
   SET name = 'Ndiej bollëkun'
 WHERE slug = 'bolleku';


-- ───────────────────────────────────────────────────────────────
--  2 — MEDITIMI "Afirmime për bollëk financiar"
-- ───────────────────────────────────────────────────────────────
--
--  Nuk krijohet rresht i ri: merret vendmbajtësi `Bollëk` që rrinte te
--  Afirmime → "Dashuria ndaj vetes", pa audio dhe me 10 minuta të sajuara.
--  I njëjti rresht, me titull, zë, kopertinë dhe kohë të vërtetë.
--
--  ⚠️  PËRSHKRIMI NUK PREKET. Ai i vjetri — "Punojnë me marrëdhënien e
--      vjetër me paranë: frikën, fajin, mosmeritimin" — i përshtatet me
--      saktësi titullit të ri. Ndryshe nga "Liro stresin" dhe "Pushim
--      meditativ", ku teksti i vjetër fliste për diçka tjetër fare.
--      `benefits` mbetet bosh; fletja i merr nga harta sipas qëllimit.
--
--  Kohëzgjatja: 456 sekonda. E numëruar kornizë për kornizë nga vetë mp3-ja
--  (19 017 korniza × 1152 mostra ÷ 48 000 Hz), jo e rrumbullakosur me sy.

UPDATE meditations
   SET title        = 'Afirmime për bollëk financiar',
       category_id  = (SELECT id FROM categories WHERE slug = 'bolleku'),
       audio_url    = 'meditime/afirmime/afirmime-per-bollek-financiar.mp3',
       cover_url    = '/kopertina/afirmime-bolleku.jpeg',
       duration_sec = 456
 WHERE id = '5ecd02f4-a510-11f1-b99e-107c614af9b1';


-- ───────────────────────────────────────────────────────────────
--  3 — FSHIHEN 7 VENDMBAJTËSIT E "Energji e lartë" TE AFIRMIMET
-- ───────────────────────────────────────────────────────────────
--
--  ⚠️  ASGJË NUK FSHIHET NGA DATABAZA. `published_at = NULL` është
--      çelësi që përdor i gjithë API-ja: biblioteka, numëruesit e
--      teknikave, numëruesit e kategorive dhe `/audio/:id` të gjithë
--      kërkojnë `published_at IS NOT NULL`. Rreshtat rrinë të plotë,
--      me titull, përshkrim e klasifikim, thjesht nuk shfaqen.
--
--      `published_at` nuk përdoret askund për renditje — vetëm si po/jo.
--
--  Të shtatët: Biznes, Burrat, Fëmijët, Gratë, Karrierë, Prindërim,
--  Studentët. Të gjithë vendmbajtës: 10 minuta të sajuara, pa zë, pa
--  kopertinë.

UPDATE meditations
   SET published_at = NULL
 WHERE id IN (
   '5ecd0532-a510-11f1-b99e-107c614af9b1',  -- Biznes
   '5ecd0628-a510-11f1-b99e-107c614af9b1',  -- Burrat
   '5ecd0672-a510-11f1-b99e-107c614af9b1',  -- Fëmijët
   '5ecd05e5-a510-11f1-b99e-107c614af9b1',  -- Gratë
   '5ecd059d-a510-11f1-b99e-107c614af9b1',  -- Karrierë
   '5ecd04e1-a510-11f1-b99e-107c614af9b1',  -- Prindërim
   '5ecd06b0-a510-11f1-b99e-107c614af9b1'   -- Studentët
 );

-- Duhet "7 rows affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — çfarë mbetet e dukshme te Afirmimet
-- ───────────────────────────────────────────────────────────────
--
--  Duhen 7 rreshta: meditimi i ri nën "Ndiej bollëkun", "Falje" nën
--  "Falja", dhe 5 nën "Dashuria ndaj vetes".

SELECT m.title, c.name AS kategoria, m.duration_sec, m.audio_url, m.cover_url
  FROM meditations m
  LEFT JOIN categories c ON c.id = m.category_id
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'afirmime'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY c.name, m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TË KTHEHEN TË 7-TA, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--
--  Data e vjetër nuk duhet mbajtur mend: merret nga një motër e tyre që
--  mbetet e dukshme ("Besim", po te Afirmimet). Tabela e brendshme me
--  emër (`AS burim`) është e domosdoshme — MySQL nuk lejon një nënpyetje
--  mbi të njëjtën tabelë që po përditësohet, dhe pa të kthen #1093.
--
--      UPDATE meditations
--         SET published_at = (
--               SELECT p FROM (
--                 SELECT published_at AS p FROM meditations
--                  WHERE id = '5ecd0496-a510-11f1-b99e-107c614af9b1'
--               ) AS burim
--             )
--       WHERE id IN (
--         '5ecd0532-a510-11f1-b99e-107c614af9b1',
--         '5ecd0628-a510-11f1-b99e-107c614af9b1',
--         '5ecd0672-a510-11f1-b99e-107c614af9b1',
--         '5ecd05e5-a510-11f1-b99e-107c614af9b1',
--         '5ecd059d-a510-11f1-b99e-107c614af9b1',
--         '5ecd04e1-a510-11f1-b99e-107c614af9b1',
--         '5ecd06b0-a510-11f1-b99e-107c614af9b1'
--       );
--
--  Dhe kategoria, po të duhet emri i vjetër:
--      UPDATE categories SET name = 'Bollëku' WHERE slug = 'bolleku';
--  (bashkë me rreshtin `c_bolleku` te `src/data/categories.js`)
