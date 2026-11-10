-- ═══════════════════════════════════════════════════════════════
--  MEDITIM PËR TË NDIER FALENDERIM — përshkrimi dhe përfitimet
-- ═══════════════════════════════════════════════════════════════
--
--  Teksti i dhënë nga klientja më 10 nëntor 2026. Zëvendëson përshkrimin e
--  mëparshëm, që ishte i trashëguar nga meditimi "Ndjehu i lehtë" dhe fliste
--  për nofullat e legenin — pra për një praktikë tjetër.
--
--  ⚠️  EKZEKUTOHET PAS `36_perfitimet.sql`. Pa atë, kolona `benefits` nuk
--      ekziston dhe ky urdhër kthen `#1054 Unknown column`.
--
--  Paragrafët ndahen me një rresht bosh (`\n\n`), përfitimet me një kthim
--  rreshti të vetëm (`\n`). Aplikacioni i lexon pikërisht ashtu.
--
--  ⚠️  Pas këtij ndryshimi duhet ngarkuar edhe kodi: `api/src/routes/content.js`
--      (që ta kthejë kolonën) dhe paketa e faqes (që ta shfaqë). Vetëm SQL-ja
--      nuk mjafton — teksti do të rrinte te databaza pa u parë nga askush.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Zgjo brenda vetes një nga emocionet më të bukura dhe transformuese: falënderimin.',
         '\n\n',
         'Përmes këtij meditimi do ta zhvendosësh vëmendjen nga ajo që të mungon drejt ',
         'gjithçkaje të bukur që ekziston tashmë në jetën tënde.',
         '\n\n',
         'Do të lidhesh me zemrën, do të kujtosh bekimet e vogla dhe të mëdha të jetës ',
         'dhe do të lejosh që ndjenja e falënderimit të përhapet në gjithë qenien tënde.',
         '\n\n',
         'Sa më shumë e kultivon këtë ndjenjë, aq më shumë fillon të vësh re bukurinë, ',
         'mundësitë dhe bollëkun që të rrethon.'
       ),
       benefits = CONCAT(
         'Hapje të zemrës dhe falënderim të thellë', '\n',
         'Ndjenja dashurie, plotësie dhe paqeje',     '\n',
         'Më shumë pozitivitet dhe vlerësim për jetën'
       )
 WHERE id = '5ecaeefc-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecaeefc-a510-11f1-b99e-107c614af9b1';
