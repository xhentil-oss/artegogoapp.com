-- ═══════════════════════════════════════════════════════════════
--  SOMATIC SHAKING → SHKUNDJE SOMATIKE
-- ═══════════════════════════════════════════════════════════════
--
--  Titulli anglisht zëvendësohet me atë shqip, 10 nëntor 2026.
--
--  Vetëm titulli. `audio_url` NUK preket: rruga e planifikuar mbetet
--  `meditime/teknika-somatike/somatic-shaking.mp3` dhe nuk ka lidhje me
--  atë që sheh përdoruesi. Po ta ndërronim, do të na duhej të riemëronim
--  edhe skedarin te serveri — pa asnjë fitim.
--
--  Nuk preket as `duration_sec`: 600 sekonda mbetet derisa të vendoset
--  media e vërtetë, që e cakton vetë kohëzgjatjen.

SET NAMES utf8mb4;

UPDATE meditations
   SET title = 'Shkundje somatike'
 WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1';

-- Kontroll: një rresht, me titullin e ri.
SELECT id, title, subgroup, duration_sec
  FROM meditations
 WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1';
