-- ═══════════════════════════════════════════════════════════════
--  ARTE GOGO — skema për MySQL 8.0+ / MariaDB 10.4+  (cPanel)
-- ═══════════════════════════════════════════════════════════════
--
--  IMPORTIMI:
--    cPanel → MySQL Databases → krijo databazën dhe përdoruesin
--    cPanel → phpMyAdmin → zgjidh databazën → Import → ky skedar
--    Pastaj `02_triggers.sql` dhe `03_seed.sql`, sipas radhës.
--
-- ───────────────────────────────────────────────────────────────
--  ⚠️  ÇFARË HUMBET DUKE KALUAR NGA POSTGRES TE MYSQL
-- ───────────────────────────────────────────────────────────────
--
--  1. ROW LEVEL SECURITY NUK EKZISTON.
--     Te versioni Postgres, databaza vetë ndalonte një përdorues të lexonte
--     të dhënat e tjetrit — edhe sikur kodi të kishte gabim. MySQL nuk e ka
--     këtë. Çdo kontroll duhet bërë te API-ja, në ÇDO endpoint, pa harruar
--     asnjë. Një `WHERE user_id = ?` i harruar do të thotë rrjedhje të
--     dhënash pa asnjë paralajmërim.
--
--  2. NUK KA AUTENTIKIM TË GATSHËM.
--     `auth.users` ishte i Supabase-it. Këtu ka `users.password_hash` dhe
--     hash-imin duhet ta bëjë API-ja me **bcrypt** ose **argon2id** — kurrë
--     MD5 apo SHA1, dhe kurrë fjalëkalim i pastër.
--
--  3. NUK KA VARGJE (`text[]`).
--     `tags`, `completed_days` dhe `days_of_week` u bënë tabela ose JSON.
--
--  4. DITA E STREAK-UT VJEN NGA APLIKACIONI.
--     Te Postgres dita llogaritej me zonën kohore të përdoruesit. MySQL e bën
--     këtë me `CONVERT_TZ()`, që kërkon tabelat e zonave kohore — dhe në
--     hosting të përbashkët ato zakonisht NUK janë të ngarkuara. Ndaj
--     `meditation_sessions.local_date` shkruhet nga API-ja, që e di zonën e
--     përdoruesit. Kjo është edhe më e saktë: mban vetë edhe orën verore.
--
-- ───────────────────────────────────────────────────────────────

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

/*
 * `utf8mb4` shkruhet shprehimisht kudo.
 *
 * Shumë instalime cPanel e kanë ende `latin1` si parazgjedhje. Me të, shkronjat
 * ë dhe ç ruhen të prishura — dhe prishja duket vetëm pasi të jenë futur 244
 * meditimet. `utf8mb4_unicode_ci` punon në çdo MySQL 5.7+ dhe MariaDB.
 */

-- ═══════════════════════════════════════════════════════════════
--  PËRDORUESIT
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id                     CHAR(36)     NOT NULL DEFAULT (UUID()),
  email                  VARCHAR(190) NOT NULL,
  phone                  VARCHAR(32)  NULL,

  /* Vetëm hash — kurrë fjalëkalimi. Gjatësia 255 nxë bcrypt dhe argon2id. */
  password_hash          VARCHAR(255) NULL,

  name                   VARCHAR(120) NOT NULL,
  avatar_url             TEXT         NULL,
  is_admin               TINYINT(1)   NOT NULL DEFAULT 0,

  /*
   * Zona kohore mbahet për API-në, që të llogarisë `local_date` të seancave.
   * Emri IANA, jo numri: një offset i ngurtë do të gabonte gjysmën e vitit,
   * kur hyn ora verore.
   */
  timezone               VARCHAR(64)  NOT NULL DEFAULT 'Europe/Tirane',

  is_premium             TINYINT(1)   NOT NULL DEFAULT 0,
  subscription_status    ENUM('active','cancelled','expired','trial') NOT NULL DEFAULT 'expired',
  subscription_plan      ENUM('monthly','yearly','lifetime') NULL,
  subscription_price_eur DECIMAL(6,2) NULL,

  /*
   * DATETIME, jo TIMESTAMP.
   *
   * TIMESTAMP i MySQL-it mbaron më 19 janar 2038. Një abonim 'lifetime' do të
   * kishte datë mbarimi shumë përtej asaj — dhe do të dështonte në heshtje.
   * Të gjitha datat këtu ruhen në UTC; kthimin në orën lokale e bën aplikacioni.
   */
  subscription_start_at  DATETIME     NULL,
  subscription_end_at    DATETIME     NULL,

  onboarding_completed   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone),
  KEY idx_users_premium (is_premium),
  KEY idx_users_sub_end (subscription_end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════
--  PËRMBAJTJA
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS techniques (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  slug          VARCHAR(80)  NOT NULL,
  name          VARCHAR(160) NOT NULL,
  description   TEXT         NULL,
  icon_name     VARCHAR(60)  NULL,
  display_order INT          NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_techniques_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  slug          VARCHAR(80)  NOT NULL,
  name          VARCHAR(160) NOT NULL,
  description   TEXT         NULL,
  cover_url     TEXT         NULL,
  display_order INT          NOT NULL DEFAULT 0,
  is_featured   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meditations (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  title             VARCHAR(200) NOT NULL,
  subtitle          VARCHAR(255) NULL,
  technique_id      CHAR(36)     NULL,
  category_id       CHAR(36)     NULL,
  subgroup          VARCHAR(120) NULL,
  narrator          VARCHAR(120) NULL,
  duration_sec      INT          NOT NULL,

  /* NULL derisa të regjistrohet audio — shih kufizimin te `published_at`. */
  audio_url         TEXT         NULL,
  cover_url         TEXT         NULL,
  description       TEXT         NULL,

  is_premium        TINYINT(1)   NOT NULL DEFAULT 1,
  average_rating    DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count      INT          NOT NULL DEFAULT 0,
  play_count        INT          NOT NULL DEFAULT 0,

  is_daily_featured TINYINT(1)   NOT NULL DEFAULT 0,
  is_short_daily    TINYINT(1)   NOT NULL DEFAULT 0,
  is_morning_ritual TINYINT(1)   NOT NULL DEFAULT 0,

  published_at      DATETIME     NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_meditations_technique (technique_id),
  KEY idx_meditations_category (category_id),
  KEY idx_meditations_premium (is_premium),
  KEY idx_meditations_daily (is_daily_featured),
  KEY idx_meditations_published (published_at),
  /* Kërkimi me titull; `FULLTEXT` punon vetëm në InnoDB të MySQL 5.6+. */
  FULLTEXT KEY ft_meditations (title, description),

  CONSTRAINT fk_med_technique FOREIGN KEY (technique_id)
    REFERENCES techniques(id) ON DELETE SET NULL,
  CONSTRAINT fk_med_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE SET NULL,

  CONSTRAINT chk_med_duration CHECK (duration_sec > 0),
  CONSTRAINT chk_med_rating   CHECK (average_rating BETWEEN 0 AND 5),
  /* Importo sa të duash pa audio; publikohet vetëm ajo që e ka. */
  CONSTRAINT chk_med_published CHECK (published_at IS NULL OR audio_url IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*
 * Tag-et: tabelë më vete, jo kolonë JSON.
 *
 * MySQL nuk ka vargje. Një kolonë JSON do të ruhej, por kërkimi mbi të nuk
 * përdor indeks pa punë shtesë. Një tabelë lidhëse është e indeksueshme që
 * në fillim — dhe lejon të numërosh sa meditime ka çdo tag.
 */
CREATE TABLE IF NOT EXISTS meditation_tags (
  meditation_id CHAR(36)    NOT NULL,
  tag           VARCHAR(60) NOT NULL,
  PRIMARY KEY (meditation_id, tag),
  KEY idx_tag (tag),
  CONSTRAINT fk_tag_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sounds (
  id             CHAR(36)     NOT NULL DEFAULT (UUID()),
  name           VARCHAR(160) NOT NULL,
  category       ENUM('focus','sleep','relax','energy') NOT NULL DEFAULT 'focus',
  audio_url      TEXT         NULL,
  cover_url      TEXT         NULL,
  duration_sec   INT          NULL,
  is_loop        TINYINT(1)   NOT NULL DEFAULT 1,
  is_premium     TINYINT(1)   NOT NULL DEFAULT 1,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count   INT          NOT NULL DEFAULT 0,
  display_order  INT          NOT NULL DEFAULT 0,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS programs (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  slug               VARCHAR(80)  NOT NULL,
  title              VARCHAR(160) NOT NULL,
  subtitle           VARCHAR(255) NULL,
  description        TEXT         NULL,
  theme              VARCHAR(120) NULL,
  total_days         INT          NOT NULL,
  total_duration_min INT          NULL,
  cover_url          TEXT         NULL,
  cover_color        VARCHAR(16)  NULL,
  is_premium         TINYINT(1)   NOT NULL DEFAULT 1,
  display_order      INT          NOT NULL DEFAULT 0,
  is_active          TINYINT(1)   NOT NULL DEFAULT 1,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_programs_slug (slug),
  CONSTRAINT chk_prog_days CHECK (total_days > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS program_days (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  program_id  CHAR(36)     NOT NULL,
  day_number  INT          NOT NULL,
  title       VARCHAR(200) NULL,
  description TEXT         NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_program_day (program_id, day_number),
  CONSTRAINT fk_day_program FOREIGN KEY (program_id)
    REFERENCES programs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS program_day_meditations (
  id             CHAR(36) NOT NULL DEFAULT (UUID()),
  program_day_id CHAR(36) NOT NULL,
  meditation_id  CHAR(36) NOT NULL,
  order_in_day   INT      NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_day_meditation (program_day_id, meditation_id),
  KEY idx_pdm_meditation (meditation_id),
  CONSTRAINT fk_pdm_day FOREIGN KEY (program_day_id)
    REFERENCES program_days(id) ON DELETE CASCADE,
  CONSTRAINT fk_pdm_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_quotes (
  id           CHAR(36)    NOT NULL DEFAULT (UUID()),
  text         TEXT        NOT NULL,
  author       VARCHAR(120) NULL,
  category     VARCHAR(60) NULL,
  display_date DATE        NULL,
  is_active    TINYINT(1)  NOT NULL DEFAULT 1,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS morning_rituals (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  title         VARCHAR(200) NOT NULL,
  description   TEXT         NULL,
  cover_url     TEXT         NULL,
  cover_color   VARCHAR(16)  NULL,
  meditation_id CHAR(36)     NULL,
  program_id    CHAR(36)     NULL,
  display_date  DATE         NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_ritual_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE SET NULL,
  CONSTRAINT fk_ritual_program FOREIGN KEY (program_id)
    REFERENCES programs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════
--  PROGRESI
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id            CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  meditation_id CHAR(36) NULL,
  sound_id      CHAR(36) NULL,
  program_id    CHAR(36) NULL,
  program_day   INT      NULL,
  duration_sec  INT      NOT NULL,
  completed     TINYINT(1) NOT NULL DEFAULT 0,
  source        ENUM('today','library','program','creation','search')
                NOT NULL DEFAULT 'library',
  mood_before   TINYINT  NULL,
  mood_after    TINYINT  NULL,
  notes         TEXT     NULL,

  /*
   * Dita SIPAS ORËS SË PËRDORUESIT, e shkruar nga API-ja.
   *
   * Streak-u matet në ditë. Në UTC, një meditim në 23:00 në Tiranë bie të
   * nesërmen — dhe vargu do të dilte i gabuar për këdo që mediton mbrëmjeve.
   * `CONVERT_TZ()` do ta zgjidhte, por kërkon tabelat e zonave kohore, që në
   * hosting të përbashkët zakonisht mungojnë. API-ja e di zonën e përdoruesit
   * dhe e dërgon ditën gati — kjo mban vetvetiu edhe orën verore.
   */
  local_date    DATE     NOT NULL,

  listened_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_sessions_user_date (user_id, listened_at DESC),
  KEY idx_sessions_meditation (meditation_id),
  KEY idx_sessions_user_completed (user_id, completed),
  CONSTRAINT fk_sess_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sess_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE SET NULL,
  CONSTRAINT fk_sess_sound FOREIGN KEY (sound_id)
    REFERENCES sounds(id) ON DELETE SET NULL,
  CONSTRAINT fk_sess_program FOREIGN KEY (program_id)
    REFERENCES programs(id) ON DELETE SET NULL,
  CONSTRAINT chk_sess_duration CHECK (duration_sec >= 0),
  CONSTRAINT chk_sess_mood_before CHECK (mood_before IS NULL OR mood_before BETWEEN 1 AND 5),
  CONSTRAINT chk_sess_mood_after  CHECK (mood_after  IS NULL OR mood_after  BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS streaks (
  id                        CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id                   CHAR(36) NOT NULL,
  current_streak            INT      NOT NULL DEFAULT 0,
  best_streak               INT      NOT NULL DEFAULT 0,
  last_meditation_date      DATE     NULL,
  current_streak_started_on DATE     NULL,
  total_sessions            INT      NOT NULL DEFAULT 0,

  /* Sekondat janë burimi; minutat rrjedhin prej tyre me një pjesëtim të
     vetëm. Mbledhja e minutave të rrumbullakosura do të gabonte. */
  total_seconds             BIGINT   NOT NULL DEFAULT 0,
  total_minutes             INT      GENERATED ALWAYS AS (total_seconds DIV 60) STORED,

  updated_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_streak_user (user_id),
  CONSTRAINT fk_streak_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medals (
  id                CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id           CHAR(36) NOT NULL,
  medal_type        ENUM('bronze','silver','gold') NOT NULL,
  reason            VARCHAR(160) NULL,

  /* Çelësi i idempotencës: e njëjta arritje nuk shkruhet dy herë, ndërsa një
     varg i dytë që arrin ditën 3 jep medaljen e vet. */
  streak_start_date DATE     NULL,
  streak_day        INT      NULL,

  earned_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_medal_award (user_id, medal_type, streak_start_date, streak_day),
  KEY idx_medals_user (user_id, earned_at),
  CONSTRAINT fk_medal_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_program_progress (
  id                   CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id              CHAR(36) NOT NULL,
  program_id           CHAR(36) NOT NULL,
  current_day          INT      NOT NULL DEFAULT 1,
  total_days_completed INT      NOT NULL DEFAULT 0,
  started_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at     DATETIME NULL,
  completed_at         DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_program (user_id, program_id),
  KEY idx_progress_user (user_id),
  CONSTRAINT fk_upp_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_upp_program FOREIGN KEY (program_id)
    REFERENCES programs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*
 * `completed_days` ishte varg te Postgres. Këtu është tabelë — dhe kështu
 * ruhet edhe KUR u krye secila ditë, çka vargu nuk e mbante dot.
 */
CREATE TABLE IF NOT EXISTS user_program_day_completions (
  user_id      CHAR(36) NOT NULL,
  program_id   CHAR(36) NOT NULL,
  day_number   INT      NOT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, program_id, day_number),
  CONSTRAINT fk_updc_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_updc_program FOREIGN KEY (program_id)
    REFERENCES programs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════
--  TË DHËNAT PERSONALE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS favorites (
  id            CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  meditation_id CHAR(36) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorite (user_id, meditation_id),
  KEY idx_favorites_user (user_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS downloads (
  id              CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  meditation_id   CHAR(36) NOT NULL,
  downloaded_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  file_size_bytes BIGINT   NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_download (user_id, meditation_id),
  KEY idx_downloads_user (user_id),
  CONSTRAINT fk_dl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_dl_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reminders (
  id            CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  reminder_type ENUM('morning','midday','evening') NOT NULL,
  time_of_day   TIME     NOT NULL,
  is_enabled    TINYINT(1) NOT NULL DEFAULT 0,

  /*
   * Ditët e javës si shtatë flamurë, jo si varg.
   *
   * MySQL nuk ka vargje, dhe një kolonë JSON nuk indeksohet lehtë. Shtatë
   * kolona janë të shëmtuara në kod, por të shpejta për query-n që i duhet
   * dërguesit të njoftimeve: "kush ka njoftim të hënën në 07:30".
   */
  on_mon TINYINT(1) NOT NULL DEFAULT 1,
  on_tue TINYINT(1) NOT NULL DEFAULT 1,
  on_wed TINYINT(1) NOT NULL DEFAULT 1,
  on_thu TINYINT(1) NOT NULL DEFAULT 1,
  on_fri TINYINT(1) NOT NULL DEFAULT 1,
  on_sat TINYINT(1) NOT NULL DEFAULT 1,
  on_sun TINYINT(1) NOT NULL DEFAULT 1,

  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                         ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reminder (user_id, reminder_type),
  KEY idx_reminders_due (is_enabled, time_of_day),
  CONSTRAINT fk_rem_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS habits (
  id         CHAR(36)    NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)    NOT NULL,
  `date`     DATE        NOT NULL,
  habit_type VARCHAR(60) NOT NULL,
  value      DECIMAL(10,2) NOT NULL DEFAULT 1,
  notes      TEXT        NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_habit (user_id, `date`, habit_type),
  KEY idx_habits_user_date (user_id, `date`),
  CONSTRAINT fk_habit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS moods (
  id           CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id      CHAR(36) NOT NULL,
  `date`       DATE     NOT NULL,
  mood_score   TINYINT  NOT NULL,
  mood_label   VARCHAR(60) NULL,
  energy_level TINYINT  NULL,
  notes        TEXT     NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mood (user_id, `date`),
  KEY idx_moods_user_date (user_id, `date`),
  CONSTRAINT fk_mood_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_mood_score CHECK (mood_score BETWEEN 1 AND 5),
  CONSTRAINT chk_mood_energy CHECK (energy_level IS NULL OR energy_level BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS creations (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id            CHAR(36)     NOT NULL,
  name               VARCHAR(160) NOT NULL,
  goal               VARCHAR(80)  NULL,
  generation_type    ENUM('ai_generated','manual') NOT NULL DEFAULT 'manual',
  total_duration_sec INT          NOT NULL DEFAULT 0,
  is_saved           TINYINT(1)   NOT NULL DEFAULT 0,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_creations_user (user_id, created_at),
  CONSTRAINT fk_creation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS creation_steps (
  id            CHAR(36) NOT NULL DEFAULT (UUID()),
  creation_id   CHAR(36) NOT NULL,
  meditation_id CHAR(36) NOT NULL,
  step_order    INT      NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_creation_step (creation_id, step_order),
  KEY idx_steps_meditation (meditation_id),
  CONSTRAINT fk_step_creation FOREIGN KEY (creation_id)
    REFERENCES creations(id) ON DELETE CASCADE,
  CONSTRAINT fk_step_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meditation_ratings (
  id            CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  meditation_id CHAR(36) NOT NULL,
  rating        TINYINT  NOT NULL,
  comment       TEXT     NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rating (user_id, meditation_id),
  KEY idx_ratings_meditation (meditation_id),
  CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rating_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE CASCADE,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════
--  KOMUNITETI
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_posts (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  author_name       VARCHAR(120) NOT NULL,
  author_avatar_url TEXT         NULL,
  author_role       VARCHAR(120) NOT NULL DEFAULT 'Arte Gogo',
  is_verified       TINYINT(1)   NOT NULL DEFAULT 1,
  post_type         ENUM('frymezim','njoftim','meditim','informacion')
                    NOT NULL DEFAULT 'frymezim',
  text_content      TEXT         NOT NULL,
  media_url         TEXT         NULL,
  media_type        ENUM('image','video') NULL,
  meditation_id     CHAR(36)     NULL,
  reaction_count    INT          NOT NULL DEFAULT 0,
  comment_count     INT          NOT NULL DEFAULT 0,
  is_published      TINYINT(1)   NOT NULL DEFAULT 1,
  published_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_posts_published (is_published, published_at),
  KEY idx_posts_meditation (meditation_id),
  CONSTRAINT fk_post_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE SET NULL,
  /* Media pa lloj nuk vizatohet dot; lloji pa media nuk ka kuptim. */
  CONSTRAINT chk_post_media
    CHECK ((media_url IS NULL AND media_type IS NULL)
        OR (media_url IS NOT NULL AND media_type IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_reactions (
  id            CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  post_id       CHAR(36) NOT NULL,
  reaction_type ENUM('like','love','fire','clap') NOT NULL DEFAULT 'like',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reaction (user_id, post_id),
  KEY idx_reactions_post (post_id),
  CONSTRAINT fk_reaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reaction_post FOREIGN KEY (post_id)
    REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_comments (
  id                CHAR(36) NOT NULL DEFAULT (UUID()),
  post_id           CHAR(36) NOT NULL,
  user_id           CHAR(36) NOT NULL,
  content           TEXT     NOT NULL,
  parent_comment_id CHAR(36) NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_post (post_id, created_at),
  KEY idx_comments_parent (parent_comment_id),
  KEY idx_comments_user (user_id),
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id)
    REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id)
    REFERENCES post_comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_saves (
  id         CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36) NOT NULL,
  post_id    CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_save (user_id, post_id),
  KEY idx_saves_user (user_id),
  CONSTRAINT fk_save_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_save_post FOREIGN KEY (post_id)
    REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)     NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT         NOT NULL,
  type       ENUM('reminder','new_meditation','program_update',
                  'streak','medal','community') NOT NULL,
  related_id CHAR(36)     NULL,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  sent_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id, is_read, sent_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ═══════════════════════════════════════════════════════════════
--  PAMJET
-- ═══════════════════════════════════════════════════════════════
/* Kohëzgjatja e vërtetë e programit — nga përmbajtja, jo e shkruar me dorë. */
CREATE OR REPLACE VIEW program_totals AS
  SELECT p.id AS program_id,
         p.slug,
         COUNT(DISTINCT d.id)                     AS days_with_content,
         COALESCE(SUM(m.duration_sec), 0)         AS total_seconds,
         COALESCE(SUM(m.duration_sec), 0) DIV 60  AS total_minutes
    FROM programs p
    LEFT JOIN program_days d ON d.program_id = p.id
    LEFT JOIN program_day_meditations pdm ON pdm.program_day_id = d.id
    LEFT JOIN meditations m ON m.id = pdm.meditation_id
   GROUP BY p.id, p.slug;
