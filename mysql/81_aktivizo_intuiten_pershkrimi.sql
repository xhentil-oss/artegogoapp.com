-- 81 — "Aktivizo intuitën": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026. Zëvendëson përshkrimin e
-- shkurtër që ishte aty dhe mbush `benefits`, që ishte bosh — prandaj te
-- ekrani shfaqeshin dy rreshta të gjeneruar nga qëllimi "Transformim"
-- ("Besime të vjetra që lëshojnë", "Një drejtim i ri që ndihet i mundshëm"),
-- jo nga ndonjë tekst i shkruar për këtë meditim.
--
-- ⚠️  Teksti përmban apostrof tipografik te "t'i kushtosh" (U+2019, jo ').
--     Qëndron ashtu me qëllim: nuk e mbyll vargun te MySQL dhe në ekran
--     duket si apostrofi i duhur. Mos e zëvendëso me ' të thjeshtë.
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Qetëso zhurmën e mendjes dhe rizbulo zërin e brendshëm që të udhëheq ',
         'drejt zgjedhjeve më të mira për ty.',
         '\n\n',
         'Përmes këtij meditimi do të thellosh lidhjen me veten, duke lëshuar ',
         'frikën, dyshimet dhe nevojën për të kontrolluar gjithçka përmes logjikës.',
         '\n\n',
         'Do të kultivosh një gjendje të thellë qetësie dhe vetëdijeje, ku do të ',
         'mësosh t’i kushtosh më shumë vëmendje ndjesive, mesazheve dhe sinjaleve ',
         'të brendshme.',
         '\n\n',
         'Sa më shumë të forcosh lidhjen me intuitën tënde, aq më shumë do të ',
         'zhvillosh besimin te vetja dhe qartësinë për të ndjekur rrugën që ',
         'përputhet me dëshirat dhe vlerat e tua më të thella.'
       ),
       benefits = CONCAT(
         'Lidhje më të thellë me intuitën',                 '\n',
         'Qartësi mendore dhe besim në vendimet e tua',      '\n',
         'Qetësi dhe lidhje me urtësinë tënde të brendshme'
       )
 WHERE id = '5ec89f52-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec89f52-a510-11f1-b99e-107c614af9b1';
