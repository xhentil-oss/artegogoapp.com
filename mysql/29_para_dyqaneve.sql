-- ═══════════════════════════════════════════════════════════════
--  PARA DËRGIMIT TE DYQANET — shfaq vetëm atë që luan vërtet
-- ═══════════════════════════════════════════════════════════════
--
--  Gjendja e matur më 22 tetor 2026, duke pyetur serverin skedar për skedar:
--  nga 250 rrugët e `scripts/audio-manifest.txt`, **vetëm 10 ekzistojnë**.
--  Pra 240 meditime duken te aplikacioni dhe luajnë tinguj demo.
--
--  ⚠️  PËR SHQYRTIMIN E APPLE-IT KJO ËSHTË RREZIKU KRYESOR.
--
--      Udhëzimi 2.1 (App Completeness) e refuzon një aplikacion ku veçoritë
--      kryesore nuk punojnë. Shqyrtuesi hap dy-tre meditime me qejf; nëse nuk
--      dëgjon audio, aplikacioni quhet i papërfunduar — dhe refuzimi vjen me
--      një paragraf të vetëm, pa shpjegim se cili meditim u provua.
--
--  ZGJIDHJA: fshihen ato pa skedar, në vend që të duken të prishura.
--
--  `published_at = NULL` i heq nga katalogu i aplikacionit — `content.js` i
--  filtron me `published_at IS NOT NULL` te lista, te teknikat dhe te
--  kategoritë. Numrat ("34 meditime", "14 teknika") rillogariten vetvetiu,
--  ndaj aplikacioni duket i plotë me dhjetë meditime, jo i thyer me 250.
--
--  ⚠️  ASGJË NUK FSHIHET. Rreshti mbetet i tëri; hiqet vetëm data e botimit.
--      Kthimi është një `UPDATE` i vetëm për secilin, sapo audioja të ngarkohet
--      (shih fundin e këtij skedari).

UPDATE meditations
   SET published_at = NULL
 WHERE is_block = 0
   AND audio_url NOT IN (
         'meditime/frymemarrje/box-breathing.mp3',
         'meditime/frymemarrje/coherence-breathing.mp3',
         'meditime/frymemarrje/per-ankth.mp3',
         'meditime/frymemarrje/per-panik.mp3',
         'meditime/frymemarrje/per-stres.mp3',
         'meditime/meditime-per-trupin/energjia-e-mengjesit.mp3',
         'meditime/meditime-per-trupin/fli-shpejt.mp3',
         'meditime/meditime-per-trupin/meditime-familjare.mp3',
         'meditime/meditime-per-trupin/ndjehu-i-lehte.mp3',
         'meditime/vizualizim/meditim-per-te-rritur-ndergjegjen.mp3'
       );

-- Edhe ato që s'kanë fare adresë audioje.
UPDATE meditations
   SET published_at = NULL
 WHERE is_block = 0
   AND (audio_url IS NULL OR audio_url = '');

-- Kontroll: sa mbeten të botuara dhe cilat janë.
SELECT COUNT(*) AS te_botuara FROM meditations WHERE is_block = 0 AND published_at IS NOT NULL;
SELECT title, duration_sec, audio_url
  FROM meditations
 WHERE is_block = 0 AND published_at IS NOT NULL
 ORDER BY title;

-- ───────────────────────────────────────────────────────────────
--  KUR TË VIJË NJË AUDIO E RE — kthimi i saj në katalog:
--
--    UPDATE meditations SET published_at = NOW()
--     WHERE audio_url = 'meditime/<teknika>/<emri>.mp3';
--
--  Mini-blloqet e ndërtuesit (`is_block = 1`) nuk preken nga asnjë nga
--  urdhrat më lart: ato nuk janë meditime të katalogut dhe duhet të mbeten
--  të përdorshme te "Krijo".
-- ───────────────────────────────────────────────────────────────
