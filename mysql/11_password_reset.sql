-- ═══════════════════════════════════════════════════════════════
--  RIVENDOSJA E FJALËKALIMIT
--
--  ⚠️  TOKEN-I RUHET I HASH-UAR, NUK RUHET I PASTËR.
--
--      Një token rivendosjeje është po aq i fuqishëm sa fjalëkalimi: kush e
--      ka, hyn. Po të ruhej i pastër, kushdo që lexon një kopje të databazës —
--      një backup i harruar, një `SELECT` i gabuar te log-u — mund të hynte te
--      çdo llogari pa e ditur fjalëkalimin.
--
--      Prandaj ruhet `SHA256(token)`. Serveri llogarit të njëjtin hash kur
--      vjen kërkesa dhe krahason. Vargu i pastër ekziston vetëm te email-i.
--
--  ⚠️  DHE HIQET PAS PËRDORIMIT (`used_at`). Pa këtë, i njëjti link do të
--      punonte pa fund: kushdo që e gjen te historiku i email-it, edhe pas
--      muajsh, e ndryshon fjalëkalimin.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS password_resets (
  id         CHAR(36)    NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)    NOT NULL,

  /* SHA-256 në hex — gjithmonë 64 shenja. */
  token_hash CHAR(64)    NOT NULL,

  /* Skadimi është i shkurtër me qëllim: një link rivendosjeje që rri i
     vlefshëm ditë të tëra është një derë e hapur te posta e përdoruesit. */
  expires_at DATETIME    NOT NULL,
  used_at    DATETIME    NULL,

  /* Nga kush u kërkua — ndihmon kur dikush raporton kërkesa që nuk i bëri. */
  requested_ip VARCHAR(45) NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_reset_token (token_hash),
  KEY idx_reset_user (user_id, created_at),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT (SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'password_resets') AS tabela;
