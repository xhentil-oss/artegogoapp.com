-- 78 — Kopertinat e para të "Këngë motivuese"
--
-- 13 nëntor 2026. Klientja dërgoi tetë figura, 1254×1254, katrore —
-- pikërisht formati që pret `TrackCard` te rrjeta dy-kolonëshe.
--
-- Tetë nga tetëmbëdhjetë. Dhjetë këngët e tjera vazhdojnë me kapakun e
-- gjeneruar, ku titulli shkruhet mbi gradient; `CoverArt` e vendos vetë
-- këtë kur `cover_url` është NULL, ndaj ekrani nuk thyhet nga përzierja.
--
-- ⚠️  KËRKON NGARKIM PËRPARA: të tetë figurat te `public_html/kopertina/`.
--     Figurat NUK janë te dosja e këngëve — `/kopertina/` është e përbashkët
--     për gjithë aplikacionin, dhe `cover_url` e nis shtegun me `/`.
--
-- Emrat e skedarëve u ndreqën para ngarkimit: hapësirat u bënë vija, dhe
-- dy gabime shtypi nga shkarkimi u hoqën — `oobservuesi` me dy o-ra, dhe
-- `ndiej falenderim-2`, ku `-2` ishte shenja që shfletuesi i vë një
-- skedari të shkarkuar dy herë, jo pjesë e emrit.

SET NAMES utf8mb4;

UPDATE meditations SET cover_url = '/kopertina/bolleku-eshte-e-drejta-ime.jpeg'
 WHERE id = 'cc7f85cd-deab-11f1-af71-107c614af9b1';

UPDATE meditations SET cover_url = '/kopertina/dicka-e-mrekullueshme.jpeg'
 WHERE id = 'cc7f894b-deab-11f1-af71-107c614af9b1';

UPDATE meditations SET cover_url = '/kopertina/falja-e-vetes.jpeg'
 WHERE id = 'cc7f89df-deab-11f1-af71-107c614af9b1';

UPDATE meditations SET cover_url = '/kopertina/jam-ketu.jpeg'
 WHERE id = 'cc7f8c3b-deab-11f1-af71-107c614af9b1';

UPDATE meditations SET cover_url = '/kopertina/kenga-e-manifestimit.jpeg'
 WHERE id = 'cc7f8a57-deab-11f1-af71-107c614af9b1';

UPDATE meditations SET cover_url = '/kopertina/kthehu-ti.jpeg'
 WHERE id = 'cc7f8ca3-deab-11f1-af71-107c614af9b1';

UPDATE meditations SET cover_url = '/kopertina/ndiej-falenderim.jpeg'
 WHERE id = 'cc7f8cf3-deab-11f1-af71-107c614af9b1';

UPDATE meditations SET cover_url = '/kopertina/observuesi.jpeg'
 WHERE id = 'cc7f8d43-deab-11f1-af71-107c614af9b1';

-- Tetë herë "1 row affected".


-- ───────────────────────────────────────────────────────────────
--  KONTROLL
-- ───────────────────────────────────────────────────────────────
-- 18 rreshta: tetë me kopertinë, dhjetë me "—".

SELECT m.title,
       COALESCE(SUBSTRING_INDEX(m.cover_url, '/', -1), '—') AS kopertina
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'kenge-motivuese'
   AND m.published_at IS NOT NULL
   AND m.is_block = 0
 ORDER BY m.cover_url IS NULL, m.title;
