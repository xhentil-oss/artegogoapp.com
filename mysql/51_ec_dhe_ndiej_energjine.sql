-- ═══════════════════════════════════════════════════════════════
--  "Grounding" → "Ec dhe ndiej energjinë e jetës së re"
--  11 nëntor 2026
-- ═══════════════════════════════════════════════════════════════
--
--  Te "Meditim në ecje" → Qetësim.
--
--  ✓  VETËM TITULLI. Një urdhër, asnjë skedar, pa zip faqeje, pa
--     Restart Node-i.
--
--  ✓  TITULL I VETËM. Ndryshe nga "Manifesto partner", që e mbanin dy
--     rreshta, "Grounding" është vetëm ky. Kushti mbetet prapë mbi `id`.
--
--  ⚠️  PËRSHKRIMI MBAHET, POR NUK I RRI PLOTËSISHT.
--
--      I vjetri: "Tokëzim me këmbët në dysheme. Vëmendja zbret poshtë,
--      pesha ndihet te thembrat, dhe ankthi që rri lart te gjoksi gjen
--      ku të shkarkohet."
--
--      Nuk është i gabuar — tokëzimi mbetet ajo që bëhet — por flet për
--      shkarkimin e ankthit, kurse titulli i ri premton energjinë e një
--      jete të re. Lexuesi i të dyve ndien një mospërputhje toni.
--
--      U mbajt sepse nuk gënjen, dhe sepse katër meditime të tjera
--      presin tashmë tekst nga klientja. Po deshe ta zbrazësh derisa të
--      vijë teksti i ri:
--
--          UPDATE meditations SET description = NULL
--           WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1';
--
--  ⚠️  KY MBETET VENDMBAJTËS. Pas riemërtimit ka ende 10 minuta të
--      sajuara, pa zë dhe pa kopertinë. Kush shtyp "luaj" merr "Audio
--      ende nuk është ngarkuar".
--
--  Te e njëjta dosje kanë mbetur edhe tre tituj anglisht: "Body scan",
--  "Somatic walking", "Somatic dancing".

SET NAMES utf8mb4;

UPDATE meditations
   SET title = 'Ec dhe ndiej energjinë e jetës së re'
 WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1';

-- Duhet "1 row affected".


-- Kontroll: një rresht, me titullin e ri.
SELECT id, title, subgroup, duration_sec, audio_url, cover_url
  FROM meditations
 WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1';


-- ═══════════════════════════════════════════════════════════════
--  PËR TITULLIN E VJETËR, PO TË DUHET PRAPA
-- ═══════════════════════════════════════════════════════════════
--      UPDATE meditations SET title = 'Grounding'
--       WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1';
