-- ═══════════════════════════════════════════════════════════════
--  16 · SESIONET LIVE (Zoom)
-- ═══════════════════════════════════════════════════════════════
--
--  Deri tani sesionet live jetonin te `data/catalog.js` dhe te `localStorage`
--  i admin-it. Pra kur admini planifikonte një sesion, e shihte VETËM
--  shfletuesi i tij: asnjë përdorues nuk merrte vesh gjë, dhe butoni
--  "Bashkohu tani" nuk çonte askund.
--
--  Këtu ato marrin një vend të përbashkët, dhe bashkë me to linkun e takimit.
--
--  ⚠️  `join_url` NUK kthehet publikisht kur `is_live = 0`.
--      Rruga publike e jep vetëm kur sesioni është ndezur nga admini — shih
--      `api/src/routes/live.js`. Një link takimi i dukshëm ditë më parë është
--      një dhomë e hapur për këdo që e gjen adresën.
--
--  SI RRJEDHET: phpMyAdmin → databaza → Import → ky skedar → Go.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS live_sessions (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  emoji         VARCHAR(8)   NOT NULL DEFAULT '🧘',
  title         VARCHAR(160) NOT NULL,
  subtitle      VARCHAR(400) NULL,
  /* Teksti i lirë i orarit: "E mërkurë dhe e premte · 19:00". Jo DATETIME —
     këto sesione përsëriten javë pas jave, dhe një datë e vetme do të ishte
     e gabuar që të nesërmen. */
  schedule_text VARCHAR(160) NULL,
  /* Linku i takimit (Zoom, Meet, çfarëdo https). */
  join_url      VARCHAR(600) NULL,
  is_live       TINYINT(1)   NOT NULL DEFAULT 0,
  display_order INT          NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_live_rendi (display_order, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*
 * Tri kartelat që aplikacioni tregonte tashmë, tani si rreshta të vërtetë.
 *
 * `WHERE NOT EXISTS` mbi titullin: skedari mund të rrjedhë dy herë pa krijuar
 * dublikatë, dhe pa i fshirë linqet që admini ka vendosur ndërkohë.
 */
INSERT INTO live_sessions (emoji, title, subtitle, schedule_text, display_order)
SELECT '🧘', 'Meditime Live', 'Sesione të udhëhequra nga Dr. Artemisa në kohë reale', 'Tani', 1
  FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM live_sessions WHERE title = 'Meditime Live');

INSERT INTO live_sessions (emoji, title, subtitle, schedule_text, display_order)
SELECT '💡', 'Mësime dhe praktika live', 'Me interaksion të drejtpërdrejtë — pyet dhe praktiko bashkë',
       'E mërkurë dhe e premte · 19:00', 2
  FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM live_sessions WHERE title = 'Mësime dhe praktika live');

INSERT INTO live_sessions (emoji, title, subtitle, schedule_text, display_order)
SELECT '🎯', 'Pyetje & Përgjigje', 'Pyetje dhe përgjigje live — merr ndihmë direkt',
       'E mërkurë dhe e premte · 20:00', 3
  FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM live_sessions WHERE title = 'Pyetje & Përgjigje');
