-- 88 — "Liro stresin": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026.
--
-- Ky rresht i kishte të dyja kolonat bosh. Ajo që dukej te ekrani —
-- "Liro stresin — praktikë e udhëhequr nga Arte Gogo." — ndërtohej nga
-- titulli dhe narratori, dhe dy përfitimet vinin nga qëllimi "Qetësim".
--
-- ⚠️  Te tabela ka edhe "Frymëmarrje ritmike 4x6 për lirim nga stresi"
--     (62 s), praktikë tjetër. Ky urdhër prek vetëm "Liro stresin" (407 s).
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Lësho tensionin e grumbulluar në trup dhe mendje dhe rikthehu në gjendjen ',
         'tënde natyrale të qetësisë, ekuilibrit dhe paqes së brendshme.',
         '\n\n',
         'Përmes këtij meditimi do të përdorësh teknika të frymëmarrjes dhe ',
         'relaksimit të thellë për të qetësuar sistemin nervor dhe për të reduktuar ',
         'reagimin e trupit ndaj stresit.',
         '\n\n',
         'Do të lejosh që mendimet të qetësohen, muskujt të relaksohen dhe emocionet ',
         'e grumbulluara gjatë ditës të fillojnë të çlirohen.',
         '\n\n',
         'Ndërsa trupi del gradualisht nga gjendja e alarmit, do të ndjesh më shumë ',
         'lehtësi, qartësi mendore dhe lidhje me veten.'
       ),
       benefits = CONCAT(
         'Qetësim të sistemit nervor dhe reduktim të stresit',  '\n',
         'Çlirim të tensionit fizik dhe emocional',              '\n',
         'Relaksim të thellë dhe paqe të brendshme'
       )
 WHERE id = '5ec896d7-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ec896d7-a510-11f1-b99e-107c614af9b1';
