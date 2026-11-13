-- 87 — "Dita më e bukur": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026.
--
-- Ky rresht i kishte të dyja kolonat bosh. Ajo që dukej te ekrani —
-- "Dita më e bukur — praktikë e udhëhequr nga Arte Gogo." — ndërtohej nga
-- titulli dhe narratori, dhe dy përfitimet vinin nga qëllimi "Energji".
--
-- ⚠️  Apostrof tipografik te "t’u ndier" (U+2019). Qëndron ashtu.
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Çdo ditë e re është një mundësi për të krijuar një realitet të ri dhe për ',
         'të jetuar me më shumë gëzim, dashuri dhe frymëzim.',
         '\n\n',
         'Përmes këtij meditimi do të lidhesh me emocionet që dëshiron të përjetosh ',
         'gjatë ditës dhe do të krijosh brenda vetes gjendjen emocionale të ditës ',
         'tënde më të bukur.',
         '\n\n',
         'Do të aktivizosh ndjenjat e falënderimit, gëzimit dhe entuziazmit, duke ',
         'vizualizuar veten teksa përjeton momente të mrekullueshme dhe mundësi të reja.',
         '\n\n',
         'Në vend që të presësh që diçka e bukur të ndodhë për t’u ndier mirë, do të ',
         'mësosh ta krijosh këtë ndjenjë brenda vetes që në fillim të ditës.'
       ),
       benefits = CONCAT(
         'Gëzim, entuziazëm dhe energji pozitive',                      '\n',
         'Frymëzim dhe motivim për një ditë të mrekullueshme',           '\n',
         'Falënderim dhe pritshmëri pozitive për atë që të pret'
       )
 WHERE id = '5ecde47e-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecde47e-a510-11f1-b99e-107c614af9b1';
