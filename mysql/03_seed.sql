-- ═══════════════════════════════════════════════════════════════
--  TË DHËNAT FILLESTARE
-- ═══════════════════════════════════════════════════════════════
--
--  I sigurt për t'u ri-ekzekutuar: `INSERT IGNORE` mbështetet te çelësat unikë.
--  Ngarkohet i fundit, pas skemës dhe triggerave.

SET NAMES utf8mb4;

-- ---------------------------------------------------------------
--  14 teknikat ("SI bëhet")
-- ---------------------------------------------------------------
-- Numrat në koment janë ata të specifikimit — shërbejnë për ta verifikuar
-- importin, jo si kolonë: një numër i ruajtur del i gabuar sapo shtohet një
-- meditim i ri.
INSERT IGNORE INTO techniques (slug, name, icon_name, display_order) VALUES
  ('meditime-per-trupin',   'Meditime për Trupin',   'activity',    1),  -- 16
  ('meditime-per-zemren',   'Meditime për Zemrën',   'heart',       2),  -- 25
  ('meditime-per-trurin',   'Meditime për Trurin',   'brain',       3),  -- 20
  ('meditim-ne-ecje',       'Meditim në ecje',       'footprints',  4),  --  4
  ('meditime-manifestimi',  'Meditime manifestimi',  'sparkles',    5),  --  7
  ('meditime-riprogramimi', 'Meditime riprogramimi', 'refresh-cw',  6),  -- 21
  ('rigjenerim-dhe-sherim', 'Rigjenerim dhe shërim', 'heart-pulse', 7),  -- 25
  ('frymemarrje',           'Frymëmarrje',           'wind',        8),  -- 36
  ('eft-tapping',           'EFT / Tapping',         'hand',        9),  -- 29
  ('teknika-somatike',      'Teknika Somatike',      'waves',      10),  -- 11
  ('teknika-energjetike',   'Teknika Energjetike',   'zap',        11),  -- 14
  ('hipnoterapi',           'Hipnoterapi',           'moon',       12),  --  8
  ('vizualizim',            'Vizualizim',            'eye',        13),  -- 10
  ('afirmime',              'Afirmime',              'quote',      14);  -- 14

-- ---------------------------------------------------------------
--  Kategoritë ("PËR ÇFARË qëllimi")
-- ---------------------------------------------------------------
/*
 * ⚠️  JANË 28, JO 27.
 *
 * Specifikimi e titullon listën "27 kategoritë" por numëron 28 emra — e njëjta
 * mospërputhje si te prototipi. Janë futur të 28-ta, ashtu siç janë shkruar.
 * Nëse njëra duhet hequr, e vendos klientja: fshirja e një kategorie pa e
 * ditur cila do të linte meditime pa etiketë.
 */
INSERT IGNORE INTO categories (slug, name, display_order, is_featured) VALUES
  ('emocionet',        'Emocionet',                                   1, 1),
  ('zemra-plot',       'Zemra plot',                                  2, 1),
  ('vetebesim',        'Vetëbesim',                                   3, 1),
  ('tru-i-fuqizuar',   'Tru i fuqizuar',                              4, 0),
  ('gjumi',            'Gjumi',                                       5, 1),
  ('energji-e-larte',  'Energji e lartë',                             6, 1),
  ('manifestim',       'Manifestim',                                  7, 0),
  ('stres',            'Stres',                                       8, 0),
  ('ankth-panik',      'Ankth/Panik/Fobi',                            9, 0),
  ('marredheniet',     'Përmirësimi i marrëdhënieve',                10, 0),
  ('varesite',         'Tejkalim i varësive dhe zakoneve të vjetra', 11, 1),
  ('fokus',            'Fokus dhe performancë',                      12, 1),
  ('shendeti',         'Shëndeti',                                   13, 0),
  ('qetesim',          'Qetësim',                                    14, 1),
  ('vetja-e-ardhme',   'Vetja e së ardhmes',                         15, 0),
  ('shero-te-kaluaren','Shëro të kaluarën',                          16, 0),
  ('jeta-ideale',      'Jeta ideale',                                17, 0),
  ('falja',            'Falja',                                      18, 0),
  ('dashuria-vetes',   'Dashuria ndaj vetes',                        19, 1),
  ('intuita',          'Intuita',                                    20, 0),
  ('bolleku',          'Bollëku',                                    21, 1),
  ('situata',          'Për situata të veçanta',                     22, 0),
  ('emergjence',       'Emergjencë',                                 23, 0),
  ('femijet-0-7',      'Fëmijët 0–7',                                24, 0),
  ('femijet-8-12',     'Fëmijët 8–12',                               25, 0),
  ('adoleshentet',     'Adoleshentët',                               26, 0),
  ('mengjes',          'Mëngjes',                                    27, 0),
  ('mbremje',          'Mbrëmje',                                    28, 0);

-- ---------------------------------------------------------------
--  Programet
-- ---------------------------------------------------------------
INSERT IGNORE INTO programs
  (slug, title, subtitle, theme, total_days, total_duration_min, cover_color, display_order)
VALUES
  ('mistik-zemer', 'MISTIK ZEMËR', 'hapje e zemrës', 'zemra',      7, 28, '#E91E8C', 1),
  ('transformim',  'TRANSFORMIM',  'arketipet',      'arketipet', 21, 84, '#7B2FBE', 2);

/*
 * Ditët bosh të programeve.
 *
 * MySQL nuk ka `generate_series`. Përdoret një tabelë e përkohshme numrash —
 * mënyra e zakonshme, dhe e sigurt edhe në MariaDB të vjetër, ku CTE-të
 * rekursive mund të mos jenë të disponueshme.
 */
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
  JOIN tmp_numbers n ON n.n <= p.total_days;

DROP TEMPORARY TABLE IF EXISTS tmp_numbers;

-- ---------------------------------------------------------------
--  Citatet e ditës
-- ---------------------------------------------------------------
INSERT INTO daily_quotes (text, category) VALUES
  ('Çdo mëngjes je një version i ri i vetes.',     'mengjes'),
  ('Fryma e parë e ditës është një dhuratë.',      'mengjes'),
  ('Si e nis mëngjesin, ashtu e formon ditën.',    'mengjes'),
  ('Ndalo. Merr frymë. Rikthehu te qendra.',       'dreke'),
  ('Qetësia mes zhurmës është fuqi.',              'dreke'),
  ('Një pauzë e vetëdijshme rikthen energjinë.',   'dreke'),
  ('Lëre ditën të shkojë butësisht.',              'mbremje'),
  ('Mbrëmja është koha për të çliruar.',           'mbremje'),
  ('Mirënjohja e mbyll ditën me paqe.',            'mbremje'),
  ('Gjumi është meditimi më i thellë.',            'nate'),
  ('Lëre trupin të prehet, mendjen të qetësohet.', 'nate'),
  ('Nata sjell rilindjen e mëngjesit.',            'nate');

-- ---------------------------------------------------------------
--  Ritualet e mëngjesit
-- ---------------------------------------------------------------
INSERT INTO morning_rituals (title, description, cover_color) VALUES
  ('Nis ditën me qartësi dhe qëllim',    'Rituali i mëngjesit — energji dhe fokus', '#E07A3C'),
  ('Një moment qetësie në mes të ditës', 'Pauzë koherence',                          '#3C7AE0'),
  ('Lëre ditën dhe kthehu te vetja',     'Çlodhje e mbrëmjes',                       '#7C5CE0');

-- ---------------------------------------------------------------
--  Tingujt
-- ---------------------------------------------------------------
INSERT INTO sounds (name, category, display_order) VALUES
  ('Solfeggio 349Hz', 'focus', 1),
  ('Solfeggio 528Hz', 'relax', 2),
  ('Theta',           'sleep', 3),
  ('Alpha',           'focus', 4);
