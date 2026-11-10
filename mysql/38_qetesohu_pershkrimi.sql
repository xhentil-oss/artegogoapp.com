-- ═══════════════════════════════════════════════════════════════
--  QETËSOHU PAS NJË KONFLIKTI — përshkrimi dhe përfitimet
-- ═══════════════════════════════════════════════════════════════
--
--  Teksti i dhënë nga klientja më 10 nëntor 2026.
--
--  Përshkrimi i mëparshëm fliste për një praktikë familjare — "të gjithë ulen,
--  dëgjojnë të njëjtin zë" — pra për një ushtrim në grup, jo për qetësimin pas
--  një konflikti. Ishte trashëgim nga "Meditime familjare", emri që ky rresht
--  mbante para `27_qetesohu_pas_konflikti.sql`.
--
--  I dyti pas `37_falenderim_pershkrimi.sql`. Kolona `benefits` ekziston që
--  nga `36_perfitimet.sql`, ndaj këtu nuk duhet asnjë ndryshim strukture —
--  as ngarkim kodi, as rindezje serveri. Vetëm ky urdhër.
--
--  Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me kthim rreshti
--  të vetëm (`\n`).

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Liro emocionet e vështira që kanë lindur pas një konflikti dhe rikthehu në ',
         'gjendjen tënde të natyrshme të qetësisë, dashurisë dhe paqes së brendshme.',
         '\n\n',
         'Përmes këtij meditimi do të qetësosh sistemin nervor, do të çlirosh tensionin ',
         'emocional dhe do të krijosh hapësirë për t’i parë situatat nga një këndvështrim ',
         'i ri, pa gjykim dhe pa nevojën për të fajësuar veten apo të tjerët.',
         '\n\n',
         'Do të lidhesh përsëri me zemrën, duke zëvendësuar zemërimin dhe lëndimin me ',
         'pranim, mirëkuptim dhe dashuri.'
       ),
       benefits = CONCAT(
         'Çlirim të tensionit dhe ngarkesës emocionale',                  '\n',
         'Qetësi, pranim dhe paqe të brendshme',                          '\n',
         'Më shumë dashuri dhe mirëkuptim ndaj vetes dhe të tjerëve'
       )
 WHERE id = '5ed099cc-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ed099cc-a510-11f1-b99e-107c614af9b1';
