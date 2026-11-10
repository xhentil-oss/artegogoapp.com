-- ═══════════════════════════════════════════════════════════════
--  "MBËSHTETJE GJATË RIKUPERIMIT" → "PUSHIM MEDITATIV PËR RIGJENERIM"
-- ═══════════════════════════════════════════════════════════════
--
--  10 nëntor 2026. Titull, zë, kopertinë dhe kohëzgjatje.
--  Teknika (Rigjenerim dhe shërim), kategoria (Shëndeti) dhe nëngrupi
--  (Gjendje kronike) mbeten si ishin.
--
--  ⚠️  PËRSHKRIMI ZBRAZET.
--
--      Ai që ishte ishte mjekësor dhe i ngushtë: "Për periudhën e
--      rikuperimit pas një sëmundjeje a ndërhyrjeje… Ndiq gjithnjë
--      udhëzimet e mjekut." Titulli i ri nuk flet për sëmundje, ndaj
--      nën të ai tekst do të kufizonte diçka që tani është e gjerë —
--      dhe do t'i thoshte përdoruesit se i duhet mjek për një pushim.
--
--      Nëse klientja e do të kthyer, mjafton:
--
--        UPDATE meditations SET description = 'Për periudhën e '
--          'rikuperimit pas një sëmundjeje a ndërhyrjeje. Ritëm i '
--          'ngadaltë, vëmendje e butë ndaj trupit dhe durim me kohën '
--          'që kërkon. Ndiq gjithnjë udhëzimet e mjekut.'
--         WHERE id = '5ecfb02f-a510-11f1-b99e-107c614af9b1';
--
--  ⚠️  KOHËZGJATJA 600 → 645. Mp3-ja zgjat 645.22 sekonda (10:45).
--      Dallimi është i vogël, por shiriti ndalet aty ku ndalet zëri:
--      me 600, dyzet e pesë sekondat e fundit do të dukeshin si heshtje
--      pas mbarimit.

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Pushim meditativ për rigjenerim',
       audio_url    = 'meditime/rigjenerim-dhe-sherim/pushim-meditativ-per-rigjenerim.mp3',
       cover_url    = '/kopertina/pushim-sherues.jpeg',
       duration_sec = 645,
       description  = NULL,
       benefits     = NULL
 WHERE id = '5ecfb02f-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht.
SELECT id, title, duration_sec, audio_url, cover_url, description
  FROM meditations
 WHERE id = '5ecfb02f-a510-11f1-b99e-107c614af9b1';
