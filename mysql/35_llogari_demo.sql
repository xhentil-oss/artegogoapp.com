-- ═══════════════════════════════════════════════════════════════
--  LLOGARITË E SHQYRTUESVE TË GOOGLE PLAY
-- ═══════════════════════════════════════════════════════════════
--
--  Play Console, te seksioni "App access", kërkon një mënyrë me të cilën
--  shqyrtuesi hyn dhe e sheh aplikacionin të plotë. Pa të, shqyrtimi mbyllet
--  me "nuk arritëm të hyjmë" dhe aplikacioni refuzohet.
--
--  Dy pengesa te ky aplikacion:
--
--    1. ASGJË NUK ËSHTË FALAS. `12_no_free.sql` i bëri të 244 meditimet
--       premium, dhe `GET /audio/:id` kthen 402 pa abonim. Një llogari e
--       thjeshtë e lë shqyrtuesin para paywall-it; ai nuk sheh dot asgjë dhe
--       nuk ka si ta vlerësojë.
--
--    2. NJË LLOGARI — NJË PAJISJE. `18_nje_pajisje.sql` dhe `api/src/auth.js`
--       e nxjerrin jashtë sesionin e mëparshëm sapo e njëjta llogari hapet
--       diku tjetër (`code: "session_replaced"`). Shqyrtuesit e Google-it
--       punojnë në disa pajisje njëkohësisht, ndaj një llogari e vetme do t'i
--       nxirrte vetë jashtë njëri-tjetrin.
--
--       Prandaj janë TRI llogari, jo një. Secila shkruhet veçmas te Play
--       Console ("Add new instructions").
--
--  ⚠️  PARA SE TË EKZEKUTOHET: të tri llogaritë duhen hapur nga vetë
--      aplikacioni (Regjistrohu), me fjalëkalimet e zgjedhura nga ti.
--      Fjalëkalimi ruhet si hash i llogaritur nga serveri, ndaj nuk futet dot
--      me SQL. Ky skedar vetëm u jep abonimin.
--
--  ⚠️  FJALËKALIMET NUK SHKRUHEN KËTU. Ky skedar shkon te GitHub-i; shkoji
--      vetëm te Play Console, te fushat e veta.

SET NAMES utf8mb4;

UPDATE users
   SET is_premium            = 1,
       subscription_status   = 'active',
       subscription_plan     = 'lifetime',
       subscription_start_at = NOW(),
       -- Larg, që shqyrtimi të mos bjerë kurrë mbi një abonim të skaduar.
       subscription_end_at   = '2035-01-01 00:00:00',
       -- Prova shënohet si e përdorur: llogaria nuk ka nevojë për të.
       trial_used_at         = COALESCE(trial_used_at, NOW())
 WHERE email IN ('play1@drartegogo.com',
                 'play2@drartegogo.com',
                 'play3@drartegogo.com');

-- Kontroll: duhen tri rreshta, të tre 'active' dhe me is_premium = 1.
SELECT email, is_premium, subscription_status, subscription_plan, subscription_end_at
  FROM users
 WHERE email IN ('play1@drartegogo.com',
                 'play2@drartegogo.com',
                 'play3@drartegogo.com');
