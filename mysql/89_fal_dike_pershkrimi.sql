-- 89 — "Fal dikë": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026. Zëvendëson përshkrimin e
-- shkurtër dhe mbush `benefits`, që ishte bosh — te ekrani dilnin të
-- njëjtët dy rreshta të qëllimit "Dashuri për Veten" si te "Fal veten"
-- (`84`), çka i bënte dy meditimet e faljes të dukeshin njësoj.
--
-- ⚠️  Ky është "Fal dikë" (670 s), jo "Fal veten" (397 s). Dy meditime të
--     ndryshme me tituj të ngjashëm; identiteti te WHERE i ndan.
--
-- ⚠️  Apostrof tipografik te "Do t’u japësh" (U+2019). Qëndron ashtu.
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Liro peshën emocionale të së shkuarës dhe hap zemrën ndaj faljes, ',
         'dashurisë dhe paqes së brendshme.',
         '\n\n',
         'Përmes këtij meditimi do të lidhesh me emocionet që ke mbajtur brenda ',
         'vetes si pasojë e lëndimeve, zhgënjimeve apo padrejtësive që ke përjetuar.',
         '\n\n',
         'Do t’u japësh hapësirë këtyre emocioneve, duke i pranuar pa gjykim dhe ',
         'duke lëshuar gradualisht zemërimin, pakënaqësinë dhe dhimbjen që të lidhin ',
         'ende me të shkuarën.',
         '\n\n',
         'Falja nuk do të thotë të justifikosh atë që ka ndodhur, por të çlirosh ',
         'veten nga pesha e saj dhe të zgjedhësh të jetosh me një zemër më të lirë, ',
         'të hapur ndaj dashurisë dhe jetës.'
       ),
       benefits = CONCAT(
         'Çlirim nga lëndimet dhe ngarkesat emocionale të së shkuarës',  '\n',
         'Më shumë falje, pranim dhe paqe të brendshme',                  '\n',
         'Hapje të zemrës dhe ndjenjë lirie emocionale'
       )
 WHERE id = '5ec89944-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec89944-a510-11f1-b99e-107c614af9b1';
