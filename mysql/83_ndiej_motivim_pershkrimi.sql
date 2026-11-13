-- 83 — "Ndiej motivim dhe përfundo punën me sukses": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026. Zëvendëson përshkrimin e
-- shkurtër dhe mbush `benefits`, që ishte bosh — prandaj te ekrani dilnin
-- të njëjtët dy rreshta të qëllimit "Fokus" si te "Tejkalo prokrastinimin"
-- (`81`), çka i bënte dy meditime të ndryshme të dukeshin njësoj.
--
-- ⚠️  Apostrof tipografik te "t’i kthyer" (U+2019). Qëndron ashtu.
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Zgjo brenda vetes motivimin, vendosmërinë dhe energjinë për t’i kthyer ',
         'qëllimet e tua në realitet.',
         '\n\n',
         'Përmes këtij meditimi do të çlirohesh nga ndjenja e ngecjes, shpërqendrimi ',
         'dhe mungesa e motivimit, duke aktivizuar një gjendje të re mendore dhe ',
         'emocionale.',
         '\n\n',
         'Do të vizualizosh veten duke punuar me fokus, entuziazëm dhe vetëbesim, ',
         'duke përfunduar me sukses gjithçka që ke vendosur të realizosh.',
         '\n\n',
         'Në vend që të presësh motivimin për të vepruar, do të krijosh brenda vetes ',
         'energjinë dhe vendosmërinë për të nisur dhe për të vazhduar deri në fund.'
       ),
       benefits = CONCAT(
         'Motivim, energji dhe entuziazëm për të vepruar',            '\n',
         'Fokus, qartësi dhe vendosmëri',                             '\n',
         'Vetëbesim dhe ndjenjë suksesi në realizimin e qëllimeve'
       )
 WHERE id = '5ec89d72-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec89d72-a510-11f1-b99e-107c614af9b1';
