-- ═══════════════════════════════════════════════════════════════
--  AKTIVIZO DHEMBSHURINË — përshkrimi dhe përfitimet
-- ═══════════════════════════════════════════════════════════════
--
--  Teksti i dhënë nga klientja më 10 nëntor 2026. I treti pas
--  `37_falenderim_pershkrimi.sql` dhe `38_qetesohu_pershkrimi.sql`.
--
--  Vetëm SQL: kolona `benefits` ekziston që nga `36_perfitimet.sql`, ndaj
--  nuk duhet as ngarkim kodi, as rindezje serveri.
--
--  Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me kthim rreshti
--  të vetëm (`\n`).

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Hap zemrën dhe zgjo brenda vetes ndjenjën e thellë të dhembshurisë, ',
         'pranimit dhe dashurisë pa kushte.',
         '\n\n',
         'Përmes këtij meditimi do të lidhesh me pjesën tënde më të butë dhe më të ',
         'dashur, duke mësuar ta shohësh veten dhe të tjerët me më shumë mirëkuptim, ',
         'pa gjykim dhe pa kritika.',
         '\n\n',
         'Do të përqafosh me dashuri edhe ato pjesë të vetes që dikur i ke refuzuar, ',
         'duke i dhënë vetes pranimin, kujdesin dhe ngrohtësinë që ke pasur gjithmonë ',
         'nevojë të ndjesh.',
         '\n\n',
         'Ndërsa zemra hapet, do të kultivosh dhembshuri jo vetëm për veten, por edhe ',
         'për njerëzit që të kanë lënduar, duke lëshuar gradualisht gjykimin dhe ',
         'pakënaqësinë.'
       ),
       benefits = CONCAT(
         'Hapje të zemrës dhe dashuri të pakushtëzuar',        '\n',
         'Më shumë pranim, butësi dhe dhembshuri ndaj vetes',  '\n',
         'Mirëkuptim dhe dhembshuri ndaj të tjerëve'
       )
 WHERE id = '5ec898b3-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec898b3-a510-11f1-b99e-107c614af9b1';
