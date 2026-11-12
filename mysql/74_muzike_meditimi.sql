-- ═══════════════════════════════════════════════════════════════
--  TRIMËDHJETË PJESË — "Muzikë meditimi"
--  12 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  E njëjta gjë si `73_kenge_motivuese.sql`, për praktikën e dytë të re.
--  Me këto, edhe "Muzikë meditimi" pushon së shkruari "Së shpejti".
--
--  ✓  PA NDRYSHIM KODI. Flamuri `grid` te `data/techniques.js` ishte vënë
--     që me të dyja praktikat, ndaj rrjeta hapet vetvetiu. As zip faqeje,
--     as Restart Node-i — vetëm SQL dhe skedarët.
--
--  ⚠️  `category_id` RRI NULL, si te këngët. Një pjesë muzikore nuk i
--      përket asnjë kategorie qëllimi; po t'i jepnim një, do të dilte edhe
--      brenda asaj dosjeje, mes meditimeve të udhëhequra.
--
--  ⚠️  PA KOPERTINA, PËR TANI. Asnjë nga 13 skedarët nuk mban figurë
--      brenda. Karta vizaton peizazhin me titullin mbi të derisa të vijnë.
--      Praktika ka `intent: "calm"`, ndaj kapakët dalin blu të qetë — jo
--      portokalli si të këngëve. Shih `intentFor` te `services/taxonomy.js`.
--
--  ⚠️  PA EMËR INTERPRETUESI. `narrator` rri NULL, si te këngët.
--
--  ⚠️  MUNGON NJË PJESË. Te lista e klientes janë 14; mbërritën 13.
--      "Aty ku lind drita" (4 131 KB) nuk u gjet gjëkundi. Kur të vijë,
--      shtohet me një SELECT të vetëm më poshtë.
--
--  ⚠️  KOHËZGJATJET janë matur me ffprobe. Këto janë 192 kbps CBR, 2:32–2:58.
--
--  ⚠️  NUK HYJNË TE NJOFTIMET. `notification_pools` u mbush një herë nga
--      `08_pools.sql` dhe nuk i lexon rreshtat e rinj.
--
--  ✓  I SIGURT PËR T'U EKZEKUTUAR DY HERË — `NOT EXISTS` mbi titullin.

SET NAMES utf8mb4;

INSERT INTO meditations
  (title, technique_id, category_id, subgroup, narrator,
   duration_sec, audio_url, video_url, cover_url, description,
   is_premium, is_block, published_at)
SELECT t.title, tec.id, NULL, 'Muzikë', NULL,
       t.duration_sec, t.audio_url, NULL, NULL, NULL,
       1, 0, NOW()
  FROM (
    SELECT 'Gjithçka që ndiej'        AS title, 'meditime/muzike-meditimi/gjithcka-qe-ndiej.mp3'     AS audio_url,  176 AS duration_sec
    UNION ALL SELECT 'Hapësirë pa fund'        , 'meditime/muzike-meditimi/hapesire-pa-fund.mp3'     ,  172
    UNION ALL SELECT 'Jehonë brenda meje'      , 'meditime/muzike-meditimi/jehone-brenda-meje.mp3'   ,  172
    UNION ALL SELECT 'Ku qielli prek detin'    , 'meditime/muzike-meditimi/ku-qielli-prek-detin.mp3' ,  175
    UNION ALL SELECT 'Kur koha ndalet'         , 'meditime/muzike-meditimi/kur-koha-ndalet.mp3'      ,  153
    UNION ALL SELECT 'Mbi re'                  , 'meditime/muzike-meditimi/mbi-re.mp3'               ,  179
    UNION ALL SELECT 'Me sytë mbyllur'         , 'meditime/muzike-meditimi/me-syte-mbyllur.mp3'      ,  178
    UNION ALL SELECT 'Mes meje dhe qiellit'    , 'meditime/muzike-meditimi/mes-meje-dhe-qiellit.mp3' ,  171
    UNION ALL SELECT 'Një çast pafundësi'      , 'meditime/muzike-meditimi/nje-cast-pafundesi.mp3'   ,  167
    UNION ALL SELECT 'Në ajër'                 , 'meditime/muzike-meditimi/ne-ajer.mp3'              ,  177
    UNION ALL SELECT 'Nën të njëjtin qiell'    , 'meditime/muzike-meditimi/nen-te-njejtin-qiell.mp3' ,  153
    UNION ALL SELECT 'Përtej kohës'            , 'meditime/muzike-meditimi/pertej-kohes.mp3'         ,  178
    UNION ALL SELECT 'Si ujë i qetë'           , 'meditime/muzike-meditimi/si-uje-i-qete.mp3'        ,  159
  ) AS t
  JOIN techniques tec ON tec.slug = 'muzike-meditimi'
 WHERE NOT EXISTS (
   SELECT 1 FROM meditations m WHERE m.title = t.title AND m.is_block = 0
 );

-- Duhet "13 rows affected".


-- Kontroll: 13 rreshta, nga më e shkurtra te më e gjata.
SELECT m.title, m.duration_sec, m.audio_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'muzike-meditimi'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.duration_sec;


-- ═══════════════════════════════════════════════════════════════
--  SI TË FSHIHEN TË GJITHA, NËSE DUHET
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations m
--        JOIN techniques t ON t.id = m.technique_id
--         SET m.published_at = NULL
--       WHERE t.slug = 'muzike-meditimi';
