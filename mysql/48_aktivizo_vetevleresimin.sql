-- ═══════════════════════════════════════════════════════════════
--  AKTIVIZO VETËVLERËSIMIN — zëvendëson "Aktivizo autoritetin"
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditime riprogramimi" → Vetëbesim. I njëjti rresht, me titull,
--  zë, kopertinë dhe kohë të vërtetë në vend të vendmbajtësit.
--
--  ✓  VETËM SQL DHE DY SKEDARË. Asnjë ndryshim kodi: titulli, kopertina
--     dhe kohëzgjatja vijnë të gjitha nga serveri, dhe aplikacioni i
--     lexon sa herë hapet. Pra PA zip faqeje dhe PA Restart Node-i.
--
--  ⚠️  PËRSHKRIMI HIQET ME QËLLIM.
--
--      I vjetri fliste për autoritetin: "Punon me bindjen se autoriteti u
--      takon të tjerëve: e kthen atë në një qëndrim të qetë, që nuk ka
--      nevojë të ngrejë zërin për t'u dëgjuar." Nën titullin e ri do të
--      ishte thjesht i gabuar — vetëvlerësimi nuk është autoriteti.
--
--      Me `NULL`, fletja kthehet te teksti i përgjithshëm derisa klientja
--      të dërgojë përshkrimin e vërtetë. Ruhet këtu poshtë, i plotë, po
--      të duhet ndonjëherë prapa.
--
--      I vjetri, për kthim me një urdhër:
--        UPDATE meditations SET description = CONCAT(
--          'Riprogramim i mënyrës si e mban veten kur duhet të vendosësh. ',
--          'Punon me bindjen se autoriteti u takon të tjerëve: e kthen atë ',
--          'në një qëndrim të qetë, që nuk ka nevojë të ngrejë zërin për ',
--          't''u dëgjuar.')
--         WHERE id = '5ec89d2c-a510-11f1-b99e-107c614af9b1';
--
--  Kohëzgjatja: 706 sekonda (11 min 46 s). E numëruar kornizë për kornizë
--  nga vetë mp3-ja — 29 405 korniza × 1152 mostra ÷ 48 000 Hz — jo e
--  rrumbullakosur me sy. Karta do të shkruajë "12 min".

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Aktivizo vetëvlerësimin',
       audio_url    = 'meditime/meditime-riprogramimi/aktivizo-vetevleresimin.mp3',
       cover_url    = '/kopertina/aktivizo-vetevleresimin.jpeg',
       duration_sec = 706,
       description  = NULL,
       benefits     = NULL
 WHERE id = '5ec89d2c-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me titullin e ri, 706 dhe të dy rrugët.
SELECT id, title, duration_sec, audio_url, cover_url, description
  FROM meditations
 WHERE id = '5ec89d2c-a510-11f1-b99e-107c614af9b1';
