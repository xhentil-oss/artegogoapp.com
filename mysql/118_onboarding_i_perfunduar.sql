-- ═══════════════════════════════════════════════════════════════
--  ONBOARDING-U I PËRFUNDUAR — SHËNIMI I LLOGARIVE EKZISTUESE
--
--  Deri më 17 nëntor 2026 aplikacioni nuk e shkruante kurrë
--  `users.onboarding_completed`: profili (emri dhe kujtesat) rrinte vetëm te
--  pajisja. Prandaj kolona është 0 për KËDO, edhe për ata që e kanë kaluar
--  onboarding-un prej muajsh.
--
--  Tani hyrja e lexon atë flamur për të vendosur nëse të tregojë "Mirë se
--  erdhe". Pa këtë mbushje, çdo përdorues ekzistues do ta shihte atë ekran
--  edhe një herë të vetme — pikërisht gabimi që po ndreqim.
--
--  ⚠️  NUK SHËNOHEN TË GJITHË. Një llogari e hapur dje dhe e braktisur nuk e
--      ka kaluar onboarding-un; po ta shënonim, personi do të hynte pa dhënë
--      kurrë emrin dhe pa zgjedhur asnjë kujtesë. Shënohen vetëm ata që kanë
--      lënë gjurmë përdorimi.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

UPDATE users u
   SET u.onboarding_completed = 1
 WHERE u.onboarding_completed = 0
   AND (
     /* ka dëgjuar të paktën një meditim */
     EXISTS (SELECT 1 FROM meditation_sessions s WHERE s.user_id = u.id)
     /* ose ka ndezur të paktën një kujtesë */
     OR EXISTS (SELECT 1 FROM reminders r WHERE r.user_id = u.id AND r.is_enabled = 1)
     /* ose ka nisur një program */
     OR EXISTS (SELECT 1 FROM user_program_progress p WHERE p.user_id = u.id)
   );

/* Kontrolli: sa u shënuan, sa mbeten. */
SELECT
  (SELECT COUNT(*) FROM users WHERE onboarding_completed = 1) AS me_onboarding,
  (SELECT COUNT(*) FROM users WHERE onboarding_completed = 0) AS pa_onboarding,
  (SELECT COUNT(*) FROM users)                                AS gjithsej;
