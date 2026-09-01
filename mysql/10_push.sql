-- ═══════════════════════════════════════════════════════════════
--  WEB PUSH — abonimet e pajisjeve
--
--  Ndryshe nga APNs/FCM, që kërkojnë një token të vetëm, Web Push kërkon TRE
--  gjëra: adresën e dërgimit (`endpoint`, e ndryshme për çdo shfletues) dhe dy
--  çelësa nga vetë pajisja (`p256dh`, `auth`), me të cilët trupi i njoftimit
--  kriptohet. Serveri nuk mund ta lexojë atë që dërgon — kriptimi është nga
--  fundi në fund, dhe kjo është pjesë e standardit, jo zgjedhje.
--
--  Prandaj tabelë më vete dhe jo `device_tokens`: forma e të dhënave është
--  krejt tjetër, dhe përzierja e tyre do të kërkonte kolona bosh te secila anë.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)     NOT NULL,

  /* Adresa te shërbimi i shfletuesit (Google/Mozilla/Apple). 500 shenja mbulon
     çdo formë të njohur; me utf8mb4 janë 2000 byte, brenda kufirit 3072 të
     indeksit unik. */
  endpoint   VARCHAR(500) NOT NULL,
  p256dh     VARCHAR(255) NOT NULL,
  auth_key   VARCHAR(255) NOT NULL,

  platform   ENUM('ios','android','desktop','unknown') NOT NULL DEFAULT 'unknown',
  user_agent VARCHAR(255) NULL,

  /*
   * Kur shërbimi i shfletuesit kthen 404 ose 410, abonimi ka skaduar.
   *
   * ⚠️  Shënohet i çaktivizuar, JO i fshirë. Një përdorues që thotë "nuk marr
   *     njoftime" ka nevojë për një gjurmë; një rresht i fshirë nuk e jep.
   *     Dhe pa këtë flamur, dërguesi do të provonte pa fund një adresë të
   *     vdekur, duke ngadalësuar çdo rregji të cron-it.
   */
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  last_error VARCHAR(160) NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_sent_at DATETIME NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_push_endpoint (endpoint),
  KEY idx_push_user (user_id, is_active),
  CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*
 * Gjurma e dërgimit te vetë njoftimi.
 *
 * Pa të, nuk dihet nëse një njoftim u dërgua vërtet apo vetëm u krijua — dhe
 * pikërisht ky dallim është ai që duhet të shihet kur klientja thotë "nuk më
 * erdhi njoftimi i mëngjesit".
 */
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications'
                AND COLUMN_NAME = 'push_sent_at');
SET @sql := IF(@has = 0,
  "ALTER TABLE notifications ADD COLUMN push_sent_at DATETIME NULL, ADD COLUMN push_result VARCHAR(160) NULL",
  "SELECT 'kolonat ekzistojnë' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT (SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'push_subscriptions') AS tabela,
       (SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications'
           AND COLUMN_NAME IN ('push_sent_at','push_result')) AS kolona;
