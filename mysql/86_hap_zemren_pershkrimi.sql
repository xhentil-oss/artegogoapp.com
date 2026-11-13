-- 86 — "Hap zemrën": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026. Zëvendëson përshkrimin e
-- shkurtër dhe mbush `benefits`, që ishte bosh — te ekrani dilnin të
-- njëjtët dy rreshta të qëllimit "Hapje Zemre" si te "Fuqizo lidhjen"
-- (`85`), çka i bënte dy meditime të ndryshme të dukeshin njësoj.
--
-- Vetëm tre paragrafë këtu; i dyti është më i gjatë se zakonisht dhe
-- mban tri pjesë brenda një fjalie. Lihet si e dha klientja.
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Hap zemrën ndaj dashurisë, gëzimit dhe mundësive të pafundme që jeta ka ',
         'për të të ofruar.',
         '\n\n',
         'Përmes këtij meditimi do të çlirosh emocionet që të kanë bërë ta mbyllësh ',
         'zemrën, do të aktivizosh ndjenja të fuqishme dashurie dhe falënderimi dhe ',
         'do të rikthesh lidhjen me pjesën tënde më të pastër e të dashur.',
         '\n\n',
         'Do të lejosh që zemra të hapet sërish ndaj jetës, duke krijuar hapësirë ',
         'për më shumë dashuri, gëzim, besim dhe përvoja të mrekullueshme.'
       ),
       benefits = CONCAT(
         'Hapje të zemrës dhe dashuri të thellë',       '\n',
         'Çlirim nga bllokimet emocionale',              '\n',
         'Më shumë gëzim, paqe dhe lidhje me jetën'
       )
 WHERE id = '5ec89868-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec89868-a510-11f1-b99e-107c614af9b1';
