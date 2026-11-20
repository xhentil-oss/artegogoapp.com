-- ══════════════════════════════════════════════════════════════
--  NJOFTIMET DITORE NDJEKIN RENDITJEN E RITMIT
--
--  Deri tani ekrani i ritmit dhe njoftimi i të njëjtit çast zgjidhnin veç e
--  veç: ritmi sipas qëllimit, njoftimet nga `notification_pools` me renditje
--  `MD5(user + slot + datë + id)`. Pasoja ishte se njoftimi i mëngjesit
--  premtonte një meditim dhe kartela e ritmit hapte një tjetër — dy premtime
--  të ndryshme për të njëjtin çast të ditës.
--
--  Klientja i caktoi vetë listat më 20 nëntor 2026: mëngjes 12, drekë 11,
--  darkë 12. Ky skedar i shkruan te `notification_pools` me një `position`,
--  dhe serveri zgjedh sipas ditës së ritmit të përdoruesit, jo me MD5.
--
--  ⚠️  `position` MBETET NULL PËR RRESHTAT E VJETËR. Kodi bie te sjellja e
--      dikurshëm kur asnjë rresht i një çasti nuk ka pozicion — pra një
--      ekzekutim i gjysmuar nuk i heq njoftimet, thjesht nuk i rendit.
--
--  ⚠️  FSHIHEN TË GJITHË RRESHTAT E VJETËR. Pool-et e mëparshëm ishin
--      nën-tema të tëra (dhjetëra meditime për çast) dhe një listë e caktuar
--      nuk bashkëjeton dot me to: të pavendosurit do të dilnin prapë.
--      Rikthimi bëhet duke ri-ekzekutuar `08_pools.sql` dhe `17_pool_mengjesi.sql`.
--
--  I sigurt për t'u ri-ekzekutuar.
-- ══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

-- ---------------------------------------------------------------
--  1. Kolona `position`
-- ---------------------------------------------------------------

SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notification_pools'
                AND COLUMN_NAME = 'position');
SET @sql := IF(@has = 0,
  "ALTER TABLE notification_pools ADD COLUMN `position` SMALLINT UNSIGNED NULL AFTER meditation_id",
  "SELECT 'position ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has := (SELECT COUNT(*) FROM information_schema.STATISTICS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notification_pools'
                AND INDEX_NAME = 'idx_pool_position');
SET @sql := IF(@has = 0,
  "ALTER TABLE notification_pools ADD KEY idx_pool_position (slot, `position`)",
  "SELECT 'idx_pool_position ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
--  2. Renditja e caktuar nga klientja
-- ---------------------------------------------------------------

DELETE FROM notification_pools;

--  MORNING · 12 praktika
INSERT INTO notification_pools (slot, meditation_id, `position`) VALUES
  ('morning', '5ecc1ba5-a510-11f1-b99e-107c614af9b1',  1),  --  1. Shkundje somatike
  ('morning', '5ecaed4e-a510-11f1-b99e-107c614af9b1',  2),  --  2. Aktivizo një cilësi dhe fito energji në mëngjes
  ('morning', '5ecde47e-a510-11f1-b99e-107c614af9b1',  3),  --  3. Dita më e bukur
  ('morning', '5ecfb327-a510-11f1-b99e-107c614af9b1',  4),  --  4. Foli vetes pozitivisht
  ('morning', '5ec89d2c-a510-11f1-b99e-107c614af9b1',  5),  --  5. Aktivizo vetëvlerësimin
  ('morning', '5ec89f52-a510-11f1-b99e-107c614af9b1',  6),  --  6. Aktivizo intuitën
  ('morning', '5ed09755-a510-11f1-b99e-107c614af9b1',  7),  --  7. Tejkalo prokrastinimin dhe rrit produktivitetin
  ('morning', '73b9c201-ab5c-11f1-97ee-107c614af9b1',  8),  --  8. Meditim për të gjetur rrugën më të lartë
  ('morning', '73b9e07d-ab5c-11f1-97ee-107c614af9b1',  9),  --  9. Meditim për të marrë dhe rrezatuar dritë
  ('morning', '73b9df5f-ab5c-11f1-97ee-107c614af9b1', 10),  -- 10. Meditim për të manifestuar me dritë
  ('morning', 'f67c48c6-ddb3-11f1-af71-107c614af9b1', 11),  -- 11. Vizualizim për bollëk
  ('morning', '5ecd02f4-a510-11f1-b99e-107c614af9b1', 12)  -- 12. Afirmime për bollëk financiar
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

--  NOON · 11 praktika
INSERT INTO notification_pools (slot, meditation_id, `position`) VALUES
  ('noon', '5eccf9af-a510-11f1-b99e-107c614af9b1',  1),  --  1. Ec dhe ndiej energjinë e jetës së re
  ('noon', '5ec89d72-a510-11f1-b99e-107c614af9b1',  2),  --  2. Ndiej motivim dhe përfundo punën me sukses
  ('noon', '5ecfb02f-a510-11f1-b99e-107c614af9b1',  3),  --  3. Pushim meditativ për rigjenerim
  ('noon', '5ec89463-a510-11f1-b99e-107c614af9b1',  4),  --  4. Sill një emocion të ri
  ('noon', '5ed099cc-a510-11f1-b99e-107c614af9b1',  5),  --  5. Qetësohu pas një konflikti
  ('noon', '5ecaf349-a510-11f1-b99e-107c614af9b1',  6),  --  6. EFT për ankthin
  ('noon', '5ecc1a98-a510-11f1-b99e-107c614af9b1',  7),  --  7. Box breathing
  ('noon', '5ecc1612-a510-11f1-b99e-107c614af9b1',  8),  --  8. Frymëmarrje ritmike 4x6 për lirim nga stresi
  ('noon', '5ecc15d3-a510-11f1-b99e-107c614af9b1',  9),  --  9. Frymëmarrje ritmike 4x7x8 para gjumit për qetësim
  ('noon', '5ecc158c-a510-11f1-b99e-107c614af9b1', 10),  -- 10. Relaksim i thellë me frymëmarrje 4x8
  ('noon', '5ecc1a59-a510-11f1-b99e-107c614af9b1', 11)  -- 11. Rikthe koherencën e zemrës me frymëmarrje 5x5
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

--  EVENING · 12 praktika
INSERT INTO notification_pools (slot, meditation_id, `position`) VALUES
  ('evening', '5ecde7a2-a510-11f1-b99e-107c614af9b1',  1),  --  1. Rikthe energjinë
  ('evening', '5ec896d7-a510-11f1-b99e-107c614af9b1',  2),  --  2. Liro stresin
  ('evening', '5ec89868-a510-11f1-b99e-107c614af9b1',  3),  --  3. Hap zemrën
  ('evening', '5ec898b3-a510-11f1-b99e-107c614af9b1',  4),  --  4. Aktivizo dhembshurinë
  ('evening', '5ecfb137-a510-11f1-b99e-107c614af9b1',  5),  --  5. Fuqizo lidhjen
  ('evening', '5ec898fd-a510-11f1-b99e-107c614af9b1',  6),  --  6. Fal veten
  ('evening', '5ec89944-a510-11f1-b99e-107c614af9b1',  7),  --  7. Fal dikë
  ('evening', '5ecaeefc-a510-11f1-b99e-107c614af9b1',  8),  --  8. Meditim për të ndier falenderim
  ('evening', '73b9e006-ab5c-11f1-97ee-107c614af9b1',  9),  --  9. Meditim për të marrë bekime
  ('evening', '73b9e100-ab5c-11f1-97ee-107c614af9b1', 10),  -- 10. Meditim për të rritur ndërgjegjen
  ('evening', '73b9de8a-ab5c-11f1-97ee-107c614af9b1', 11),  -- 11. Meditim për të lexuar librin e jetës
  ('evening', '5ec8a03b-a510-11f1-b99e-107c614af9b1', 12)  -- 12. Fli shpejt
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

-- ---------------------------------------------------------------
--  3. Kontroll
-- ---------------------------------------------------------------

--  Pritet: morning 12, noon 11, evening 12 — dhe `pa_pozicion` 0 kudo.
SELECT slot,
       COUNT(*)                AS meditime,
       SUM(`position` IS NULL) AS pa_pozicion,
       MIN(`position`)         AS i_pari,
       MAX(`position`)         AS i_fundit
  FROM notification_pools
 GROUP BY slot
 ORDER BY FIELD(slot, 'morning', 'noon', 'evening');

--  Çdo rresht duhet të ketë një meditim të publikuar. Pritet: 0 rreshta.
SELECT p.slot, p.`position`, p.meditation_id AS mungon
  FROM notification_pools p
  LEFT JOIN meditations m ON m.id = p.meditation_id AND m.published_at IS NOT NULL
 WHERE m.id IS NULL;
