-- ═══════════════════════════════════════════════════════════════
--  NJOFTIMET — çelësi i mospërsëritjes dhe njoftimi i provës
--
--  Dy shtesa te `notifications`:
--
--    `trial` te enum-i `type`  — seksioni 8 e kërkon shprehimisht njoftimin
--                                "prova po mbaron" para ditës 3.
--
--    `dedupe_key`              — cron-i rrjedh çdo 15 minuta. Pa një çelës
--                                unik, i njëjti njoftim do të krijohej në çdo
--                                rregji: dyzet kujtesa "Koha për meditim" në
--                                një mëngjes. Me të, rregjia e dytë e gjen
--                                rreshtin ekzistues dhe nuk bën asgjë.
--
--  I sigurt për t'u ri-ekzekutuar.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

ALTER TABLE notifications
  MODIFY COLUMN type ENUM('reminder','new_meditation','program_update',
                          'streak','medal','community','trial') NOT NULL;

SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications'
                AND COLUMN_NAME = 'dedupe_key');
SET @sql := IF(@has = 0,
  "ALTER TABLE notifications ADD COLUMN dedupe_key VARCHAR(120) NULL AFTER related_id",
  "SELECT 'dedupe_key ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has := (SELECT COUNT(*) FROM information_schema.STATISTICS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications'
                AND INDEX_NAME = 'uq_notif_dedupe');
SET @sql := IF(@has = 0,
  "ALTER TABLE notifications ADD UNIQUE KEY uq_notif_dedupe (user_id, dedupe_key)",
  "SELECT 'indeksi ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

/*
 * Token-at e pajisjeve — pa to, APNs dhe FCM nuk kanë ku ta dërgojnë njoftimin.
 *
 * Një përdorues mund të ketë disa pajisje; çdo token është një rresht. Kur një
 * token skadon ose refuzohet nga dyqani, shënohet `is_active = 0` në vend që
 * të fshihet — historiku ndihmon kur dikush thotë "nuk marr njoftime".
 */
CREATE TABLE IF NOT EXISTS device_tokens (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)     NOT NULL,
  platform   ENUM('ios','android','web') NOT NULL,
  token      VARCHAR(255) NOT NULL,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  last_seen_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_device_token (token),
  KEY idx_device_user (user_id, is_active),
  CONSTRAINT fk_device_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT (SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications'
           AND COLUMN_NAME = 'dedupe_key') AS dedupe_key,
       (SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'device_tokens') AS device_tokens;
