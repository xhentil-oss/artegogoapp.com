-- 76 — Këngët motivuese: të 17-ta kishin titullin e këngës fqinje
--
-- 13 nëntor 2026. Klientja dërgoi burimin e vërtetë,
-- `Downloads\Muzika shqip.zip` (80 MB, 18 skedarë, i krijuar më 12 nëntor
-- 14:59) — domethënë listën ashtu siç del nga studioja, me emrat e saktë.
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  ÇFARË KISHTE NDODHUR
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Shkarkimi një-nga-një i 12 nëntorit mori emrin e një rreshti dhe
-- përmbajtjen e rreshtit të mëparshëm. Jo një herë — të 17 herët, pa
-- përjashtim. Prandaj dolën 17 skedarë për 18 tituj: e fundit, "Zgjidhja e
-- një sfide", nuk kishte emër që t'i mbetej.
--
-- U provua duke krahasuar shenjën MD5 të çdo skedari të zip-it me atë që
-- serveri jep sot. 17 përputhje, të gjitha të zhvendosura me një:
--
--     dicka-e-mrekullueshme.mp3   →  Bollëku është e Drejta Ime
--     falja-e-vetes.mp3           →  Diçka e mrekullueshme
--     jam-ketu.mp3                →  Falja e vetes
--     … e kështu me radhë deri te …
--     zgjidhja-e-nje-sfide.mp3    →  Zëri im le të dëgjohet
--
-- Shenja e pavarur që e vërteton: skedari `Vlera Jote Je Ti.mp3` ishte i
-- vetmi me etiketa ID3 brenda, dhe ato thoshin "Toka do që të dëgjohet".
-- Më 12 nëntor kjo dukej si gabim etiketimi te studioja. Nuk ishte —
-- etiketa kishte të drejtë dhe emri i skedarit kishte gabim. Pikërisht
-- ashtu si tregon tabela këtu sipër.
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PSE NDREQEN TITUJT DHE JO SKEDARËT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Të 17 regjistrimet ndodhen tashmë te serveri dhe janë të sakta si audio.
-- I gabuar është vetëm emri mbi to. Ndreqja e titujve është një ngjitje e
-- vetme, pa ngarkuar asgjë; ndreqja e emrave të skedarëve do të kërkonte
-- 80 MB ngarkim dhe 17 mbishkrime, pra 17 mundësi të reja për gabim — në
-- një ditë ku pikërisht ngarkimet kanë shkuar shtrembër.
--
-- ⚠️  PASOJA, E SHKRUAR QË TË MOS HARROHET: pas këtij skripti emri i
--     skedarit NUK e tregon më këngën. `dicka-e-mrekullueshme.mp3` mban
--     Bollëkun. Kur të zëvendësohet një këngë e vetme nesër a pas gjashtë
--     muajsh, shtegu merret nga `audio_url` te databaza — KURRË nga emri
--     që duket logjik. Rregullimi i emrave mund të bëhet kurdo, pa nxitim,
--     se përdoruesi nuk i sheh.
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  1. TITUJT — çdo rresht merr titullin e këngës që mban vërtet
-- ───────────────────────────────────────────────────────────────
-- Nuk ka kufizim unik te `title`, ndaj zinxhiri shkon pa përplasje
-- brenda një UPDATE-i të vetëm. `duration_sec` nuk preket: ai u mat nga
-- vetë skedari, pra i përket përmbajtjes dhe mbetet i saktë.

UPDATE meditations SET title = CASE id
    WHEN 'cc7f85cd-deab-11f1-af71-107c614af9b1' THEN 'Bollëku është e Drejta Ime'
    WHEN 'cc7f894b-deab-11f1-af71-107c614af9b1' THEN 'Diçka e mrekullueshme'
    WHEN 'cc7f89df-deab-11f1-af71-107c614af9b1' THEN 'Falja e vetes'
    WHEN 'cc7f8c3b-deab-11f1-af71-107c614af9b1' THEN 'Jam këtu'
    WHEN 'cc7f8a57-deab-11f1-af71-107c614af9b1' THEN 'Kënga e manifestimit'
    WHEN 'cc7f8ca3-deab-11f1-af71-107c614af9b1' THEN 'Kthehu ti'
    WHEN 'cc7f8cf3-deab-11f1-af71-107c614af9b1' THEN 'Ndiej falënderim!'
    WHEN 'cc7f8d43-deab-11f1-af71-107c614af9b1' THEN 'Observuesi'
    WHEN 'cc7f8d99-deab-11f1-af71-107c614af9b1' THEN 'Pranimi i vetes'
    WHEN 'cc7f8de3-deab-11f1-af71-107c614af9b1' THEN 'Shërimi ka ndodhur'
    WHEN 'cc7f8e29-deab-11f1-af71-107c614af9b1' THEN 'Simfonia e jetës'
    WHEN 'cc7f8f18-deab-11f1-af71-107c614af9b1' THEN 'Sot po eci si vetja ime e vërtetë'
    WHEN 'cc7f8e95-deab-11f1-af71-107c614af9b1' THEN 'Të shoh'
    WHEN 'cc7f8eda-deab-11f1-af71-107c614af9b1' THEN 'Thirrja për aventurë'
    WHEN 'cc7f8f60-deab-11f1-af71-107c614af9b1' THEN 'Toka do që të dëgjohet një këngë e re'
    WHEN 'cc7f8ffb-deab-11f1-af71-107c614af9b1' THEN 'Vlera jote je ti'
    WHEN 'cc7f8fac-deab-11f1-af71-107c614af9b1' THEN 'Zëri im le të dëgjohet'
  END
WHERE id IN (
  'cc7f85cd-deab-11f1-af71-107c614af9b1','cc7f894b-deab-11f1-af71-107c614af9b1',
  'cc7f89df-deab-11f1-af71-107c614af9b1','cc7f8c3b-deab-11f1-af71-107c614af9b1',
  'cc7f8a57-deab-11f1-af71-107c614af9b1','cc7f8ca3-deab-11f1-af71-107c614af9b1',
  'cc7f8cf3-deab-11f1-af71-107c614af9b1','cc7f8d43-deab-11f1-af71-107c614af9b1',
  'cc7f8d99-deab-11f1-af71-107c614af9b1','cc7f8de3-deab-11f1-af71-107c614af9b1',
  'cc7f8e29-deab-11f1-af71-107c614af9b1','cc7f8f18-deab-11f1-af71-107c614af9b1',
  'cc7f8e95-deab-11f1-af71-107c614af9b1','cc7f8eda-deab-11f1-af71-107c614af9b1',
  'cc7f8f60-deab-11f1-af71-107c614af9b1','cc7f8ffb-deab-11f1-af71-107c614af9b1',
  'cc7f8fac-deab-11f1-af71-107c614af9b1'
);

-- Duhet "17 rows affected".


-- ───────────────────────────────────────────────────────────────
--  2. KËNGA E 18-TË — ajo që nuk u shkarkua kurrë
-- ───────────────────────────────────────────────────────────────
-- "Zgjidhja e një sfide" është VIDEO: h264 824×1464 me zë aac, 239,6 s,
-- 9 891 669 bajt. Si "Observuesi", që doli video për të njëjtën arsye:
-- zip-i i ruan të dyja me prapashtesën `.mp4` dhe shkarkimi i zhvendosur
-- ia kishte ngjitur prapashtesën këngës fqinje.
--
-- Emri `…-video.mp4` dhe jo `zgjidhja-e-nje-sfide.mp4`, sepse atje pranë
-- rri `zgjidhja-e-nje-sfide.mp3`, që pas pikës 1 i përket "Zëri im le të
-- dëgjohet". Dy skedarë me të njëjtin trung dhe dy zotërues të ndryshëm
-- është pikërisht ngatërresa që sapo na kushtoi një ditë.
--
-- ⚠️  Kërkon NGARKIM përpara: `meditime/kenge-motivuese/zgjidhja-e-nje-sfide-video.mp4`

INSERT INTO meditations
  (title, technique_id, category_id, subgroup, narrator,
   duration_sec, audio_url, video_url, cover_url, description,
   is_premium, is_block, published_at)
SELECT 'Zgjidhja e një sfide', tec.id, NULL, 'Këngë', NULL,
       240,
       'meditime/kenge-motivuese/zgjidhja-e-nje-sfide-video.mp4',
       'meditime/kenge-motivuese/zgjidhja-e-nje-sfide-video.mp4',
       NULL, NULL, 1, 0, NOW()
  FROM techniques tec
 WHERE tec.slug = 'kenge-motivuese'
   AND NOT EXISTS (
     SELECT 1 FROM meditations m
      WHERE m.title = 'Zgjidhja e një sfide'
        AND m.duration_sec = 240
        AND m.is_block = 0
   );

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────
-- Duhen 18 rreshta. Kolona e fundit tregon se emri i skedarit nuk
-- përputhet më me titullin — kjo është e pritshme, shih shënimin lart.

SELECT m.title, m.duration_sec,
       SUBSTRING_INDEX(m.audio_url, '/', -1) AS skedari
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'kenge-motivuese'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;
