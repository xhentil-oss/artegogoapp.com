-- ═══════════════════════════════════════════════════════════════
--  POOL-ET E NJOFTIMEVE — mëngjes / drekë / darkë (seksioni 9)
--  Prodhuar nga: scripts/build-pools-sql.mjs — mos e redakto me dorë.
--
--  Anëtarësia ruhet PËR MEDITIM, jo për nën-grup: klientja duhet të mund të
--  heqë një meditim të vetëm nga pool-i i mëngjesit pa hequr gjithë grupin.
--  Nën-grupet këtu janë vetëm mënyra e mbushjes fillestare.
--
--  ⚠️  Përzgjedhja e përditshme NUK bëhet këtu dhe as te aplikacioni — bëhet
--      te serveri (`/me/reminders/today`), sepse njoftimi duhet të dërgohet
--      edhe kur aplikacioni është i mbyllur.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS notification_pools (
  slot          ENUM('morning','noon','evening') NOT NULL,
  meditation_id CHAR(36) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slot, meditation_id),
  KEY idx_pool_meditation (meditation_id),
  CONSTRAINT fk_pool_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TEMPORARY TABLE IF EXISTS tmp_pool_groups;
CREATE TEMPORARY TABLE tmp_pool_groups (
  slot           ENUM('morning','noon','evening') NOT NULL,
  technique_slug VARCHAR(80)  NOT NULL,
  subgroup       VARCHAR(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_pool_groups (slot, technique_slug, subgroup) VALUES
  ('morning', 'meditime-per-trupin', 'Mëngjes'),
  ('morning', 'meditime-per-trupin', 'Energjia'),
  ('morning', 'meditime-riprogramimi', 'Vetëbesimi'),
  ('morning', 'frymemarrje', 'Aktivizim'),
  ('morning', 'teknika-energjetike', 'Aktivizim'),
  ('morning', 'afirmime', 'Zhvillim personal'),
  ('morning', 'vizualizim', 'Jeta ideale'),
  ('noon', 'meditime-per-trupin', 'Në punë'),
  ('noon', 'meditime-per-trupin', 'Në makinë'),
  ('noon', 'meditime-per-trurin', 'Truri'),
  ('noon', 'frymemarrje', 'Performancë'),
  ('noon', 'meditime-per-trurin', 'Aftësi'),
  ('noon', 'meditim-ne-ecje', 'Tokëzim & Lëvizje'),
  ('noon', 'eft-tapping', 'Ankthi'),
  ('evening', 'meditime-per-trupin', 'Në shtëpi'),
  ('evening', 'meditime-per-trupin', 'Gjumi'),
  ('evening', 'meditime-per-zemren', 'Zemra'),
  ('evening', 'frymemarrje', 'Qetësim'),
  ('evening', 'frymemarrje', 'Shërim'),
  ('evening', 'teknika-somatike', 'Lirim & Çlirim'),
  ('evening', 'meditime-per-zemren', 'Brenda vetes');

-- Mbushja fillestare. `INSERT IGNORE` që ri-ekzekutimi të mos dyfishojë, dhe
-- që zgjedhjet e mëvonshme të klientes të mos fshihen nga një rregji e re.
INSERT IGNORE INTO notification_pools (slot, meditation_id)
SELECT g.slot, m.id
  FROM tmp_pool_groups g
  JOIN techniques t  ON t.slug = g.technique_slug
  JOIN meditations m ON m.technique_id = t.id
                    AND m.subgroup = g.subgroup
                    AND m.is_block = 0
                    AND m.published_at IS NOT NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_pool_groups;

-- Kontroll: të tre pool-et duhet të kenë përmbajtje.
SELECT slot, COUNT(*) AS meditime FROM notification_pools GROUP BY slot;
