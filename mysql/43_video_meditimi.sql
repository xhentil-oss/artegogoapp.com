-- ═══════════════════════════════════════════════════════════════
--  MEDITIME ME FIGURË — kolona `video_url`
-- ═══════════════════════════════════════════════════════════════
--
--  10 nëntor 2026. Deri tani çdo meditim ishte vetëm zë. "Shkundje somatike"
--  është i pari që tregohet, jo vetëm dëgjohet.
--
--  ⚠️  KY SKEDAR RROTULLOHET I PARI, PARA SE TË NGARKOHET `content.js`.
--
--      Pa kolonën `video_url`, SELECT-i i ri te `content.js` dështon me
--      #1054 — dhe bashkë me të bie e GJITHË biblioteka, jo vetëm videoja.
--      Radha e kundërt është pikërisht ajo që e la API-në të rënë më 9
--      shtator.
--
--  ⚠️  `#1060 Duplicate column name` do të thotë se kolona ekziston tashmë,
--      pra hapi është bërë. Vazhdo me UPDATE-in më poshtë.
--
--      Nuk përdoret `IF NOT EXISTS`: përdoruesi i databazës te cPanel-i nuk
--      e lexon dot `information_schema` (#1044), ndaj kontrolli paraprak nuk
--      bëhet dot. Gabimi është kontrolli.
--
--  ⚠️  `audio_url` NUK hiqet dhe nuk zbrazet. Kur të dyja ekzistojnë,
--      serveri zgjedh videon — por zëri mbetet aty, si rrugë kthimi po të
--      vendoset një ditë që ky meditim të dëgjohet pa figurë.

SET NAMES utf8mb4;

-- ── Hapi 1: kolona ─────────────────────────────────────────────

ALTER TABLE meditations
  ADD COLUMN video_url TEXT NULL AFTER audio_url;

-- ── Hapi 2: videoja e "Shkundje somatike" ──────────────────────
--
--  Rruga është e njëjta formë si te `audio_url`: relative, pa domen. Skedari
--  shkon te /home2/appdrartegogo/public_html/meditime/teknika-somatike/
--
--  ⚠️  JO te një dosje `audio` jashtë `public_html`. Ajo nuk ekziston te
--      serveri, dhe as `audio.php`. Të dyja janë shkruar te projekti —
--      porta që do t'i mbronte skedarët pas nënshkrimit — por nuk janë
--      vendosur kurrë. Mp3-të shërbehen drejtpërdrejt, dhe parametrat
--      `expires`/`u`/`sig` që vendos API-ja i shpërfill serveri statik.
--
--      Provuar nga jashtë më 10 nëntor 2026:
--        app.drartegogo.com/meditime/…/fli-shpejt.mp3  → 206 audio/mpeg
--        app.drartegogo.com/audio.php?f=…              → 404
--
--      Pasojë: kushdo me adresën e plotë e shkarkon skedarin pa abonim.
--      Videoja nuk e ndryshon këtë gjendje — thjesht e ndjek atë që
--      vlen për të 244 mp3-të.
--
--  `duration_sec` bie nga 600 në 136, sa zgjat vërtet videoja. Pa këtë,
--  shiriti i kohës do të ndalej te 2:16 dhe do të rrinte bosh deri në 10:00.

UPDATE meditations
   SET video_url    = 'meditime/teknika-somatike/shkundje-somatike.mp4',
       duration_sec = 136
 WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht, me titullin e ri dhe videon.
SELECT id, title, duration_sec, audio_url, video_url
  FROM meditations
 WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1';
