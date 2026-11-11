-- ═══════════════════════════════════════════════════════════════
--  "Aktivizo një cilësi…" kalon te Mëngjesi, në vend të "Aktivizo zemrën"
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Nga:  Meditime për Trupin → Energji e lartë  (nën-grupi "Energjia")
--  Te:   Meditime për Trupin → Mëngjes          (nën-grupi "Mëngjes")
--
--  ✓  VETËM SQL. Asnjë ngarkim skedari, pa zip faqeje, pa Restart.
--     Zëri dhe kopertina janë tashmë te serveri — `energjia-e-mengjesit.jpeg`
--     dhe mp3-ja e saj. Rruga e skedarit nuk ka lidhje me dosjen te e cila
--     shfaqet meditimi.
--
--  ⚠️  PSE ZHVENDOSJE DHE JO KOPJE. `category_id` është një kolonë e
--      vetme — një meditim rri te një kategori e vetme. Energji e lartë
--      kalon nga 7 në 6 meditime te kjo teknikë.
--
--  ⚠️  "Aktivizo zemrën" FSHIHET, NUK FSHIHET NGA DATABAZA.
--
--      `5ecde515`, vendmbajtës me 3 minuta të sajuara, pa zë e pa
--      kopertinë. Hiqet vetëm data e botimit — çelësi me të cilin API-ja
--      vendos se çfarë shfaqet. Rreshti rri i plotë.
--
--      Pa urdhrin e dytë, te Mëngjesi do të rrinin katër karta: tre
--      vendmbajtës dhe një i vërtetë. Kërkesa ishte zëvendësim.
--
--  ⚠️  NËN-GRUPI bëhet "Mëngjes", si i tre fqinjëve. Pa këtë, te ndërtuesi
--      i seancave do të dilte një grup "Energjia" me një meditim të vetëm
--      brenda kategorisë Mëngjes.
--
--      Nuk prek njoftimet. `08_pools.sql` i ka TË DYJA nën-grupet te
--      pishina `morning` ('Mëngjes' dhe 'Energjia'), ndaj meditimi do të
--      ishte aty sido që të ishte — por pishina mban `meditation_id` dhe
--      u mbush një herë e mirë; nuk i rilexon nën-grupet.
--
--  ✓  TITULLI NUK NDRYSHON: "Aktivizo një cilësi dhe fito energji në
--     mëngjes".
--
--  ✓  PËRSHKRIMI DHE PËRFITIMET NUK PREKEN. Janë tekst i plotë i shkruar
--     nga klientja, me tre paragrafë, dhe nuk përmendin asnjë numër
--     minutash. Kjo është e para nga zhvendosjet e sotme ku përshkrimi
--     mbetet i paprekur.
--
--  Karta nuk ndryshon fare: 6 min, e njëjta kopertinë. Ndryshon vendi.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  1 — MEDITIMI ZHVENDOSET
-- ───────────────────────────────────────────────────────────────

UPDATE meditations
   SET category_id = (SELECT id FROM categories WHERE slug = 'mengjes'),
       subgroup    = 'Mëngjes'
 WHERE id = '5ecaed4e-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  2 — "Aktivizo zemrën" FSHIHET
-- ───────────────────────────────────────────────────────────────

UPDATE meditations
   SET published_at = NULL
 WHERE id = '5ecde515-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — kategoria Mëngjes
-- ───────────────────────────────────────────────────────────────
--  Tre rreshta, pa "Aktivizo zemrën":
--    Aktivizo një cilësi dhe fito energji në mëngjes   330 s   me kopertinë
--    Dita më e bukur                                   323 s   me kopertinë
--    Vendos qëllimin                                   180 s   pa kopertinë

SELECT m.title, m.duration_sec, m.subgroup, m.cover_url
  FROM meditations m
  JOIN categories c ON c.id = m.category_id
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'meditime-per-trupin'
   AND c.slug = 'mengjes'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--  Data e botimit merret nga një motër e tij që mbetet e dukshme
--  ("Vendos qëllimin", po te Mëngjesi). Tabela e brendshme me emër
--  (`AS burim`) është e domosdoshme — MySQL nuk lejon një nënpyetje mbi
--  të njëjtën tabelë që po përditësohet, dhe pa të kthen #1093.
--
--      UPDATE meditations
--         SET category_id = (SELECT id FROM categories WHERE slug = 'energji-e-larte'),
--             subgroup    = 'Energjia'
--       WHERE id = '5ecaed4e-a510-11f1-b99e-107c614af9b1';
--
--      UPDATE meditations
--         SET published_at = (
--               SELECT p FROM (
--                 SELECT published_at AS p FROM meditations
--                  WHERE id = '5ecde4cd-a510-11f1-b99e-107c614af9b1'
--               ) AS burim
--             )
--       WHERE id = '5ecde515-a510-11f1-b99e-107c614af9b1';
