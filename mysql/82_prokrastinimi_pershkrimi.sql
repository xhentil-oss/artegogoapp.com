-- 82 — "Tejkalo prokrastinimin dhe rrit produktivitetin": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026. Zëvendëson përshkrimin e
-- shkurtër dhe mbush `benefits`, që ishte bosh — prandaj te ekrani dilnin
-- dy rreshta të gjeneruar nga qëllimi "Fokus" ("Mendje më e kthjellët",
-- "Vëmendje që qëndron te një gjë e vetme").
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Çlirohu nga zakoni i shtyrjes së gjërave për më vonë dhe zgjo brenda ',
         'vetes vendosmërinë, disiplinën dhe motivimin për të vepruar.',
         '\n\n',
         'Përmes këtij meditimi do të identifikosh dhe lëshosh mendimet, emocionet ',
         'dhe besimet kufizuese që të pengojnë të ndërmarrësh hapa drejt qëllimeve ',
         'të tua.',
         '\n\n',
         'Do të lidhesh me versionin tënd më produktiv dhe të suksesshëm, duke ',
         'aktivizuar ndjenjat e vetëbesimit, qartësisë dhe vendosmërisë.',
         '\n\n',
         'Do të vizualizosh veten duke vepruar me lehtësi, fokus dhe disiplinë, ',
         'duke i kthyer qëllimet në rezultate konkrete.'
       ),
       benefits = CONCAT(
         'Motivim dhe vendosmëri për të vepruar',       '\n',
         'Çlirim nga bllokimet që të mbajnë në vend',    '\n',
         'Fokus, disiplinë dhe besim në aftësitë e tua'
       )
 WHERE id = '5ed09755-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ed09755-a510-11f1-b99e-107c614af9b1';
