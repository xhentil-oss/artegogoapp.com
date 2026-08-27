-- ═══════════════════════════════════════════════════════════════
--  TRIGGERAT — streak, medalje, vlerësime, numërues
-- ═══════════════════════════════════════════════════════════════
--
--  `DELIMITER` është udhëzim i KLIENTIT, jo i serverit: e kuptojnë mysql CLI
--  dhe phpMyAdmin. Nëse i ngarkon me një mjet tjetër që nuk e njeh, hiqi
--  rreshtat `DELIMITER` dhe zëvendëso `$$` me `;`.
--
--  ⚠️  Kufizim i MySQL-it: një trigger nuk mund ta prekë tabelën ku është
--      vendosur. Prandaj streak-u përditësohet nga `meditation_sessions`, dhe
--      medaljet nga `streaks` — zinxhir dy-nivelësh, i lejuar.

DELIMITER $$

-- ---------------------------------------------------------------
--  1. Streak-u pas çdo seance të kryer
-- ---------------------------------------------------------------
/*
 * Dita merret nga `NEW.local_date`, të cilën e shkruan API-ja sipas zonës
 * kohore të përdoruesit. Shih shënimin te `01_schema.sql`.
 *
 * Seancat e papërfunduara (nën 80% e dëgjuar) nuk e prekin streak-un.
 */
DROP TRIGGER IF EXISTS trg_session_streak$$
CREATE TRIGGER trg_session_streak
AFTER INSERT ON meditation_sessions
FOR EACH ROW
BEGIN
  DECLARE v_last  DATE DEFAULT NULL;
  DECLARE v_cur   INT  DEFAULT 0;
  DECLARE v_start DATE DEFAULT NULL;
  DECLARE v_next  INT  DEFAULT 1;

  IF NEW.completed = 1 THEN
    SELECT last_meditation_date, current_streak, current_streak_started_on
      INTO v_last, v_cur, v_start
      FROM streaks WHERE user_id = NEW.user_id;

    IF v_last IS NULL THEN
      /* Përdorues pa rresht streak-u — krijohet tani. */
      INSERT INTO streaks (user_id, current_streak, best_streak,
                           current_streak_started_on, last_meditation_date,
                           total_sessions, total_seconds)
      VALUES (NEW.user_id, 1, 1, NEW.local_date, NEW.local_date, 1, NEW.duration_sec)
      ON DUPLICATE KEY UPDATE
        current_streak            = 1,
        best_streak               = GREATEST(best_streak, 1),
        current_streak_started_on = NEW.local_date,
        last_meditation_date      = NEW.local_date,
        total_sessions            = total_sessions + 1,
        total_seconds             = total_seconds + NEW.duration_sec;
    ELSE
      IF v_last = NEW.local_date THEN
        /* E njëjta ditë: vargu nuk rritet, por seanca numërohet. */
        SET v_next = v_cur;
      ELSEIF v_last = DATE_SUB(NEW.local_date, INTERVAL 1 DAY) THEN
        SET v_next = v_cur + 1;
      ELSE
        SET v_next = 1;
        SET v_start = NEW.local_date;
      END IF;

      UPDATE streaks
         SET current_streak            = v_next,
             best_streak               = GREATEST(best_streak, v_next),
             current_streak_started_on = COALESCE(v_start, NEW.local_date),
             /* `GREATEST` mbron nga një seancë e vjetër e sinkronizuar me
                vonesë: ajo nuk duhet ta tërheqë datën prapa në kohë. */
             last_meditation_date      = GREATEST(last_meditation_date, NEW.local_date),
             total_sessions            = total_sessions + 1,
             total_seconds             = total_seconds + NEW.duration_sec
       WHERE user_id = NEW.user_id;
    END IF;
  END IF;
END$$

-- ---------------------------------------------------------------
--  2. Numëruesi i dëgjimeve
-- ---------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_session_plays$$
CREATE TRIGGER trg_session_plays
AFTER INSERT ON meditation_sessions
FOR EACH ROW
BEGIN
  IF NEW.meditation_id IS NOT NULL THEN
    UPDATE meditations SET play_count = play_count + 1 WHERE id = NEW.meditation_id;
  END IF;
END$$

-- ---------------------------------------------------------------
--  3. Medaljet — bronz/3, argjend/7, ar/21
-- ---------------------------------------------------------------
/*
 * `INSERT IGNORE` mbështetet te çelësi unik
 * (user_id, medal_type, streak_start_date, streak_day): e njëjta arritje nuk
 * shkruhet dy herë, ndërsa një varg i dytë që arrin ditën 3 jep bronzin e vet.
 *
 * Medaljet e fituara MBETEN edhe pasi vargu këputet — asgjë nuk i fshin.
 */
DROP TRIGGER IF EXISTS trg_streak_medals$$
CREATE TRIGGER trg_streak_medals
AFTER UPDATE ON streaks
FOR EACH ROW
BEGIN
  IF NEW.current_streak <> OLD.current_streak AND NEW.current_streak > 0 THEN
    IF NEW.current_streak MOD 3 = 0 THEN
      INSERT IGNORE INTO medals (user_id, medal_type, reason, streak_start_date, streak_day)
      VALUES (NEW.user_id, 'bronze', CONCAT(NEW.current_streak, ' ditë rresht'),
              NEW.current_streak_started_on, NEW.current_streak);
    END IF;
    IF NEW.current_streak MOD 7 = 0 THEN
      INSERT IGNORE INTO medals (user_id, medal_type, reason, streak_start_date, streak_day)
      VALUES (NEW.user_id, 'silver', CONCAT(NEW.current_streak, ' ditë rresht'),
              NEW.current_streak_started_on, NEW.current_streak);
    END IF;
    IF NEW.current_streak MOD 21 = 0 THEN
      INSERT IGNORE INTO medals (user_id, medal_type, reason, streak_start_date, streak_day)
      VALUES (NEW.user_id, 'gold', CONCAT(NEW.current_streak, ' ditë rresht'),
              NEW.current_streak_started_on, NEW.current_streak);
    END IF;
  END IF;
END$$

/* I njëjti rregull kur rreshti i streak-ut krijohet për herë të parë. */
DROP TRIGGER IF EXISTS trg_streak_medals_ins$$
CREATE TRIGGER trg_streak_medals_ins
AFTER INSERT ON streaks
FOR EACH ROW
BEGIN
  IF NEW.current_streak > 0 AND NEW.current_streak MOD 3 = 0 THEN
    INSERT IGNORE INTO medals (user_id, medal_type, reason, streak_start_date, streak_day)
    VALUES (NEW.user_id, 'bronze', CONCAT(NEW.current_streak, ' ditë rresht'),
            NEW.current_streak_started_on, NEW.current_streak);
  END IF;
END$$

-- ---------------------------------------------------------------
--  4. Mesatarja e vlerësimeve
-- ---------------------------------------------------------------
/*
 * Rillogaritet me `AVG`, jo me shtim/zbritje.
 *
 * Mbajtja e mesatares me hapa duket më e lirë, por çdo gabim — një fshirje
 * kaskadë, një transaksion i ndërprerë — e lë numrin përgjithmonë të gabuar
 * dhe pa asnjë rrugë për ta vënë re.
 */
DROP TRIGGER IF EXISTS trg_rating_ins$$
CREATE TRIGGER trg_rating_ins
AFTER INSERT ON meditation_ratings
FOR EACH ROW
BEGIN
  UPDATE meditations
     SET average_rating = COALESCE((SELECT ROUND(AVG(rating), 2)
                                      FROM meditation_ratings
                                     WHERE meditation_id = NEW.meditation_id), 0),
         rating_count   = (SELECT COUNT(*) FROM meditation_ratings
                            WHERE meditation_id = NEW.meditation_id)
   WHERE id = NEW.meditation_id;
END$$

DROP TRIGGER IF EXISTS trg_rating_upd$$
CREATE TRIGGER trg_rating_upd
AFTER UPDATE ON meditation_ratings
FOR EACH ROW
BEGIN
  UPDATE meditations
     SET average_rating = COALESCE((SELECT ROUND(AVG(rating), 2)
                                      FROM meditation_ratings
                                     WHERE meditation_id = NEW.meditation_id), 0),
         rating_count   = (SELECT COUNT(*) FROM meditation_ratings
                            WHERE meditation_id = NEW.meditation_id)
   WHERE id = NEW.meditation_id;
END$$

DROP TRIGGER IF EXISTS trg_rating_del$$
CREATE TRIGGER trg_rating_del
AFTER DELETE ON meditation_ratings
FOR EACH ROW
BEGIN
  UPDATE meditations
     SET average_rating = COALESCE((SELECT ROUND(AVG(rating), 2)
                                      FROM meditation_ratings
                                     WHERE meditation_id = OLD.meditation_id), 0),
         rating_count   = (SELECT COUNT(*) FROM meditation_ratings
                            WHERE meditation_id = OLD.meditation_id)
   WHERE id = OLD.meditation_id;
END$$

-- ---------------------------------------------------------------
--  5. Numëruesit e postimeve
-- ---------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_reaction_ins$$
CREATE TRIGGER trg_reaction_ins
AFTER INSERT ON post_reactions
FOR EACH ROW
BEGIN
  UPDATE community_posts
     SET reaction_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = NEW.post_id)
   WHERE id = NEW.post_id;
END$$

DROP TRIGGER IF EXISTS trg_reaction_del$$
CREATE TRIGGER trg_reaction_del
AFTER DELETE ON post_reactions
FOR EACH ROW
BEGIN
  UPDATE community_posts
     SET reaction_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = OLD.post_id)
   WHERE id = OLD.post_id;
END$$

DROP TRIGGER IF EXISTS trg_comment_ins$$
CREATE TRIGGER trg_comment_ins
AFTER INSERT ON post_comments
FOR EACH ROW
BEGIN
  UPDATE community_posts
     SET comment_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = NEW.post_id)
   WHERE id = NEW.post_id;
END$$

DROP TRIGGER IF EXISTS trg_comment_del$$
CREATE TRIGGER trg_comment_del
AFTER DELETE ON post_comments
FOR EACH ROW
BEGIN
  UPDATE community_posts
     SET comment_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = OLD.post_id)
   WHERE id = OLD.post_id;
END$$

-- ---------------------------------------------------------------
--  6. Kohëzgjatja e seancave të krijuara
-- ---------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_step_ins$$
CREATE TRIGGER trg_step_ins
AFTER INSERT ON creation_steps
FOR EACH ROW
BEGIN
  UPDATE creations
     SET total_duration_sec = COALESCE((
           SELECT SUM(m.duration_sec)
             FROM creation_steps s
             JOIN meditations m ON m.id = s.meditation_id
            WHERE s.creation_id = NEW.creation_id), 0)
   WHERE id = NEW.creation_id;
END$$

DROP TRIGGER IF EXISTS trg_step_del$$
CREATE TRIGGER trg_step_del
AFTER DELETE ON creation_steps
FOR EACH ROW
BEGIN
  UPDATE creations
     SET total_duration_sec = COALESCE((
           SELECT SUM(m.duration_sec)
             FROM creation_steps s
             JOIN meditations m ON m.id = s.meditation_id
            WHERE s.creation_id = OLD.creation_id), 0)
   WHERE id = OLD.creation_id;
END$$

-- ---------------------------------------------------------------
--  7. Ditët e kryera të programit
-- ---------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_day_done_ins$$
CREATE TRIGGER trg_day_done_ins
AFTER INSERT ON user_program_day_completions
FOR EACH ROW
BEGIN
  UPDATE user_program_progress
     SET total_days_completed = (SELECT COUNT(*)
                                   FROM user_program_day_completions
                                  WHERE user_id = NEW.user_id
                                    AND program_id = NEW.program_id),
         last_activity_at = CURRENT_TIMESTAMP
   WHERE user_id = NEW.user_id AND program_id = NEW.program_id;
END$$

DROP TRIGGER IF EXISTS trg_day_done_del$$
CREATE TRIGGER trg_day_done_del
AFTER DELETE ON user_program_day_completions
FOR EACH ROW
BEGIN
  UPDATE user_program_progress
     SET total_days_completed = (SELECT COUNT(*)
                                   FROM user_program_day_completions
                                  WHERE user_id = OLD.user_id
                                    AND program_id = OLD.program_id)
   WHERE user_id = OLD.user_id AND program_id = OLD.program_id;
END$$

-- ---------------------------------------------------------------
--  8. Rreshtat shoqërues pas regjistrimit
-- ---------------------------------------------------------------
/*
 * Te Supabase këtë e bënte trigger-i mbi `auth.users`. Këtu regjistrimin e bën
 * API-ja, ndaj trigger-i qëndron mbi `users` — kështu asnjë pjesë e kodit nuk
 * mund të harrojë të krijojë streak-un ose kujtesat.
 */
DROP TRIGGER IF EXISTS trg_user_created$$
CREATE TRIGGER trg_user_created
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT IGNORE INTO streaks (user_id) VALUES (NEW.id);

  INSERT IGNORE INTO reminders (user_id, reminder_type, time_of_day, is_enabled)
  VALUES (NEW.id, 'morning', '07:30:00', 0),
         (NEW.id, 'midday',  '13:00:00', 0),
         (NEW.id, 'evening', '21:00:00', 0);
END$$

DELIMITER ;
