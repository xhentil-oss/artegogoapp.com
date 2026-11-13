-- 79 — "Tërhiq shpirtin binjak": përshkrimi dhe përfitimet
--
-- Teksti i dhënë nga klientja më 13 nëntor 2026. Zëvendëson përshkrimin e
-- shkurtër prej dy rreshtash që ishte aty, dhe mbush për herë të parë
-- `benefits` për këtë meditim.
--
-- Deri tani ky ekran tregonte tri përfitime të gjeneruara nga qëllimi i
-- meditimit (`domain/benefits.js`) — "Ndjesi bollëku dhe mirënjohjeje" e
-- të tjera, që janë të përgjithshme dhe flasin për bollëkun, jo për
-- dashurinë. Sapo kolona mbushet, aplikacioni e përdor tekstin e vërtetë
-- dhe lë mënjanë hartën e ngurtë; shih `MeditationSheet.jsx`.
--
-- Rreshti i fundit i përfitimeve mbërriti i prerë — "besimi në dashur" —
-- dhe u plotësua "dashuri".
--
-- Paragrafët ndahen me rresht bosh (`\n\n`), përfitimet me një kthim
-- rreshti (`\n`). Vetëm SQL: kolona dhe kodi që e shfaq janë prej kohësh
-- te prodhimi.

SET NAMES utf8mb4;

UPDATE meditations
   SET description = CONCAT(
         'Hap zemrën ndaj dashurisë së vërtetë dhe përgatite veten për të krijuar ',
         'një marrëdhënie të thellë, të bukur dhe harmonike.',
         '\n\n',
         'Përmes këtij meditimi do të lëshosh frikën, zhgënjimet dhe besimet ',
         'kufizuese që ke krijuar nga përvojat e së shkuarës në dashuri.',
         '\n\n',
         'Do të lidhesh me ndjenjën e të qenit i dashur, i vlerësuar dhe i pranuar ',
         'plotësisht, duke vizualizuar një marrëdhënie ku përjeton siguri, afërsi, ',
         'pasion dhe dashuri të ndërsjellë.',
         '\n\n',
         'Në vend që ta kërkosh dashurinë nga ndjenja e mungesës, do të fillosh ta ',
         'kultivosh atë brenda vetes, duke u hapur ndaj mundësisë për të takuar një ',
         'partner që përputhet me vlerat, dëshirat dhe energjinë tënde.'
       ),
       benefits = CONCAT(
         'Hapje të zemrës ndaj dashurisë',                  '\n',
         'Çlirim nga frika dhe zhgënjimet e së shkuarës',    '\n',
         'Ndjenjë plotësie, vetëvlerësimi dhe besimi në dashuri'
       )
 WHERE id = '5ecaef91-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".

-- Kontroll: një rresht. Te phpMyAdmin shtyp "T" mbi qelizë për ta parë të plotë.
SELECT id, title, description, benefits
  FROM meditations
 WHERE id = '5ecaef91-a510-11f1-b99e-107c614af9b1';
