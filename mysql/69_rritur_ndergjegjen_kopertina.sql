-- ═══════════════════════════════════════════════════════════════
--  "Meditim për të rritur ndërgjegjen" — vetëm kopertina
--  12 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te Vizualizim → Intuita, nën-grupi "Ndërgjegje e lartë".
--
--  ✓  NUK KA NGARKIM AUDIOJE. Ky është ndryshimi nga dy meditimet e
--     tjera sot.
--
--     `meditime/vizualizim/meditim-per-te-rritur-ndergjegjen.mp3` është
--     TASHMË te serveri dhe punon: e provova sot, kthen 200 me 10 813 582
--     bajt — pikërisht sa ka edhe skedari te kompjuteri. Pra ky meditim
--     nuk ka qenë kurrë i heshtur; prej tij mungonte vetëm kopertina e re.
--
--  ⚠️  KOHËZGJATJA NUK PREKET. Është 450 dhe mbetet 450. E rinumërova
--      kornizë për kornizë nga mp3-ja — 18 760 korniza × 1152 mostra
--      ÷ 48 000 Hz = 450,24 s (7 min 30 s). Karta shkruan "8 min".
--
--  ⚠️  PSE EMRI MBARON ME "-2"
--
--      Kopertina e re u dërgua me të njëjtin emër si e vjetra. Nëse e
--      ngarkojmë ashtu, ajo e mbishkruan skedarin që ndodhet tashmë te
--      serveri — dhe atëherë:
--        • kthimi prapa kërkon ringarkimin e fotos së vjetër, se nuk
--          mbetet gjëkundi;
--        • adresa nuk ndryshon, ndaj telefonat që e kanë ruajtur foton
--          e vjetër te memoria mund të vazhdojnë ta shfaqin atë me ditë.
--
--      Me emër të ri, adresa ndryshon, foto e re duket menjëherë te
--      të gjithë, dhe e vjetra rri e paprekur për kthim me një rresht.
--
--  ⚠️  PËRSHKRIMI DHE TITULLI NUK PREKEN.
--      "Zgjerim i ndërgjegjes, vëzhgim i vetes pa gjykim."
--
--  ✓  NUK ËSHTË MES 204-ve TË FSHEHURA. Nuk duhet asnjë urdhër kthimi
--     nga `fshehja_11_nentor`.
--
--  ✓  VETËM SQL DHE NJË SKEDAR. Pa zip faqeje, pa Restart Node-i.

SET NAMES utf8mb4;

UPDATE meditations
   SET cover_url = '/kopertina/meditim-per-te-rritur-ndergjegjen-2.jpeg'
 WHERE id = '73b9e100-ab5c-11f1-97ee-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me kopertinën e re, 450 dhe zërin që punon.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '73b9e100-ab5c-11f1-97ee-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH KOPERTINËN E VJETËR, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET cover_url = '/kopertina/meditim-per-te-rritur-ndergjegjen.jpeg'
--       WHERE id = '73b9e100-ab5c-11f1-97ee-107c614af9b1';
