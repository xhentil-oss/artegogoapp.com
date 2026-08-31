-- ═══════════════════════════════════════════════════════════════
--  MINI-BLLOQET E NDËRTUESIT — 15 rreshta
--
--  Pse duhen te databaza: `creation_steps.meditation_id` ka çelës të huaj
--  drejt `meditations`. Pa këta rreshta, çdo seancë e ndërtuar që përmban një
--  hapje ose mbyllje — pra pothuajse çdo seancë — nuk ruhet dot.
--
--  Dy kolona të reja:
--    `phase`     Hapje / Korpi / Mbyllje. Ndërtuesi e përdor për të montuar
--                seanca koherente; pa të, një mbyllje mund të vinte e para.
--    `is_block`  I ndan nga katalogu. Blloqet janë njësi ndërtimi, jo meditime
--                më vete: biblioteka duhet të tregojë 244, ndërsa ndërtuesi 259.
--                Vetëm `phase` nuk mjafton për t'i dalluar — 11 nga 15 blloqet
--                janë vetë "Korpi".
--
--  I sigurt për t'u ri-ekzekutuar.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

-- MariaDB nuk ka `ADD COLUMN IF NOT EXISTS` te çdo version; kontrollohet vetë.
SET @has_phase := (SELECT COUNT(*) FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'meditations'
                      AND COLUMN_NAME = 'phase');
SET @sql := IF(@has_phase = 0,
  "ALTER TABLE meditations ADD COLUMN phase ENUM('opening','core','closing') NOT NULL DEFAULT 'core'",
  "SELECT 'phase ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_block := (SELECT COUNT(*) FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'meditations'
                      AND COLUMN_NAME = 'is_block');
SET @sql := IF(@has_block = 0,
  "ALTER TABLE meditations ADD COLUMN is_block TINYINT(1) NOT NULL DEFAULT 0",
  "SELECT 'is_block ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_idx := (SELECT COUNT(*) FROM information_schema.STATISTICS
                  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'meditations'
                    AND INDEX_NAME = 'idx_meditations_block');
SET @sql := IF(@has_idx = 0,
  "ALTER TABLE meditations ADD KEY idx_meditations_block (is_block)",
  "SELECT 'indeksi ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
--  Blloqet
-- ---------------------------------------------------------------
-- Titulli është çelësi i njohjes (`INSERT IGNORE` nuk vlen këtu — titulli nuk
-- është unik te tabela), ndaj fillimisht fshihen blloqet e vjetra dhe futen
-- sërish. Fshirja prek VETËM `is_block = 1`, kurrë katalogun.
DELETE FROM meditations WHERE is_block = 1;

INSERT INTO meditations
  (title, subgroup, duration_sec, audio_url, description,
   is_premium, is_block, phase, narrator, category_id, published_at)
SELECT b.title, 'Blloqe ndërtimi', b.sec,
       CONCAT('meditime/blloqe/', b.slug, '.mp3'), b.descr,
       1, 1, b.phase, 'Arte Gogo',
       (SELECT id FROM categories WHERE slug = b.cat),
       NOW()
  FROM (
    SELECT 'Hyrje në Trup'         AS title, 'hyrje-ne-trup'         AS slug, 180 AS sec, 'opening' AS phase, 'qetesim'        AS cat, 'Vendosje e vëmendjes në frymëmarrje dhe trup.'        AS descr
    UNION ALL SELECT 'Frymëmarrje Koherente', 'frymemarrje-koherente', 300, 'opening', 'qetesim',        'Ritëm 5.5 frymë/min për koherencë zemër-tru.'
    UNION ALL SELECT 'Vorbulla e Zemrës',     'vorbulla-e-zemres',     420, 'core',    'zemra-plot',     'Ndjesi vortex në kraharor, hapje e qendrës së zemrës.'
    UNION ALL SELECT 'Lulëzimi',              'lulezimi',              360, 'core',    'zemra-plot',     'Zgjerimi i fushës së zemrës, ndjesi blooming.'
    UNION ALL SELECT 'Fëmija i Brendshëm',    'femija-i-brendshem',    480, 'core',    'shendeti',       'Takim me arketipin e Fëmijës, butësi e shërim.'
    UNION ALL SELECT 'Mbrojtësi',             'mbrojtesi',             360, 'core',    'shendeti',       'Integrim i arketipit Mbrojtës/Kontrollues.'
    UNION ALL SELECT 'Drita e Fokusit',       'drita-e-fokusit',       300, 'core',    'fokus',          'Tone izokronike për vëmendje të mprehtë.'
    UNION ALL SELECT 'Vala e Theta-s',        'vala-e-thetas',         540, 'core',    'shero-te-kaluaren', 'Gjendje e thellë theta, akses te Vetja e Lartë.'
    UNION ALL SELECT 'Shtegu i Gjumit',       'shtegu-i-gjumit',       600, 'core',    'gjumi',          'Zbritje graduale drejt deltës dhe pushimit.'
    UNION ALL SELECT 'Zjarri i Energjisë',    'zjarri-i-energjise',    300, 'core',    'energji-e-larte','Aktivizim, ngjitje e energjisë nëpër shtylla.'
    UNION ALL SELECT 'Çlirimi',               'clirimi',               360, 'core',    'stres',          'Lëshimi i tensionit, valë lëshuese sub-bas.'
    UNION ALL SELECT 'Mbyllje me Mirënjohje', 'mbyllje-me-mirenjohje', 180, 'closing', 'qetesim',        'Integrim, mirënjohje, kthim i butë.'
    UNION ALL SELECT 'Vula e Vetes së Lartë', 'vula-e-vetes-se-larte', 240, 'closing', 'shero-te-kaluaren', 'Ankorim i gjendjes së re të qenies.'
    UNION ALL SELECT 'Afirmime Bollëku',      'afirmime-bolleku',      420, 'core',    'bolleku',        'Riprogramim i besimeve për bollëk dhe vlerë.'
    UNION ALL SELECT 'Përqafimi i Vetes',     'perqafimi-i-vetes',     360, 'core',    'dashuria-vetes', 'Butësi dhe pranim i thellë i vetes.'
  ) AS b;

-- Kontroll: 15 blloqe, 244 meditime katalogu, 259 gjithsej.
SELECT SUM(is_block = 1) AS blloqe,
       SUM(is_block = 0) AS katalogu,
       COUNT(*)          AS gjithsej
  FROM meditations;
