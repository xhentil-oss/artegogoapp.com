-- ═══════════════════════════════════════════════════════════════
--  "Liro stresin" zhvendoset te Meditime për Trupin
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Nga:  Meditime riprogramimi → Emocionet          (nën-grupi "Emocione")
--  Te:   Meditime për Trupin   → Për situata të veçanta  (nën-grupi "Në punë")
--
--  ✓  ASNJË NGARKIM. Zëri dhe kopertina janë tashmë te serveri që nga
--     10 nëntori — `meditime/meditime-riprogramimi/liro-stresin.mp3` dhe
--     `/kopertina/liro-stresin.jpeg`. Rruga e skedarit nuk ka lidhje me
--     teknikën te e cila shfaqet meditimi; dosja te disku mbetet aty ku
--     është dhe adresa vazhdon të punojë.
--
--  ⚠️  PSE ZHVENDOSJE DHE JO KOPJE
--
--      Kërkesa ishte që "Kur je i stresuar" të bëhej "Liro stresin" me
--      këtë zë dhe këtë kopertinë. Por "Liro stresin" ekzistonte tashmë:
--      u bë më 10 nëntor, në vend të "Çliro frikën", pikërisht me këta
--      dy skedarë. Riemërtimi i vendmbajtësit do të jepte dy karta me të
--      njëjtin emër dhe të njëjtin regjistrim, në dy dosje të ndryshme.
--
--      `technique_id` është një kolonë e vetme — një meditim rri te një
--      teknikë e vetme. Ndaj zhvendoset rreshti, nuk kopjohet.
--
--  ⚠️  ZHDUKET NGA "Emocionet". Kategoria Emocionet e humbet, dhe
--      Meditime riprogramimi kalon nga 31 në 30 meditime.
--
--  ⚠️  "Kur je i stresuar" NUK PREKET. Mbetet vendmbajtës me 5 minuta,
--      pranë meditimit të ri. Po deshe ta fshehësh:
--        UPDATE meditations SET published_at = NULL
--         WHERE id = '5ecde6ca-a510-11f1-b99e-107c614af9b1';
--
--  ⚠️  NËN-GRUPI bëhet "Në punë", si i të shtatë fqinjëve të tij te ajo
--      kategori. Pa këtë, te ndërtuesi i seancave do të dilte një grup
--      "Emocione" me një meditim të vetëm brenda Meditimeve për Trupin.
--
--      Nuk prek zgjedhjen e ditës: `notification_pools` u mbush një herë
--      nga `08_pools.sql` dhe nuk i rilexon nën-grupet. Kjo zhvendosje do
--      ta fuste te pishina e mesditës VETËM po të rrotullohej sërish ai
--      skedar.
--
--  Titulli, zëri, kopertina, kohëzgjatja dhe përshkrimi nuk preken fare.

SET NAMES utf8mb4;

UPDATE meditations
   SET technique_id = (SELECT id FROM techniques WHERE slug = 'meditime-per-trupin'),
       category_id  = (SELECT id FROM categories WHERE slug = 'situata'),
       subgroup     = 'Në punë'
 WHERE id = '5ec896d7-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — dosja e re
-- ───────────────────────────────────────────────────────────────
--  Duhen 8 rreshta: "Liro stresin" me kopertinë e 407 s, dhe të 7
--  vendmbajtësit me 300 s.

SELECT m.title, m.duration_sec, m.subgroup, m.cover_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
  JOIN categories c ON c.id = m.category_id
 WHERE t.slug = 'meditime-per-trupin'
   AND c.slug = 'situata'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET technique_id = (SELECT id FROM techniques WHERE slug = 'meditime-riprogramimi'),
--             category_id  = (SELECT id FROM categories WHERE slug = 'emocionet'),
--             subgroup     = 'Emocione'
--       WHERE id = '5ec896d7-a510-11f1-b99e-107c614af9b1';
