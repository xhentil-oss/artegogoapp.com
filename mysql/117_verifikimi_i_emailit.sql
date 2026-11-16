-- ═══════════════════════════════════════════════════════════════
--  VERIFIKIMI I EMAILIT
--
--  Deri tani regjistrimi pranonte çdo varg që i ngjante një email-i: fjala
--  e fundit për "a ekziston kjo adresë" e kishte vetëm shprehja rregullore.
--  Kërkesë e klientes (16 nëntor 2026): llogaria nuk hapet derisa adresa të
--  provojë se është e saj.
--
--  ⚠️  LLOGARITË EKZISTUESE SHËNOHEN TË VERIFIKUARA.
--
--      Pa këtë, çdo përdorues i deritanishëm — përfshirë klienten — do të
--      mbyllej jashtë aplikacionit në çastin që ngarkohet API-ja e re, pa asnjë
--      email për t'u verifikuar, sepse për ta nuk u dërgua kurrë.
--
--  ⚠️  Token-i ruhet I HASH-UAR, si te `password_resets`. Arsyeja është e
--      njëjta: kush e ka token-in, hyn — dhe një kopje e databazës nuk duhet
--      ta japë atë.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

/*
 * `ADD COLUMN` pa kusht do të dështonte po të rrotullohej dy herë, dhe
 * `IF NOT EXISTS` nuk e njeh çdo version i MySQL-së. Prandaj kolona shtohet
 * përmes një urdhri të përgatitur, vetëm kur mungon.
 */
SET @ka := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users'
               AND COLUMN_NAME = 'email_verified_at');

SET @sql := IF(@ka = 0,
  'ALTER TABLE users ADD COLUMN email_verified_at DATETIME NULL DEFAULT NULL AFTER email',
  'SELECT "kolona ekziston" AS info');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

/* Të gjithë ata që kanë llogari sot hyjnë si më parë. */
UPDATE users SET email_verified_at = NOW() WHERE email_verified_at IS NULL;

CREATE TABLE IF NOT EXISTS email_verifications (
  id         CHAR(36)    NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)    NOT NULL,

  /* SHA-256 në hex — gjithmonë 64 shenja. */
  token_hash CHAR(64)    NOT NULL,

  /* Më i gjatë se ai i rivendosjes: një link verifikimi hapet shpesh të
     nesërmen, dhe një skadim 15-minutësh do të prodhonte vetëm ankesa. */
  expires_at DATETIME    NOT NULL,
  used_at    DATETIME    NULL,

  requested_ip VARCHAR(45) NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_verify_token (token_hash),
  KEY idx_verify_user (user_id, created_at),
  CONSTRAINT fk_verify_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* Kontrolli: kolona, tabela, dhe sa llogari mbeten pa verifikuar (duhet 0). */
SELECT
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'email_verified_at')                               AS kolona,
  (SELECT COUNT(*) FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'email_verifications') AS tabela,
  (SELECT COUNT(*) FROM users WHERE email_verified_at IS NULL)              AS pa_verifikuar;
