-- 84 — "Fal veten": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026. Zëvendëson përshkrimin e
-- shkurtër dhe mbush `benefits`, që ishte bosh — te ekrani dilnin dy
-- rreshta të gjeneruar nga qëllimi "Dashuri për Veten" ("Butësi ndaj
-- vetes", "Pranim pa kushte").
--
-- ⚠️  Te tabela ka edhe një "Fal dikë" (670 s), meditim tjetër. Ky urdhër
--     prek vetëm "Fal veten" (397 s), me identitet të plotë te WHERE.
--
-- ⚠️  Apostrof tipografik te "t’i japësh" (U+2019). Qëndron ashtu.
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Liro peshën e fajit, pendesës dhe gjykimit ndaj vetes dhe rikthehu te ',
         'dashuria dhe pranimi i pakushtëzuar.',
         '\n\n',
         'Përmes këtij meditimi do të përballesh me ato momente të së shkuarës për ',
         'të cilat vazhdon ta fajësosh veten, duke i parë me më shumë dhembshuri ',
         'dhe mirëkuptim.',
         '\n\n',
         'Do të kuptosh se ke vepruar me vetëdijen, njohuritë dhe mundësitë që ke ',
         'pasur në atë moment dhe se çdo përvojë ka qenë pjesë e rrugëtimit tënd ',
         'të rritjes.',
         '\n\n',
         'Do të lëshosh nevojën për të ndëshkuar veten dhe do t’i japësh vetes lejen ',
         'për të ecur përpara, me një zemër më të lehtë dhe të hapur ndaj jetës.'
       ),
       benefits = CONCAT(
         'Çlirim nga faji dhe pendesa',                  '\n',
         'Pranim, dhembshuri dhe dashuri ndaj vetes',     '\n',
         'Paqe me të shkuarën dhe liri emocionale'
       )
 WHERE id = '5ec898fd-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec898fd-a510-11f1-b99e-107c614af9b1';
