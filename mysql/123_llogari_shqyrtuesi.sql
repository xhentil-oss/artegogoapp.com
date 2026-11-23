-- ══════════════════════════════════════════════════════════════
--  LLOGARIA E SHQYRTUESIT TË APPLE-IT
--
--  App Review Information te App Store Connect pranon VETËM një palë
--  kredenciale. Te Google Play u zgjidh me tri llogari (`35_llogari_demo.sql`),
--  sepse shqyrtuesit punojnë në disa pajisje njëkohësisht dhe rregulli
--  "një llogari — një pajisje" i nxirrte jashtë njëri-tjetrin. Te Apple ai
--  truk nuk vlen: një llogari, disa pajisje.
--
--  Prandaj kjo llogari e kapërcen atë rregull, dhe vetëm ajo.
--
--  Dy gjëra duhen, ndryshe shqyrtimi mbyllet me "nuk arritëm të hyjmë":
--
--    1. AKSES I PLOTË. Çdo meditim është premium (`12_no_free.sql`) dhe
--       `GET /audio/:id` kthen 402 pa abonim. Një llogari e thjeshtë e lë
--       shqyrtuesin para paywall-it, pa parë asgjë.
--
--    2. PA KYÇJE PAJISJEJE. `skip_session_lock = 1` — shih `api/src/auth.js`.
--       Pa të, pajisja e dytë e shqyrtuesit e nxjerr të parën jashtë.
--
--  ⚠️  PARA SE TË EKZEKUTOHET: llogaria duhet hapur nga vetë aplikacioni
--      (Regjistrohu), me fjalëkalim të zgjedhur nga ti. Fjalëkalimi ruhet si
--      hash i llogaritur nga serveri, ndaj nuk futet dot me SQL.
--
--  ⚠️  FJALËKALIMI NUK SHKRUHET KËTU. Ky skedar shkon te GitHub-i, që është
--      publik. Shkruaje VETËM te App Store Connect → App Review Information.
--
--  I sigurt për t'u ri-ekzekutuar.
-- ══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

-- ---------------------------------------------------------------
--  1. Kolona `skip_session_lock`
-- ---------------------------------------------------------------

SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                AND COLUMN_NAME = 'skip_session_lock');
SET @sql := IF(@has = 0,
  "ALTER TABLE users ADD COLUMN skip_session_lock TINYINT(1) NOT NULL DEFAULT 0 AFTER session_id",
  "SELECT 'skip_session_lock ekziston' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
--  2. Llogaritë e shqyrtuesve
-- ---------------------------------------------------------------
--  Apple-it i jepet `apple@drartegogo.com`. Të treja të Google-it e marrin
--  gjithashtu përjashtimin — ai rregull i pengonte edhe atje.

UPDATE users
   SET is_premium            = 1,
       subscription_status   = 'active',
       subscription_plan     = 'lifetime',
       subscription_start_at = NOW(),
       -- Larg, që shqyrtimi të mos bjerë kurrë mbi një abonim të skaduar.
       subscription_end_at   = '2035-01-01 00:00:00',
       -- Prova shënohet si e përdorur: llogaria nuk ka nevojë për të.
       trial_used_at         = COALESCE(trial_used_at, NOW()),
       skip_session_lock     = 1
 WHERE email IN ('apple@drartegogo.com',
                 'play1@drartegogo.com',
                 'play2@drartegogo.com',
                 'play3@drartegogo.com');

-- ---------------------------------------------------------------
--  3. Kontroll
-- ---------------------------------------------------------------
--  Pritet: `apple@drartegogo.com` me is_premium 1, plan lifetime,
--  skip_session_lock 1. Nëse nuk del fare, llogaria nuk është krijuar ende
--  nga aplikacioni.

SELECT email, is_premium, subscription_status, subscription_plan,
       subscription_end_at, skip_session_lock
  FROM users
 WHERE email IN ('apple@drartegogo.com',
                 'play1@drartegogo.com',
                 'play2@drartegogo.com',
                 'play3@drartegogo.com')
 ORDER BY email;
