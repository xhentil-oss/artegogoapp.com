-- ═══════════════════════════════════════════════════════════════
--  "Shkundje somatike" — kopertina
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Teknika Somatike" → Shëndeti.
--
--  ✓  NJË URDHËR, NJË SKEDAR. Pa zip faqeje, pa Restart Node-i.
--
--  ✓  NUK DUHET URDHËR KTHIMI NGA `fshehja_11_nentor`.
--
--     Ky është i vetmi meditim pa kopertinë që MBETI i dukshëm pas
--     fshehjes së 204-ve (`65_fshehja_e_vendmbajtesve.sql`), pikërisht
--     sepse kushti ishte `cover_url IS NULL AND video_url IS NULL` dhe
--     ai e ka videon. Ndaj `published_at` nuk u prek kurrë dhe nuk ka
--     çfarë të kthehet.
--
--  ✓  TITULLI, KOHA, VIDEOJA DHE PËRSHKRIMI NUK PREKEN. Ndryshon vetëm
--     kopertina: deri tani karta vizatohej me ngjyrën e teknikës dhe
--     lulen e zbehtë, si vendmbajtësit.
--
--  ⚠️  `duration_sec` MBETET 136. Videoja zgjat 2 minuta e 16 sekonda,
--      e matur më 10 nëntor; karta shkruan "2 min" dhe është e saktë.

SET NAMES utf8mb4;

UPDATE meditations
   SET cover_url = '/kopertina/shkundje-somatike.jpeg'
 WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me kopertinën, videon dhe 136 s.
SELECT title, duration_sec, cover_url, video_url
  FROM meditations
 WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations SET cover_url = NULL
--       WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1';
