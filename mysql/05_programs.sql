-- ═══════════════════════════════════════════════════════════════
--  DY PROGRAMET QË MUNGONIN
--
--  `03_seed.sql` futi vetëm dy (MISTIK ZEMËR, TRANSFORMIM), ndërsa
--  aplikacioni tregonte katër. Pa këta dy, lidhja e programeve me serverin do
--  ta zvogëlonte listën nga katër në dy — pra do të dukej si humbje
--  përmbajtjeje, jo si lidhje.
--
--  I sigurt për t'u ri-ekzekutuar: `INSERT IGNORE` mbi `slug`, që është unik.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

INSERT IGNORE INTO programs
  (slug, title, subtitle, theme, total_days, total_duration_min, cover_color, display_order)
VALUES
  ('gjume-i-qete', 'GJUMË I QETË', 'ritual nate',  'gjumi',   10, 40, '#2F4FA8', 3),
  ('bolleku',      'BOLLËK',       'manifestim',   'bolleku', 14, 56, '#C9962F', 4);

-- Ditët bosh — e njëjta mënyrë si te `03_seed.sql`: MySQL nuk ka
-- `generate_series`, ndaj përdoret një tabelë e përkohshme numrash.
DROP TEMPORARY TABLE IF EXISTS tmp_numbers;
CREATE TEMPORARY TABLE tmp_numbers (n INT PRIMARY KEY);
INSERT INTO tmp_numbers (n) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
  (11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
  (21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
  (31),(32),(33),(34),(35),(36),(37),(38),(39),(40);

INSERT IGNORE INTO program_days (program_id, day_number)
SELECT p.id, n.n
  FROM programs p
  JOIN tmp_numbers n ON n.n <= p.total_days
 WHERE p.slug IN ('gjume-i-qete', 'bolleku');

DROP TEMPORARY TABLE IF EXISTS tmp_numbers;

-- Kontroll: duhet të kthejë 4 programe, me 7 + 21 + 10 + 14 = 52 ditë.
SELECT (SELECT COUNT(*) FROM programs)     AS programe,
       (SELECT COUNT(*) FROM program_days) AS dite;
