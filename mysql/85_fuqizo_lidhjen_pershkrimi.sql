-- 85 — "Fuqizo lidhjen": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026. Zëvendëson përshkrimin e
-- shkurtër dhe mbush `benefits`, që ishte bosh — te ekrani dilnin dy
-- rreshta të gjeneruar nga qëllimi "Hapje Zemre".
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Rikthe dashurinë, afërsinë dhe harmoninë në marrëdhënien tënde.',
         '\n\n',
         'Përmes këtij meditimi do të lidhesh me ndjenjat e dashurisë dhe ',
         'falënderimit për partnerin, duke kujtuar gjithçka të bukur që ju bashkon.',
         '\n\n',
         'Do të lëshosh pakënaqësitë, gjykimet dhe emocionet që kanë krijuar ',
         'distancë mes jush, duke hapur zemrën ndaj mirëkuptimit, pranimit dhe ',
         'dashurisë.',
         '\n\n',
         'Një mundësi për ta parë marrëdhënien me sy të rinj dhe për të kultivuar ',
         'një lidhje më të thellë, më të vetëdijshme dhe më të dashur.'
       ),
       benefits = CONCAT(
         'Më shumë dashuri dhe afërsi emocionale',                '\n',
         'Çlirim nga pakënaqësitë dhe tensionet',                  '\n',
         'Mirëkuptim, falënderim dhe harmoni në marrëdhënie'
       )
 WHERE id = '5ecfb137-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecfb137-a510-11f1-b99e-107c614af9b1';
