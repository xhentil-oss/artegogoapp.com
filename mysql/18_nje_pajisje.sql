-- ═══════════════════════════════════════════════════════════════
--  NJË LLOGARI — NJË PAJISJE
-- ═══════════════════════════════════════════════════════════════
--
--  Kërkesë e klientes (8 tetor 2026): një llogari e hapur te një telefon nuk
--  duhet të punojë njëkohësisht diku tjetër; hapja e dytë e nxjerr të parën.
--
--  Kolona mban sesionin E FUNDIT të hapur. Çdo hyrje shkruan një vlerë të re
--  dhe token-i i ri e mban brenda; `requireAuth` i krahason dhe refuzon çdo
--  token që mban një sesion të vjetruar.
--
--  ⚠️  `NULL` do të thotë "pa kontroll". Llogaritë ekzistuese e kanë bosh
--      derisa të hyjnë sërish, ndaj vendosja nuk nxjerr askënd jashtë në çast
--      — rregulli nis të vlerë nga hyrja e radhës e secilit.
--
--  ⚠️  PA `information_schema`. Versioni i parë e kontrollonte aty nëse kolona
--      ekzistonte, që importi të ishte i përsëritshëm. Përdoruesi MySQL i
--      cPanel-it NUK ka të drejtë mbi atë bazë (#1044), ndaj kontrolli
--      dështonte dhe me të edhe ndryshimi. Këtu urdhri jepet drejtpërdrejt.
--
--      Pasojë: një import i dytë kthen `#1060 Duplicate column name`. Ai
--      gabim do të thotë "kolona ekziston tashmë" — pra puna është bërë.

ALTER TABLE users ADD COLUMN session_id CHAR(36) NULL;

-- Kontroll: kolona duhet të dalë në listë.
SHOW COLUMNS FROM users LIKE 'session_id';
