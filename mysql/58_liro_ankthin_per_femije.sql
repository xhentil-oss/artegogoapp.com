-- ═══════════════════════════════════════════════════════════════
--  "Ankthi" → "Liro ankthin", me zë dhe kopertinë
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditime për Trupin" → Fëmijët 8–12 (nën-grupi "Për fëmijë").
--
--  ✓  NJË URDHËR I VETËM. Pa zip faqeje, pa Restart Node-i.
--     Dosja `meditime-per-trupin` ekziston tashmë te serveri.
--
--  ⚠️  PA PËRPLASJE TITULLI, POR ME NJË FQINJ TË NGJASHËM.
--
--      Asnjë meditim nuk quhet "Liro ankthin". Ekziston megjithatë
--      "Liro ankthin në 10 minuta" (`5ec88e78`, Meditime riprogramimi →
--      Emocionet). Janë dy tituj të ndryshëm, në dy dosje të ndryshme,
--      ndaj nuk dalin kurrë pranë e pranë — por nisin njësoj.
--
--      Po të duash ta ndash më qartë, titulli bëhet me një fjalë më
--      shumë dhe asgjë tjetër nuk ndryshon:
--        UPDATE meditations SET title = 'Liro ankthin për fëmijë'
--         WHERE id = '5ed09843-a510-11f1-b99e-107c614af9b1';
--
--  ⚠️  EMRI I SKEDARIT TE SERVERI MBAN "per-femije".
--
--      Titulli është "Liro ankthin", por mp3-ja ngarkohet si
--      `liro-ankthin-per-femije.mp3`. Pikërisht që të mos ngatërrohet me
--      regjistrimin e "Liro ankthin në 10 minuta", i cili rri te
--      `meditime/meditime-riprogramimi/liro-ankthin-ne-10-minuta.mp3`.
--      Rruga e skedarit nuk shfaqet askund te aplikacioni.
--
--  ✓  PËRSHKRIMI NUK PREKET. "Për fëmijë 8–12 vjeç, kur barku ngushtohet
--     nga shqetësimi. Me gjuhë të thjeshtë: ku e ndjen ankthin, si e fryn
--     tullumbacen me frymë, dhe si kthehesh te gjërat që i sheh e i prek
--     rreth teje." — i rri saktë titullit të ri dhe nuk përmend asnjë
--     numër minutash që do të bëhej i pasaktë.
--
--  ✓  NUK PREK ASNJË NJOFTIM. `08_pools.sql` merr nga kjo teknikë vetëm
--     nën-grupet "Mëngjes", "Energjia", "Në punë", "Në makinë",
--     "Në shtëpi" dhe "Gjumi". "Për fëmijë" nuk është te asnjë pishinë.
--
--  Karta kalon nga 6 min në 8 min.
--
--  Kohëzgjatja: 480 sekonda, fiks 8 minuta. E numëruar kornizë për
--  kornizë nga vetë mp3-ja — 20 002 korniza × 1152 mostra ÷ 48 000 Hz.

SET NAMES utf8mb4;

UPDATE meditations
   SET title        = 'Liro ankthin',
       audio_url    = 'meditime/meditime-per-trupin/liro-ankthin-per-femije.mp3',
       cover_url    = '/kopertina/liro-ankthin-per-femije.jpeg',
       duration_sec = 480
 WHERE id = '5ed09843-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL — dosja Fëmijët 8–12
-- ───────────────────────────────────────────────────────────────
--  Gjashtë rreshta. "Liro ankthin" me 480 s dhe të dy rrugët;
--  të pesë të tjerët vendmbajtës me 360 s dhe pa kopertinë.

SELECT m.title, m.duration_sec, m.cover_url, m.audio_url
  FROM meditations m
  JOIN categories c ON c.id = m.category_id
 WHERE c.slug = 'femijet-8-12'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.title;


-- ═══════════════════════════════════════════════════════════════
--  SI TA KTHESH, NËSE DO
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations
--         SET title = 'Ankthi',
--             audio_url = 'meditime/meditime-per-trupin/ankthi.mp3',
--             cover_url = NULL,
--             duration_sec = 360
--       WHERE id = '5ed09843-a510-11f1-b99e-107c614af9b1';
