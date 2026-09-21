-- ═══════════════════════════════════════════════════════════════
--  POOL-I I MËNGJESIT — mbushja që mungoi
-- ═══════════════════════════════════════════════════════════════
--
--  Gjendja e gjetur më 21 shtator 2026, e pyetur drejtpërdrejt te serveri:
--
--      morning  0        ← asnjë njoftim mëngjesi nuk mund të dërgohej
--      noon    39
--      evening 39
--
--  ⚠️  SHKAKU, që të mos përsëritet: `08_pools.sql` i zgjedh meditimet me
--      DY kushte njëherësh — teknika DHE nën-grupi:
--
--          JOIN meditations m ON m.technique_id = t.id AND m.subgroup = …
--
--      Çiftet e mëngjesit ('meditime-per-trupin' + 'Mëngjes', …) nuk
--      përputhen më, sepse klasifikimi ka ndryshuar që atëherë nga paneli i
--      admin-it. Dreka dhe darka mbetën me çifte që rastësisht qëndruan.
--      Pra pool-i i mëngjesit nuk u zbraz kurrë — nuk u mbush asnjëherë.
--
--      Këtu zgjedhja bëhet VETËM sipas nën-grupit. Nën-grupi është ajo që
--      përcakton përmbajtjen ("Energjia" është energji pavarësisht se me cilën
--      teknikë praktikohet), ndaj një riklasifikim i ardhshëm nuk e zbraz
--      sërish pool-in.
--
--  I sigurt të rrjedhë sa herë të duash: `INSERT IGNORE` mbi çelësin primar
--  (slot, meditation_id) nuk dyfishon, dhe asgjë ekzistuese nuk fshihet.

INSERT IGNORE INTO notification_pools (slot, meditation_id)
SELECT 'morning', m.id
  FROM meditations m
 WHERE m.is_block = 0
   AND m.published_at IS NOT NULL
   AND m.subgroup IN (
         'Mëngjes',
         'Energjia',
         'Vetëbesimi',
         'Aktivizim',
         'Zhvillim personal',
         'Jeta ideale'
       );

-- Kontroll: të tre pool-et duhet të kenë përmbajtje.
SELECT slot, COUNT(*) AS meditime FROM notification_pools GROUP BY slot;
