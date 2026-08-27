-- ═══════════════════════════════════════════════════════════════
--  TË DHËNAT FILLESTARE
-- ═══════════════════════════════════════════════════════════════
--
-- Emrat dhe rendi janë TË NJËJTËT me `src/data/techniques.js` dhe
-- `src/data/categories.js` të prototipit — kështu importi i 244 meditimeve
-- mund të bëhet duke i lidhur me slug, pa përkthim ndërmjetës.
--
-- `on conflict do nothing` e bën këtë skedar të sigurt për t'u ri-ekzekutuar.

-- ---------------------------------------------------------------
--  14 teknikat ("SI bëhet")
-- ---------------------------------------------------------------
-- Numrat në koment janë ata të specifikimit; shërbejnë për të verifikuar
-- importin (`select count(*) ... group by technique_id`), jo si kolonë:
-- një numër i ruajtur do të dilte i gabuar sapo të shtohej një meditim.
insert into public.techniques (slug, name, icon_name, display_order) values
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
  ('afirmime',              'Afirmime',              'quote',      14)   -- 14
on conflict (slug) do nothing;

-- ---------------------------------------------------------------
--  Kategoritë ("PËR ÇFARË qëllimi")
-- ---------------------------------------------------------------
/*
 * ⚠️  JANË 28, JO 27.
 *
 * Specifikimi e titullon listën "27 kategoritë" por numëron 28 emra — e njëjta
 * mospërputhje që u shënua edhe te prototipi. Këtu janë të 28-ta, ashtu siç
 * janë shkruar. Nëse njëra duhet hequr, e vendos klienti: fshirja e një
 * kategorie nga kodi pa e ditur cila, do të linte meditime pa etiketë.
 *
 * `is_featured` shënon të dhjetat që shfaqen te "Krijo → Gjenero".
 */
insert into public.categories (slug, name, display_order, is_featured) values
  ('emocionet',      'Emocionet',                                   1,  false),
  ('zemra-plot',     'Zemra plot',                                  2,  false),
  ('vetebesim',      'Vetëbesim',                                   3,  false),
  ('tru-i-fuqizuar', 'Tru i fuqizuar',                              4,  false),
  ('gjumi',          'Gjumi',                                       5,  true),
  ('energji-e-larte','Energji e lartë',                             6,  true),
  ('manifestim',     'Manifestim',                                  7,  false),
  ('stres',          'Stres',                                       8,  false),
  ('ankth-panik',    'Ankth/Panik/Fobi',                            9,  false),
  ('marredheniet',   'Përmirësimi i marrëdhënieve',                10,  false),
  ('varesite',       'Tejkalim i varësive dhe zakoneve të vjetra', 11,  false),
  ('fokus',          'Fokus dhe performancë',                      12,  true),
  ('shendeti',       'Shëndeti',                                   13,  false),
  ('qetesim',        'Qetësim',                                    14,  true),
  ('vetja-e-ardhme', 'Vetja e së ardhmes',                         15,  false),
  ('shero-te-kaluaren','Shëro të kaluarën',                        16,  false),
  ('jeta-ideale',    'Jeta ideale',                                17,  false),
  ('falja',          'Falja',                                      18,  false),
  ('dashuria-vetes', 'Dashuria ndaj vetes',                        19,  true),
  ('intuita',        'Intuita',                                    20,  false),
  ('bolleku',        'Bollëku',                                    21,  true),
  ('situata',        'Për situata të veçanta',                     22,  false),
  ('emergjence',     'Emergjencë',                                 23,  false),
  ('femijet-0-7',    'Fëmijët 0–7',                                24,  false),
  ('femijet-8-12',   'Fëmijët 8–12',                               25,  false),
  ('adoleshentet',   'Adoleshentët',                               26,  false),
  ('mengjes',        'Mëngjes',                                    27,  false),
  ('mbremje',        'Mbrëmje',                                    28,  false)
on conflict (slug) do nothing;

/* Katër kategoritë e mbetura të listës "Krijo → Gjenero" që nuk përkojnë
   një-për-një me emrat e mësipërm — shënohen veçmas. */
update public.categories set is_featured = true
 where slug in ('zemra-plot', 'emocionet', 'varesite', 'vetebesim');

-- ---------------------------------------------------------------
--  Programet
-- ---------------------------------------------------------------
insert into public.programs (slug, title, subtitle, theme, total_days, total_duration_min,
                             cover_color, display_order) values
  ('mistik-zemer', 'MISTIK ZEMËR', 'hapje e zemrës', 'zemra',     7, 28, '#E91E8C', 1),
  ('transformim',  'TRANSFORMIM',  'arketipet',      'arketipet', 21, 84, '#7B2FBE', 2)
on conflict (slug) do nothing;

/* Ditët bosh — meditimet e secilës i cakton admin-i nga paneli. */
insert into public.program_days (program_id, day_number)
select p.id, d
  from public.programs p
  cross join lateral generate_series(1, p.total_days) as d
on conflict (program_id, day_number) do nothing;

-- ---------------------------------------------------------------
--  Citatet e ditës
-- ---------------------------------------------------------------
insert into public.daily_quotes (text, category) values
  ('Çdo mëngjes je një version i ri i vetes.',        'mengjes'),
  ('Fryma e parë e ditës është një dhuratë.',         'mengjes'),
  ('Si e nis mëngjesin, ashtu e formon ditën.',       'mengjes'),
  ('Ndalo. Merr frymë. Rikthehu te qendra.',          'dreke'),
  ('Qetësia mes zhurmës është fuqi.',                 'dreke'),
  ('Një pauzë e vetëdijshme rikthen energjinë.',      'dreke'),
  ('Lëre ditën të shkojë butësisht.',                 'mbremje'),
  ('Mbrëmja është koha për të çliruar.',              'mbremje'),
  ('Mirënjohja e mbyll ditën me paqe.',               'mbremje'),
  ('Gjumi është meditimi më i thellë.',               'nate'),
  ('Lëre trupin të prehet, mendjen të qetësohet.',    'nate'),
  ('Nata sjell rilindjen e mëngjesit.',               'nate')
on conflict do nothing;

-- ---------------------------------------------------------------
--  Ritualet e mëngjesit
-- ---------------------------------------------------------------
insert into public.morning_rituals (title, description, cover_color) values
  ('Nis ditën me qartësi dhe qëllim', 'Rituali i mëngjesit — energji dhe fokus', '#E07A3C'),
  ('Një moment qetësie në mes të ditës', 'Pauzë koherence', '#3C7AE0'),
  ('Lëre ditën dhe kthehu te vetja', 'Çlodhje e mbrëmjes', '#7C5CE0')
on conflict do nothing;

-- ---------------------------------------------------------------
--  Tingujt
-- ---------------------------------------------------------------
insert into public.sounds (name, category, display_order) values
  ('Solfeggio 349Hz', 'focus',  1),
  ('Solfeggio 528Hz', 'relax',  2),
  ('Theta',           'sleep',  3),
  ('Alpha',           'focus',  4)
on conflict do nothing;
