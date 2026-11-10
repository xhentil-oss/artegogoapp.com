-- ═══════════════════════════════════════════════════════════════
--  "ÇLIRO FRIKËN" → "LIRO STRESIN"
-- ═══════════════════════════════════════════════════════════════
--
--  10 nëntor 2026. Zëvendësim i plotë: titull, zë, kopertinë dhe
--  kohëzgjatje. Teknika (Meditime riprogramimi), kategoria (Emocionet)
--  dhe nëngrupi (Emocione) mbeten si ishin.
--
--  ⚠️  KËSHTU KA TANI EDHE NJË KATEGORI ME TË NJËJTIN EMËR.
--      `44_liro_stresin.sql` e riemëroi kategorinë `stres` në "Liro
--      stresin". Databaza nuk ka asnjë problem me këtë — janë dy tabela
--      të ndryshme — por te ekrani do të duket një meditim "Liro
--      stresin" brenda kategorive të tjera, dhe një kategori "Liro
--      stresin" që nuk e përmban. Nuk është gabim; thjesht duhet ditur.
--
--  ⚠️  PËRSHKRIMI ZBRAZET ME QËLLIM.
--      Ai që ishte fliste për frikën — "e gjen aty ku rri te trupi…" —
--      dhe nën titullin e ri do të ishte thjesht i gabuar. Me `NULL`,
--      aplikacioni tregon rreshtin e përgjithshëm derisa klientja të
--      japë tekstin e vet, siç bëri për pesë meditimet e tjera.
--
--  ⚠️  KOHËZGJATJA MATET NGA SKEDARI, JO NGA RRETHI.
--      Mp3-ja zgjat 406.997 sekonda → 407. Po ta linim 600, karta do të
--      thoshte "10 min" dhe shiriti do të ndalej te 6:47, duke lënë tre
--      minuta bosh.

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Liro stresin',
       audio_url    = 'meditime/meditime-riprogramimi/liro-stresin.mp3',
       cover_url    = '/kopertina/liro-stresin.jpeg',
       duration_sec = 407,
       description  = NULL,
       benefits     = NULL
 WHERE id = '5ec896d7-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht.
SELECT id, title, duration_sec, audio_url, cover_url, description
  FROM meditations
 WHERE id = '5ec896d7-a510-11f1-b99e-107c614af9b1';
