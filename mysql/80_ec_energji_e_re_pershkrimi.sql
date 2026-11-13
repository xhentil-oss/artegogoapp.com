-- 80 — "Ec dhe ndiej energjinë e jetës së re": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026.
--
-- Ky rresht i kishte të dyja kolonat bosh. Ajo që dukej te ekrani —
-- "Ec dhe ndiej energjinë e jetës së re — praktikë e udhëhequr nga Arte
-- Gogo." — nuk ishte shkruar nga askush: aplikacioni e ndërton nga titulli
-- dhe narratori kur `description` është NULL. Po ashtu dy përfitimet për
-- qetësimin, që vinin nga harta sipas qëllimit (`domain/benefits.js`) dhe
-- flisnin për sistemin nervor te një meditim ecjeje.
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Lëre pas energjinë e së shkuarës dhe fillo të ecësh si versioni yt i ri, ',
         'plot vetëbesim, gëzim dhe mundësi të pafundme.',
         '\n\n',
         'Përmes këtij meditimi në ecje do të lidhësh lëvizjen e trupit me emocionet ',
         'dhe mendimet e jetës që dëshiron të krijosh.',
         '\n\n',
         'Me çdo hap do të lëshosh identitetin e vjetër, frikën dhe kufizimet që të ',
         'kanë mbajtur në vend, duke aktivizuar ndjenjat e lirisë, fuqisë dhe ',
         'entuziazmit për të ardhmen.',
         '\n\n',
         'Do të ecësh jo më si personi që pret ndryshimin, por si personi që ka ',
         'filluar ta jetojë tashmë transformimin e tij.'
       ),
       benefits = CONCAT(
         'Energji të re dhe gjallëri në trup',              '\n',
         'Liri nga identiteti dhe kufizimet e së shkuarës',  '\n',
         'Vetëbesim, entuziazëm dhe lidhje me veten e re'
       )
 WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1';
