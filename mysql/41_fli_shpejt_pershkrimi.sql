-- ═══════════════════════════════════════════════════════════════
--  FLI SHPEJT — përshkrimi dhe përfitimet
-- ═══════════════════════════════════════════════════════════════
--
--  Teksti i dhënë nga klientja më 10 nëntor 2026. I pesti i këtij lloji.
--
--  ⚠️  DY PËRFITIME, JO TRI — ashtu siç i shkroi klientja. Aplikacioni nuk
--      pret numër të caktuar: `splitBenefits` kthen aq rreshta sa gjen te
--      kolona, dhe fletja i vizaton të gjithë.
--
--  Vetëm SQL: kolona `benefits` ekziston që nga `36_perfitimet.sql`.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Lësho gjithë tensionin e ditës dhe lejo trupin e mendjen të kalojnë ',
         'natyrshëm drejt një gjumi të thellë e çlodhës.',
         '\n\n',
         'Përmes frymëmarrjes së ngadaltë dhe relaksimit të çdo pjese të trupit, do ',
         'të ndjesh se si mendimet qetësohen, trupi lirohet dhe një ndjesi e thellë ',
         'paqeje të përfshin.',
         '\n\n',
         'Lëri pas shqetësimet e ditës dhe lëshoju qetësisë së këtij momenti.'
       ),
       benefits = CONCAT(
         'Relaksim të thellë të trupit dhe mendjes',                      '\n',
         'Kalim të natyrshëm drejt një gjumi të qetë e çlodhës'
       )
 WHERE id = '5ec8a03b-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec8a03b-a510-11f1-b99e-107c614af9b1';
