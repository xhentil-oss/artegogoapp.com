-- ═══════════════════════════════════════════════════════════════
--  DY PRAKTIKA TË REJA — Këngë motivuese dhe Muzikë meditimi
-- ═══════════════════════════════════════════════════════════════
--
--  Kërkesë e klientes (8 tetor 2026): te "Eksploro praktikat" shtohen dy
--  praktika të reja, pas Vizualizimit dhe Afirmimeve.
--
--  Slug-ët duhet të jenë SAKTËSISHT këta: aplikacioni i njeh me ta
--  (`src/services/taxonomy.js` → `kenge-motivuese` dhe `muzike-meditimi`).
--  Një shkronjë ndryshe dhe meditimet do të mbeteshin pa praktikë — pa asnjë
--  gabim të dukshëm, thjesht nuk do të shfaqeshin askund.
--
--  ⚠️  PLLAKAT NUK DALIN DERISA TË KENË PËRMBAJTJE. Aplikacioni i fsheh
--      praktikat bosh me qëllim; një pllakë që hap një folder të zbrazët është
--      më keq se asnjë pllakë. Sapo meditimi i parë të marrë njërin nga këta
--      dy slug-ë, praktika shfaqet vetvetiu — pa ndryshim kodi, pa ngarkim.
--
--  Shembull për kur të vijë audioja (NUK ekzekutohet këtu — vetëm model):
--      UPDATE meditations
--         SET technique_id = (SELECT id FROM techniques WHERE slug = 'muzike-meditimi')
--       WHERE id IN ('…');
--
--  I sigurt të rrjedhë dy herë: `INSERT IGNORE` mbi çelësin unik të slug-ut.

INSERT IGNORE INTO techniques (slug, name, icon_name, display_order) VALUES
  ('kenge-motivuese', 'Këngë motivuese', 'music',      15),
  ('muzike-meditimi', 'Muzikë meditimi', 'headphones', 16);

-- Kontroll: të dyja duhet të jenë në listë.
SELECT slug, name, display_order
  FROM techniques
 WHERE slug IN ('kenge-motivuese', 'muzike-meditimi');
