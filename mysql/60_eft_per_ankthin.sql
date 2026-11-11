-- ═══════════════════════════════════════════════════════════════
--  "Ankth i përgjithshëm" → "EFT për ankthin", me figurë dhe kopertinë
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "EFT / Tapping" → Ankth/Panik/Fobi (nën-grupi "Ankthi").
--
--  ⚠️  KY ËSHTË MEDITIM ME FIGURË, I DYTI I APLIKACIONIT.
--
--      Shkon te `video_url`, jo te `audio_url`. Rruga zgjidhet te
--      `api/src/routes/audio.js`:
--
--          const kind = row.video_url ? "video" : "audio";
--          const path = row.video_url || row.audio_url;
--
--      Kur të dyja ekzistojnë, fiton videoja.
--
--  ✓  KOLONA `video_url` EKZISTON TASHMË, shtuar më 10 nëntor nga
--     `43_video_meditimi.sql` për "Shkundje somatike". Pa ALTER, pa
--     ngarkim te `artegogo-api`, pa Restart Node-i.
--
--  ⚠️  `audio_url` NUK HIQET. Dy arsye:
--
--      1. Kufizimi `chk_med_published` kërkon që çdo rresht i botuar të
--         ketë `audio_url IS NOT NULL`. Po ta zbrazje, UPDATE-i do të
--         dështonte me #3819.
--      2. Mbetet rrugë kthimi po të vendoset një ditë që ky meditim të
--         dëgjohet pa figurë.
--
--      Rruga e vjetër (`meditime/eft-tapping/ankth-i-pergjithshem.mp3`)
--      nuk ekziston te serveri, por tani nuk ka më rëndësi: nuk kërkohet
--      kurrë derisa `video_url` të jetë e mbushur.
--
--  ⚠️  KOHA BIE NGA 600 NË 111. Karta kalon nga "10 min" në "2 min".
--      Videoja zgjat vërtet 1 minutë e 51 sekonda — 111,03 s, lexuar nga
--      vetë skedari. Pa këtë, shiriti do të ndalej te 1:51 dhe do të
--      rrinte bosh deri në 10:00.
--
--  ✓  PËRSHKRIMI NUK PREKET. "Raund tapping-u për ankthin e përgjithshëm.
--     Nis me matjen e intensitetit nga 0 në 10, vazhdon me trokitje mbi
--     pikat e fytyrës e të trupit bashkë me fjalitë, dhe mbyllet duke e
--     matur sërish." — i rri saktë titullit të ri dhe nuk premton minuta.
--
--  ✓  PA PËRPLASJE TITULLI. Asnjë meditim tjetër nuk e ka "EFT" te titulli.
--
--  ⚠️  KY RRESHT ËSHTË TE PISHINA E MESDITËS. `08_pools.sql` fut te
--      pishina `noon` çdo meditim të teknikës `eft-tapping` me nën-grupin
--      "Ankthi". Pishina mban `meditation_id`, ndaj riemërtimi nuk e prek.
--      Nën-grupi nuk ndryshohet.
--
--  ⚠️  SKEDARI U KONVERTUA PARA NGARKIMIT.
--
--      Origjinali: `Eft për ankthin.mov`, 207 991 220 bajt (198 MB),
--      1080×1920, 30 fps, H.264 me 14,7 Mbps.
--
--      I ngarkuari: `eft-per-ankthin.mp4`, 28 438 316 bajt (27,1 MB),
--      po 1080×1920 e po 30 fps, H.264 CRF 23 me 2,05 Mbps, AAC 128k,
--      `+faststart` (moov-i në fillim, që të nisë pa u shkarkuar i tëri).
--      Kohëzgjatja identike: 111,033333 s.
--
--      Arsyeja: 198 MB për 1 min 51 s janë 10× më shumë bajt për sekondë
--      se "Shkundje somatike" (19 MB për 2 min 16 s). Dhe kontejneri
--      `.mov` nuk luhet besueshëm te WebView-i i Android-it, ku shkon
--      aplikacioni me Capacitor; `.mp4` po.

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'EFT për ankthin',
       video_url    = 'meditime/eft-tapping/eft-per-ankthin.mp4',
       cover_url    = '/kopertina/eft-per-ankthin.jpeg',
       duration_sec = 111
 WHERE id = '5ecaf349-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — të dy meditimet me figurë
-- ───────────────────────────────────────────────────────────────
--  Dy rreshta: "Shkundje somatike" (136 s) dhe "EFT për ankthin" (111 s).

SELECT m.title, t.name AS teknika, m.duration_sec, m.video_url, m.cover_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE m.video_url IS NOT NULL
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET title = 'Ankth i përgjithshëm', video_url = NULL,
--             cover_url = NULL, duration_sec = 600
--       WHERE id = '5ecaf349-a510-11f1-b99e-107c614af9b1';
