-- 77 — Këngët motivuese: çdo skedar merr emrin e këngës së vet
--
-- 13 nëntor 2026. Zëvendëson skriptin 76, që nuk u ekzekutua kurrë.
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  ÇFARË KISHTE NDODHUR
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Shkarkimi i 12 nëntorit mori emrin e një rreshti dhe përmbajtjen e
-- rreshtit të mëparshëm — të 17 herët. Prandaj dolën 17 skedarë për 18
-- tituj: i fundit nuk kishte emër që t'i mbetej.
--
-- Burimi i vërtetë është `Muzika shqip.zip` (18 skedarë, 12 nëntor 14:59).
-- Zhvendosja u provua duke krahasuar MD5-në e çdo skedari të zip-it me atë
-- që serveri jepte: 17 përputhje, të gjitha të zhvendosura me një.
--
-- Dy prova të pavarura e mbështesin:
--   • `Vlera Jote Je Ti.mp3` ishte i vetmi me etiketa ID3 brenda, dhe ato
--     thoshin "Toka do që të dëgjohet" — pikërisht siç tregon zhvendosja.
--   • Te shkarkimi, tre skedarë kishin prapashtesë që s'përputhej me
--     përmbajtjen (`.mp4` me mp3 brenda dhe anasjelltas) — saktësisht aty
--     ku një video prek një audio në listë. Te zip-i asnjë.
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  ÇFARË BËN KY SKRIPT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Kërkesë e klientes, 13 nëntor: çdo skedar të quhet si kënga e vet.
-- Prandaj nuk ndreqen vetëm titujt — ngarkohen të 18 skedarët me emrat e
-- tyre të vërtetë dhe çdo rresht tregon te skedari që i takon. Pas kësaj
-- emri i skedarit dhe titulli thonë të njëjtën gjë, dhe ngatërresa nuk ka
-- ku të rikthehet.
--
-- ⚠️  KËRKON NGARKIM PËRPARA: të 18 skedarët te `meditime/kenge-motivuese/`,
--     që mbishkruajnë 17 të vjetrit dhe shtojnë `bolleku-eshte-e-drejta-ime.mp3`.
--
-- ⚠️  ASNJË VIDEO. "Observuesi" dhe "Zgjidhja e një sfide" ishin `.mp4` me
--     rrjedhë h264 — gabim ruajtjeje te studioja, sqaruar nga klientja.
--     Zëri u nxor prej tyre (aac 196 kbps → mp3 192 kbps, 48 kHz stereo,
--     e njëjta kohëzgjatje). `video_url` mbetet NULL kudo.
--
-- ⚠️  PAS EKZEKUTIMIT fshihet `pranimi-i-vetes.mp4` nga serveri — mbetet
--     pa përdorim, sepse ai mbante videon e Observuesit. Jo para, se deri
--     atëherë një rresht ende tregon te ai.
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  1. TË 17 RRESHTAT EKZISTUES
-- ───────────────────────────────────────────────────────────────
-- Rreshtat nuk fshihen: identiteti i tyre mbahet, që pëlqimet, të
-- ruajturat dhe shkarkimet e përdoruesve të mos këputen. Secili merr
-- titullin, kohëzgjatjen dhe skedarin e këngës që mban vërtet.

UPDATE meditations
   SET title = 'Bollëku është e Drejta Ime',
       duration_sec = 176,
       audio_url = 'meditime/kenge-motivuese/bolleku-eshte-e-drejta-ime.mp3',
       video_url = NULL
 WHERE id = 'cc7f85cd-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Diçka e mrekullueshme',
       duration_sec = 211,
       audio_url = 'meditime/kenge-motivuese/dicka-e-mrekullueshme.mp3',
       video_url = NULL
 WHERE id = 'cc7f894b-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Falja e vetes',
       duration_sec = 276,
       audio_url = 'meditime/kenge-motivuese/falja-e-vetes.mp3',
       video_url = NULL
 WHERE id = 'cc7f89df-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Jam këtu',
       duration_sec = 160,
       audio_url = 'meditime/kenge-motivuese/jam-ketu.mp3',
       video_url = NULL
 WHERE id = 'cc7f8c3b-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Kënga e manifestimit',
       duration_sec = 153,
       audio_url = 'meditime/kenge-motivuese/kenga-e-manifestimit.mp3',
       video_url = NULL
 WHERE id = 'cc7f8a57-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Kthehu ti',
       duration_sec = 109,
       audio_url = 'meditime/kenge-motivuese/kthehu-ti.mp3',
       video_url = NULL
 WHERE id = 'cc7f8ca3-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Ndiej falënderim!',
       duration_sec = 193,
       audio_url = 'meditime/kenge-motivuese/ndiej-falenderim.mp3',
       video_url = NULL
 WHERE id = 'cc7f8cf3-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Observuesi',
       duration_sec = 242,
       audio_url = 'meditime/kenge-motivuese/observuesi.mp3',
       video_url = NULL
 WHERE id = 'cc7f8d43-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Pranimi i vetes',
       duration_sec = 309,
       audio_url = 'meditime/kenge-motivuese/pranimi-i-vetes.mp3',
       video_url = NULL
 WHERE id = 'cc7f8d99-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Shërimi ka ndodhur',
       duration_sec = 275,
       audio_url = 'meditime/kenge-motivuese/sherimi-ka-ndodhur.mp3',
       video_url = NULL
 WHERE id = 'cc7f8de3-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Simfonia e jetës',
       duration_sec = 180,
       audio_url = 'meditime/kenge-motivuese/simfonia-e-jetes.mp3',
       video_url = NULL
 WHERE id = 'cc7f8e29-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Sot po eci si vetja ime e vërtetë',
       duration_sec = 228,
       audio_url = 'meditime/kenge-motivuese/sot-po-eci-si-vetja-ime.mp3',
       video_url = NULL
 WHERE id = 'cc7f8f18-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Të shoh',
       duration_sec = 247,
       audio_url = 'meditime/kenge-motivuese/te-shoh.mp3',
       video_url = NULL
 WHERE id = 'cc7f8e95-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Thirrja për aventurë',
       duration_sec = 213,
       audio_url = 'meditime/kenge-motivuese/thirrja-per-aventure.mp3',
       video_url = NULL
 WHERE id = 'cc7f8eda-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Toka do që të dëgjohet një këngë e re',
       duration_sec = 338,
       audio_url = 'meditime/kenge-motivuese/toka-do-qe-te-degjohet.mp3',
       video_url = NULL
 WHERE id = 'cc7f8f60-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Vlera jote je ti',
       duration_sec = 393,
       audio_url = 'meditime/kenge-motivuese/vlera-jote-je-ti.mp3',
       video_url = NULL
 WHERE id = 'cc7f8ffb-deab-11f1-af71-107c614af9b1';

UPDATE meditations
   SET title = 'Zëri im le të dëgjohet',
       duration_sec = 247,
       audio_url = 'meditime/kenge-motivuese/zeri-im-le-te-degjohet.mp3',
       video_url = NULL
 WHERE id = 'cc7f8fac-deab-11f1-af71-107c614af9b1';

-- Çdo UPDATE duhet "1 row affected" — 17 gjithsej.


-- ───────────────────────────────────────────────────────────────
--  2. KËNGA E 18-TË
-- ───────────────────────────────────────────────────────────────
-- "Zgjidhja e një sfide" nuk mbërriti kurrë më 12 nëntor, sepse ishte e
-- fundit në listë dhe zhvendosja nuk la emër për të.

INSERT INTO meditations
  (title, technique_id, category_id, subgroup, narrator,
   duration_sec, audio_url, video_url, cover_url, description,
   is_premium, is_block, published_at)
SELECT 'Zgjidhja e një sfide', tec.id, NULL, 'Këngë', NULL,
       240, 'meditime/kenge-motivuese/zgjidhja-e-nje-sfide.mp3', NULL,
       NULL, NULL, 1, 0, NOW()
  FROM techniques tec
 WHERE tec.slug = 'kenge-motivuese'
   AND NOT EXISTS (
     SELECT 1 FROM meditations m
      WHERE m.audio_url = 'meditime/kenge-motivuese/zgjidhja-e-nje-sfide.mp3'
        AND m.is_block = 0
   );

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────
-- Duhen 18 rreshta. Kolona `skedari` duhet të lexohet si titulli te çdo
-- rresht, dhe `video_url` duhet bosh te të gjitha.

SELECT m.title, m.duration_sec,
       SUBSTRING_INDEX(m.audio_url, '/', -1) AS skedari,
       m.video_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'kenge-motivuese'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;
