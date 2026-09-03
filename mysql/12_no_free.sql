-- ═══════════════════════════════════════════════════════════════
--  ASNJË MEDITIM FALAS
--
--  ⚠️  NDRYSHIM MODELI (3 shtator 2026, vendim i klientes).
--
--      Seksioni 8 i katalogut lejonte tre meditime falas — një për ankthin,
--      një për zemrën, një për trurin. Ai rregull U HOQ: i gjithë katalogu
--      është i kyçur, dhe e vetmja rrugë drejt tij është prova 3-ditore, që
--      hapet nga abonimi dhe zhbllokon gjithçka.
--
--      Kjo është pika ku rregulli ZBATOHET vërtet: `GET /audio/:id` lexon
--      `meditations.is_premium` dhe refuzon me `402` kur duhet abonim. Ndryshimi
--      te aplikacioni vetëm heq etiketën "FALAS"; pa këtë pyetje, ata tre
--      skedarë do të vazhdonin të jepeshin pa abonim.
--
--  I sigurt për t'u ri-ekzekutuar.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

UPDATE meditations SET is_premium = 1 WHERE is_premium = 0;

-- Kontroll: `falas` duhet të jetë 0.
SELECT COUNT(*) AS gjithsej,
       SUM(is_premium = 0) AS falas,
       SUM(is_premium = 1) AS premium
  FROM meditations;
