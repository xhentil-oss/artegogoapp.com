-- ═══════════════════════════════════════════════════════════════
--  PËRFITIMET E ÇDO MEDITIMI — "Çfarë do të ndjesh"
-- ═══════════════════════════════════════════════════════════════
--
--  Deri tani ato tri shenja ✓ te fletja e meditimit NUK vinin nga meditimi.
--  Vinin nga `src/domain/benefits.js`, një hartë e ngurtë sipas qëllimit —
--  pra çdo meditim i "Energji e lartë" tregonte të njëjtat dy rreshta.
--  Komenti aty e parashikonte këtë ditë: "kur klientja të japë tekstin e vet
--  për secilin, shtohet një kolonë te `meditations`".
--
--  Kolona mban një rresht për çdo përfitim, të ndarë me kthim rreshti.
--  Jo JSON: teksti shkruhet nga njerëz te phpMyAdmin, dhe një presje e
--  harruar te JSON-i e prish gjithë fushën në heshtje.
--
--  `NULL` do të thotë "pa tekst të vetin" — dhe atëherë aplikacioni kthehet
--  te harta e vjetër sipas qëllimit. Pra asnjë meditim nuk mbetet bosh.
--
--  ⚠️  PA `information_schema`. Përdoruesi MySQL i cPanel-it NUK ka të drejtë
--      mbi atë bazë (#1044) — e provuam te `18_nje_pajisje.sql`. Urdhri
--      jepet drejtpërdrejt.
--
--      Pasojë: një ekzekutim i dytë kthen `#1060 Duplicate column name`.
--      Ai gabim do të thotë "kolona ekziston tashmë" — pra puna është bërë.

SET NAMES utf8mb4;

ALTER TABLE meditations ADD COLUMN benefits TEXT NULL AFTER description;

-- Kontroll: kolona duhet të dalë në listë.
SHOW COLUMNS FROM meditations LIKE 'benefits';
