-- ═══════════════════════════════════════════════════════════════
--  SHTATËMBËDHJETË KËNGË MOTIVUESE
--  12 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Përmbajtja e parë e praktikës "Këngë motivuese". Me këto, pllaka
--  pushon së shkruari "Së shpejti" dhe hapet si rrjetë kapakësh.
--
--  ✓  I SIGURT PËR T'U EKZEKUTUAR DY HERË. `NOT EXISTS` mbi titullin e
--     ndal dyfishimin, si te `13_gjashte_meditime.sql`.
--
--  ⚠️  `category_id` RRI NULL, ME QЁLLIM. Një këngë nuk i përket asnjë
--      kategorie qëllimi ("Gjumë", "Ankth"...). Po t'i jepnim një, e njëjta
--      këngë do të dilte edhe brenda asaj dosjeje, mes meditimeve.
--
--      API-ja e duron: `FROM_MEDITATIONS` përdor LEFT JOIN, ndaj rreshti
--      kthehet me `category_slug: null`. Aplikacioni e duron gjithashtu —
--      rrjeta i numëron `items`, jo `groups` (shih `FolderSheet.jsx`).
--
--  ⚠️  "Pranimi i vetes" ËSHTË VIDEO. Skedari erdhi me prapashëtesën
--      `.mp3`, por brenda është h264 824×1464 me zë aac. `video_url` e mban
--      rrugën; `audio_url` mban të njëjtën, sepse kufizimi
--      `chk_med_published` nuk lejon `audio_url` bosh te një rresht i botuar,
--      dhe `/audio/:id` e zgjedh video-n e para kur ekziston.
--
--  ⚠️  PA KOPERTINA, PËR TANI. Asnjë nga 17 skedarët nuk mban figurë
--      brenda (e provova një nga një me ffprobe). Derisa të vijnë, karta
--      vizaton peizazhin procedural me titullin mbi të. Shtimi i një
--      kopertine është një rresht SQL dhe një skedar — pa ndërtim faqeje.
--
--  ⚠️  PA EMËR INTERPRETUESI. `narrator` rri NULL me kërkesën e klientes
--      (12 nëntor): poshtë kapakut vetëm titulli dhe gjatësia. Po të
--      shtohet më vonë, karta e shfaq vetë — pa ndryshim kodi.
--
--  ⚠️  `Vlera jote je ti` — ETIKETAT BRENDA SKEDARIT THONË DIÇKA TJETËR.
--      ID3-ja e tij shkruan "Toka do që të dëgjohet një këngë e re", me
--      artistin "Arte Gogo & Dr. Marvin Bundo" dhe me kopertinën e asaj
--      kënge. Por ekziston një skedar i dytë me atë emër, dhe krahasimi i
--      valëve të të dyve dha korrelacion 0,33 — pra JANË DY REGJISTRIME TË
--      NDRYSHME, jo dy prerje të së njëjtës. Prandaj u besua emrit të
--      skedarit, jo etiketës. Po të dalë e kundërta pasi t'i dëgjosh:
--
--        UPDATE meditations SET title = '<i sakti>' WHERE title = 'Vlera jote je ti';
--
--  ⚠️  KOHËZGJATJET janë të matura nga vetë skedarët me ffprobe, jo të
--      hamendësuara. Këngët janë VBR rreth 130 kbps, 44 100 Hz — pra numërimi
--      kornizë për kornizë që përdorim te meditimet 192 kbps CBR nuk vlente.
--
--  ⚠️  NUK HYJNË TE NJOFTIMET. `notification_pools` u mbush një herë nga
--      `08_pools.sql` dhe nuk i lexon rreshtat e rinj. Kënga e ditës nuk
--      do të bjerë kurrë si "meditimi i mëngjesit".
--
--  ✓  VETËM SQL DHE SKEDARËT. Pa Restart Node-i. Kodi i faqes duhet vetëm
--     nëse nuk është ngarkuar ende rrjeta (`index-...js` i 12 nëntorit).

SET NAMES utf8mb4;


-- ───────────────────────────────────────────────────────────────
--  SHTIMI
-- ───────────────────────────────────────────────────────────────

INSERT INTO meditations
  (title, technique_id, category_id, subgroup, narrator,
   duration_sec, audio_url, video_url, cover_url, description,
   is_premium, is_block, published_at)
SELECT t.title, tec.id, NULL, 'Këngë', NULL,
       t.duration_sec, t.audio_url, t.video_url, NULL, NULL,
       1, 0, NOW()
  FROM (
    SELECT 'Diçka e mrekullueshme'                   AS title, 'meditime/kenge-motivuese/dicka-e-mrekullueshme.mp3' AS audio_url, NULL                                           AS video_url,  176 AS duration_sec
    UNION ALL
    SELECT 'Falja e vetes'                           AS title, 'meditime/kenge-motivuese/falja-e-vetes.mp3'   AS audio_url, NULL                                           AS video_url,  211 AS duration_sec
    UNION ALL
    SELECT 'Jam këtu'                                AS title, 'meditime/kenge-motivuese/jam-ketu.mp3'        AS audio_url, NULL                                           AS video_url,  276 AS duration_sec
    UNION ALL
    SELECT 'Kthehu ti'                               AS title, 'meditime/kenge-motivuese/kthehu-ti.mp3'       AS audio_url, NULL                                           AS video_url,  153 AS duration_sec
    UNION ALL
    SELECT 'Kënga e manifestimit'                    AS title, 'meditime/kenge-motivuese/kenga-e-manifestimit.mp3' AS audio_url, NULL                                           AS video_url,  160 AS duration_sec
    UNION ALL
    SELECT 'Ndiej falënderim!'                       AS title, 'meditime/kenge-motivuese/ndiej-falenderim.mp3' AS audio_url, NULL                                           AS video_url,  109 AS duration_sec
    UNION ALL
    SELECT 'Observuesi'                              AS title, 'meditime/kenge-motivuese/observuesi.mp3'      AS audio_url, NULL                                           AS video_url,  193 AS duration_sec
    UNION ALL
    SELECT 'Pranimi i vetes'                         AS title, 'meditime/kenge-motivuese/pranimi-i-vetes.mp4' AS audio_url, 'meditime/kenge-motivuese/pranimi-i-vetes.mp4' AS video_url,  242 AS duration_sec
    UNION ALL
    SELECT 'Shërimi ka ndodhur'                      AS title, 'meditime/kenge-motivuese/sherimi-ka-ndodhur.mp3' AS audio_url, NULL                                           AS video_url,  309 AS duration_sec
    UNION ALL
    SELECT 'Simfonia e jetës'                        AS title, 'meditime/kenge-motivuese/simfonia-e-jetes.mp3' AS audio_url, NULL                                           AS video_url,  275 AS duration_sec
    UNION ALL
    SELECT 'Sot po eci si vetja ime e vërtetë'       AS title, 'meditime/kenge-motivuese/sot-po-eci-si-vetja-ime.mp3' AS audio_url, NULL                                           AS video_url,  180 AS duration_sec
    UNION ALL
    SELECT 'Thirrja për aventurë'                    AS title, 'meditime/kenge-motivuese/thirrja-per-aventure.mp3' AS audio_url, NULL                                           AS video_url,  247 AS duration_sec
    UNION ALL
    SELECT 'Toka do që të dëgjohet një këngë e re'   AS title, 'meditime/kenge-motivuese/toka-do-qe-te-degjohet.mp3' AS audio_url, NULL                                           AS video_url,  213 AS duration_sec
    UNION ALL
    SELECT 'Të shoh'                                 AS title, 'meditime/kenge-motivuese/te-shoh.mp3'         AS audio_url, NULL                                           AS video_url,  228 AS duration_sec
    UNION ALL
    SELECT 'Vlera jote je ti'                        AS title, 'meditime/kenge-motivuese/vlera-jote-je-ti.mp3' AS audio_url, NULL                                           AS video_url,  338 AS duration_sec
    UNION ALL
    SELECT 'Zgjidhja e një sfide'                    AS title, 'meditime/kenge-motivuese/zgjidhja-e-nje-sfide.mp3' AS audio_url, NULL                                           AS video_url,  247 AS duration_sec
    UNION ALL
    SELECT 'Zëri im le të dëgjohet'                  AS title, 'meditime/kenge-motivuese/zeri-im-le-te-degjohet.mp3' AS audio_url, NULL                                           AS video_url,  393 AS duration_sec
  ) AS t
  JOIN techniques tec ON tec.slug = 'kenge-motivuese'
 WHERE NOT EXISTS (
   SELECT 1 FROM meditations m WHERE m.title = t.title AND m.is_block = 0
 );

-- Duhet "17 rows affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────
--  Duhen 17 rreshta, të renditur nga më e shkurtra te më e gjata.

SELECT m.title, m.duration_sec, m.audio_url, m.video_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'kenge-motivuese'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.duration_sec;


-- ═══════════════════════════════════════════════════════════════
--  SI TË FSHIHEN TË GJITHA, NËSE DUHET
-- ═══════════════════════════════════════════════════════════════
--  Nuk fshihen nga databaza — vetëm nga ekrani, si gjithmonë:
--
--      UPDATE meditations m
--        JOIN techniques t ON t.id = m.technique_id
--         SET m.published_at = NULL
--       WHERE t.slug = 'kenge-motivuese';
--
--  Pllaka këthehet atëherë te "Së shpejti", pa asnjë ndryshim kodi.
