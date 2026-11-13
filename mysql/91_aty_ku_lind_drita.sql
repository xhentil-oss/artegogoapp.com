-- ═══════════════════════════════════════════════════════════════
--  PJESA E KATËRMBËDHJETË — "Aty ku lind drita"
--  13 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Kopertina erdhi para audios. Më 13 nëntor te dosja e kopertinave u gjend
--  `aty ku lind drita.jpeg`, me titullin e shtypur mbi të — por asnjë nga 13
--  pjesët e "Muzikë meditimi" nuk e mbante atë titull (shih
--  `90_kopertinat_e_muzikes.sql`). Audioja mungonte; klientja e ngarkoi po atë
--  ditë. Pra praktika ka 14 pjesë, jo 13.
--
--  ✓  I SIGURT PËR T'U EKZEKUTUAR DY HERË. `NOT EXISTS` mbi titullin e ndal
--     dyfishimin, si te `74_muzike_meditimi.sql`.
--
--  ✓  KOHËZGJATJA ËSHTË E MATUR, JO E HAMENDËSUAR. Skedari u shkarkua nga
--     serveri dhe u mat me ffprobe: 175,986875 s → 176. Një rrymë e vetme
--     `mp3`, 192 kbps, pa rrymë video dhe pa kopertinë brenda — pra audio e
--     pastër, ndryshe nga dy skedarët mp4 te këngët motivuese.
--
--  ⚠️  SKEDARI DUHET RIEMËRTUAR PARA KËSAJ. Erdhi si `Aty ku lind drita.mp3`,
--      me hapësira dhe me shkronjë të madhe; të trembëdhjetë vëllezërit e tij
--      janë slug-e. `audio_url` më poshtë pret `aty-ku-lind-drita.mp3`. Po të
--      mos riemërtohet, rreshti hyn te databaza dhe pjesa shfaqet te rrjeta —
--      por shtypja mbi të jep 404, dhe asgjë në ekran nuk thotë pse.
--
--  ✓  VETËM SQL. Pa ndërtim faqeje, pa Restart Node-i.

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  SHTIMI
-- ───────────────────────────────────────────────────────────────

INSERT INTO meditations
  (title, technique_id, category_id, subgroup, narrator,
   duration_sec, audio_url, video_url, cover_url, description,
   is_premium, is_block, published_at)
SELECT 'Aty ku lind drita', tec.id, NULL, 'Muzikë', NULL,
       176, 'meditime/muzike-meditimi/aty-ku-lind-drita.mp3', NULL,
       '/kopertina/aty-ku-lind-drita.jpeg', NULL,
       1, 0, NOW()
  FROM techniques tec
 WHERE tec.slug = 'muzike-meditimi'
   AND NOT EXISTS (
     SELECT 1 FROM meditations m
      WHERE m.title = 'Aty ku lind drita'
        AND m.is_block = 0
   );

-- Duhet "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────
--  Duhen 14 rreshta: dhjetë me kopertinë, katër me NULL.

SELECT m.title, m.duration_sec, m.audio_url, m.cover_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'muzike-meditimi'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.cover_url IS NULL, m.title;
