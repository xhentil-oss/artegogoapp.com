-- 75 — "Bollëku është e Drejta Ime": një skedar, dy tituj
--
-- 13 nëntor 2026. Klientja vuri re se "Bollëku është e Drejta Ime" nuk dukej
-- te "Këngë motivuese", dhe tregoi se skedari ndodhet, i quajtur
-- `Bollëku është e Drejta Ime - Afirmim për Bollëk (Tekst origjinal nga
-- Dr. Marvin Bundo).mp3`.
--
-- ⚠️  SKEDARI NUK MUNGON. Ai mp3 është BAJT PËR BAJT i njëjti me
--     `Diçka e mrekullueshme (Teksti nga Dr. Arte Gogo).mp3`:
--
--         9f1bf86f288a74b62225724b1e7149a2   të dy, 3 017 755 bajt, 176,007 s
--
--     Dhe i njëjti me atë që serveri jep sot te
--     `/meditime/kenge-motivuese/dicka-e-mrekullueshme.mp3` (MD5 identik).
--
--     Pra lista e 18 titujve u mbyll me 17 skedarë sepse DY tituj tregonin
--     drejt NJË regjistrimi të vetëm — jo sepse njëri skedar humbi rrugës.
--     Shkarkimi i dytë e ruajti të njëjtin audio me emër tjetër, si rasti
--     `Vlera jote je ti` / `Toka do që të dëgjohet` më 12 nëntor.
--
--     Etiketat ID3 janë bosh te të dy, ndaj skedari vetë nuk e thotë dot se
--     cili titull është i tiji. Kjo kërkon vesh, jo kod.
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RASTI A — po ta dëgjosh dhe të jetë "Bollëku është e Drejta Ime"
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Atëherë rreshti është i botuar me titull të gabuar. E ndreq VETËM titulli;
-- shtegu i skedarit (`dicka-e-mrekullueshme.mp3`) nuk preket, sepse ai është
-- emër i brendshëm që nuk e sheh askush — ndërrimi i tij do të kërkonte një
-- ngarkim të ri pa asnjë përfitim. Dhe atëherë ajo që mungon vërtet është
-- "Diçka e mrekullueshme", që duhet shkarkuar nga e para.
--
-- Hiq dy vijat para UPDATE-it dhe ekzekutoje:

-- UPDATE meditations
--    SET title = 'Bollëku është e Drejta Ime'
--  WHERE id = 'cc7f85cd-deab-11f1-af71-107c614af9b1';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RASTI B — po të jetë vërtet "Diçka e mrekullueshme"
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Databaza rri si është. Mungon audioja e "Bollëku është e Drejta Ime" dhe
-- duhet shkarkuar përsëri nga burimi — ajo që u ruajt më 13 nëntor 09:58
-- është kopje e gabuar.
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Kontroll: cila këngë mban sot 176 sekonda
SELECT m.id, m.title, m.duration_sec, m.audio_url
  FROM meditations m
  JOIN techniques t ON t.id = m.technique_id
 WHERE t.slug = 'kenge-motivuese'
   AND m.duration_sec = 176;
