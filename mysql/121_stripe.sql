-- ═══════════════════════════════════════════════════════════════
--  PAGESAT ME STRIPE — kolonat dhe gjurma
--
--  Deri tani abonimi kishte vetëm dy burime: provën 3-ditore që e jepte vetë
--  serveri, dhe një faturë dyqani që `storeVerify.js` e kontrollonte. Të dyja
--  mbaheshin te `users` dhe nuk kishin nevojë për asnjë identifikues të jashtëm.
--
--  Stripe sjell dy identifikues që DUHET të ruhen, përndryshe lidhja mes
--  llogarisë sonë dhe abonimit atje humbet:
--
--    `stripe_customer_id`     — klienti te Stripe. Krijohet një herë dhe
--                               ripërdoret: pa të, çdo blerje e radhës do të
--                               hapte një klient të ri, dhe i njëjti njeri do
--                               të kishte tri karta e tre abonime pa lidhje
--                               mes tyre.
--
--    `stripe_subscription_id` — vetë abonimi. Pa të, anulimi nga aplikacioni
--                               nuk ka çfarë të anulojë te Stripe: do të
--                               shkruanim 'cancelled' te databaza, karta do të
--                               vazhdonte të tarifohej, dhe përdoruesi do të
--                               kishte të drejtë të plotë të ankohej.
--
--  ⚠️  WEBHOOK-U ËSHTË BURIMI I VËRTETË, JO KTHIMI I SHFLETUESIT.
--
--      Pas pagesës Stripe e kthen përdoruesin te faqja, por ai kthim mund të
--      mos ndodhë kurrë: mbyll skedën, bie interneti, ose faturimi dështon tri
--      ditë më vonë kur askush nuk ka hapur asgjë. Gjendja vjen nga webhook-u,
--      dhe `stripe_events` siguron që i njëjti njoftim — Stripe i përsërit me
--      qëllim derisa të marrë 200 — të mos zbatohet dy herë.
--
--  I sigurt për t'u ri-ekzekutuar.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

-- ---------------------------------------------------------------
--  1. Identifikuesit te `users`
-- ---------------------------------------------------------------

SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'stripe_customer_id');
SET @sql := IF(@has = 0,
  "ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(64) NULL AFTER cancelled_at",
  "SELECT 'stripe_customer_id ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'stripe_subscription_id');
SET @sql := IF(@has = 0,
  "ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(64) NULL AFTER stripe_customer_id",
  "SELECT 'stripe_subscription_id ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

/*
 * A do të rinovohet në fund të periudhës?
 *
 * ⚠️  NUK NXIRRET DOT NGA `cancelled_at`. Ajo fushë thotë "njeriu e shtypi
 *     anulimin", ndërsa kjo thotë "Stripe NUK do ta tarifojë më". Ndahen kur
 *     anulimi bëhet nga paneli i Stripe-it, ose kur një pagesë e dështuar e
 *     mbyll abonimin pa e prekur askush butonin. Ekrani lexon këtë, sepse
 *     pikërisht kjo është e vërteta e kartës.
 */
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'cancel_at_period_end');
SET @sql := IF(@has = 0,
  "ALTER TABLE users ADD COLUMN cancel_at_period_end TINYINT(1) NOT NULL DEFAULT 0 AFTER stripe_subscription_id",
  "SELECT 'cancel_at_period_end ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

/*
 * `stripe_customer_id` është unik: dy rreshta me të njëjtin klient do të
 * thoshin se një pagesë nuk dihet se cilën llogari hap. Webhook-u e gjen
 * përdoruesin pikërisht me këtë fushë, dhe `one()` do të kthente rastësisht
 * njërin nga të dy.
 */
SET @has := (SELECT COUNT(*) FROM information_schema.STATISTICS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                AND INDEX_NAME = 'uq_users_stripe_customer');
SET @sql := IF(@has = 0,
  "ALTER TABLE users ADD UNIQUE KEY uq_users_stripe_customer (stripe_customer_id)",
  "SELECT 'uq_users_stripe_customer ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has := (SELECT COUNT(*) FROM information_schema.STATISTICS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                AND INDEX_NAME = 'idx_users_stripe_sub');
SET @sql := IF(@has = 0,
  "ALTER TABLE users ADD KEY idx_users_stripe_sub (stripe_subscription_id)",
  "SELECT 'idx_users_stripe_sub ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
--  2. Historiku mëson Stripe-in
-- ---------------------------------------------------------------
/*
 * ⚠️  Të tria listat rishkruhen TË PLOTA, me gjithçka që ekzistonte më parë.
 *     `MODIFY COLUMN` e zëvendëson listën, nuk i shton asaj: po harrove
 *     'promo_redeemed' (shtuar te `120_kodet_e_muajit_falas.sql`), rreshtat e
 *     vjetër bëhen të palexueshëm dhe shkrimi i ri dështon.
 */
ALTER TABLE subscription_events
  MODIFY COLUMN event
  ENUM('trial_started','verified','cancelled','resumed','expired','restored',
       'promo_redeemed','renewed','payment_failed')
  NOT NULL;

ALTER TABLE subscription_events
  MODIFY COLUMN store
  ENUM('appstore','googleplay','stripe','none') NOT NULL DEFAULT 'none';

ALTER TABLE subscription_events
  MODIFY COLUMN source
  ENUM('app','store_webhook','stripe_webhook','admin') NOT NULL DEFAULT 'app';

-- ---------------------------------------------------------------
--  3. Njoftimet e zbatuara — mbrojtje nga përsëritja
-- ---------------------------------------------------------------
/*
 * Stripe e dërgon të njëjtin njoftim sërish derisa të marrë `200`, dhe
 * ndonjëherë edhe pasi e merr. Pa këtë tabelë, një rinovim i vetëm do të
 * shtonte tre rreshta te historiku dhe do ta zhvendoste `subscription_end_at`
 * tri herë përpara — pra një muaj i paguar do të jepte tre.
 *
 * `id` është identifikuesi i vetë ngjarjes te Stripe (`evt_…`), ndaj çelësi
 * primar e bën zbatimin e dytë të pamundur, jo thjesht të pamundshëm.
 */
CREATE TABLE IF NOT EXISTS stripe_events (
  id         VARCHAR(64)  NOT NULL,
  type       VARCHAR(80)  NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_stripe_events_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
--  Kontrolli
-- ---------------------------------------------------------------
/* Duhet: kolona 3, ngjarje 0. */
SELECT
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('stripe_customer_id','stripe_subscription_id','cancel_at_period_end')) AS kolona,
  (SELECT COUNT(*) FROM stripe_events) AS ngjarje;
