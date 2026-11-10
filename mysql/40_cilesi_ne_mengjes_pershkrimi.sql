-- ═══════════════════════════════════════════════════════════════
--  AKTIVIZO NJË CILËSI DHE FITO ENERGJI NË MËNGJES — përshkrimi
-- ═══════════════════════════════════════════════════════════════
--
--  Teksti i dhënë nga klientja më 10 nëntor 2026. I katërti i këtij lloji.
--
--  Vetëm SQL: kolona `benefits` ekziston që nga `36_perfitimet.sql`.
--
--  Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me kthim rreshti
--  të vetëm (`\n`).

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Nise ditën duke u lidhur me veten dhe duke zgjedhur me vetëdije energjinë ',
         'që dëshiron të përjetosh.',
         '\n\n',
         'Përmes këtij meditimi do të aktivizosh brenda vetes një cilësi që dëshiron ',
         'të fuqizosh, si dashuria, vetëbesimi, guximi apo mirënjohja, dhe do të lejosh ',
         'që kjo ndjenjë të përhapet në gjithë trupin tënd.',
         '\n\n',
         'Në vend që ta nisësh ditën duke reaguar ndaj rrethanave të jashtme, do të ',
         'krijosh vetë gjendjen emocionale me të cilën dëshiron të jetosh dhe të ',
         'veprosh gjatë ditës.'
       ),
       benefits = CONCAT(
         'Energji pozitive dhe motivim për ditën',                  '\n',
         'Aktivizim të cilësisë që dëshiron të fuqizosh',           '\n',
         'Qartësi, vetëbesim dhe lidhje më të thellë me veten'
       )
 WHERE id = '5ecaed4e-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecaed4e-a510-11f1-b99e-107c614af9b1';
