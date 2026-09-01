-- ═══════════════════════════════════════════════════════════════
--  ABONIMI — gjurma e plotë te databaza
--
--  Tabela `users` i kishte tashmë fushat e gjendjes (`is_premium`,
--  `subscription_status`, `subscription_plan`, datat). Këtu shtohen dy gjëra
--  që mungonin:
--
--    `trial_used_at`        — pa të, prova 3-ditore rinisej pa fund. Gjendja e
--                             tanishme nuk mjafton: sapo prova skadon, statusi
--                             bëhet 'expired' dhe asgjë nuk kujton se ajo u dha.
--
--    `subscription_events`  — çdo ndryshim regjistrohet: nisje prove, blerje e
--                             verifikuar, anulim, rikthim, skadim. Pa këtë,
--                             një mosmarrëveshje faturimi ("nuk e anulova
--                             kurrë") nuk zgjidhet dot, dhe as nuk dihet nga
--                             erdhi një ndryshim statusi.
--
--  I sigurt për t'u ri-ekzekutuar.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'trial_used_at');
SET @sql := IF(@has = 0,
  "ALTER TABLE users ADD COLUMN trial_used_at DATETIME NULL AFTER subscription_end_at",
  "SELECT 'trial_used_at ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'cancelled_at');
SET @sql := IF(@has = 0,
  "ALTER TABLE users ADD COLUMN cancelled_at DATETIME NULL AFTER trial_used_at",
  "SELECT 'cancelled_at ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
--  Historiku i abonimit
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_events (
  id           CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id      CHAR(36) NOT NULL,

  /* Çfarë ndodhi. `verified` do të thotë se fatura kaloi kontrollin e dyqanit. */
  event        ENUM('trial_started','verified','cancelled','resumed','expired','restored')
               NOT NULL,

  store        ENUM('appstore','googleplay','none') NOT NULL DEFAULT 'none',
  plan         ENUM('monthly','yearly','lifetime') NULL,
  price_eur    DECIMAL(6,2) NULL,

  /*
   * Identifikuesi i transaksionit te dyqani — JO vetë fatura.
   *
   * ⚠️  Fatura e plotë nuk ruhet: është e gjatë, ndryshon me çdo rinovim, dhe
   *     mban të dhëna të llogarisë së dyqanit. Ruhet identifikuesi, që një
   *     mosmarrëveshje të gjurmohet te Apple/Google pa mbajtur ne atë ngarkesë.
   */
  transaction_id VARCHAR(191) NULL,

  /* Nga erdhi ndryshimi: aplikacioni, webhook-u i dyqanit, apo admini. */
  source       ENUM('app','store_webhook','admin') NOT NULL DEFAULT 'app',
  note         VARCHAR(255) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_sub_events_user (user_id, created_at),
  /* Një transaksion i dyqanit nuk duhet regjistruar dy herë — mbrojtje ndaj
     përsëritjes së të njëjtit webhook. */
  UNIQUE KEY uq_sub_event_txn (transaction_id),
  CONSTRAINT fk_sub_event_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT (SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
           AND COLUMN_NAME IN ('trial_used_at','cancelled_at')) AS kolona_te_reja,
       (SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subscription_events') AS tabela;
