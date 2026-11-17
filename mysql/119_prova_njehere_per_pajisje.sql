-- ═══════════════════════════════════════════════════════════════
--  PROVA FALAS — NJË HERË, JO NJË HERË PËR ÇDO EMAIL
--
--  Kërkesë e klientes (17 nëntor 2026): të mos regjistrohet dikush pa fund me
--  email-e të rinj për të marrë 3 ditë falas sa herë t'i duhen.
--
--  Deri tani e vetmja mbrojtje ishte `users.trial_used_at` — pra një shenjë
--  mbi LLOGARINË. Një llogari e re nuk e ka atë shenjë, ndaj prova rinisej me
--  çdo adresë të re. Shenja duhet të rrijë mbi diçka që nuk krijohet falas.
--
--  Kjo tabelë mban pikërisht atë: një gjurmë të hash-uar, dhe rregullin se një
--  gjurmë e merr provën VETËM NJË HERË.
--
--  ⚠️  `kind` është enum me tre vlera sepse gjurma vjen nga tre burime me forcë
--      shumë të ndryshme:
--
--        device  — identifikuesi i instalimit. Funksionon sot, pa asnjë
--                  shërbim pagese. Ndalon rastin e zakonshëm (i njëjti telefon,
--                  pesë email-e), por fshihet me çinstalim ose me pastrim të
--                  të dhënave. Pengesë, jo mur.
--
--        card    — `fingerprint` i kartës nga Stripe/Paddle: një hash i
--                  qëndrueshëm që e njeh TË NJËJTËN kartë edhe kur përdoret te
--                  një llogari tjetër. Ky është muri i vërtetë, dhe hyn në punë
--                  sapo të vendoset shërbimi i pagesave. Kolona ekziston që
--                  atëherë të shtohet vetëm një rresht kodi, jo një migrim.
--
--        ip      — adresa e rrjetit. E dobët me qëllim: në Shqipëri një operator
--                  celular u jep qindra njerëzve të njëjtën adresë. Ruhet për
--                  shikim, JO për bllokim.
--
--  ⚠️  NUMRI I KARTËS NUK RUHET KURRË KËTU, as i hash-uar nga ne. Ruhet vetëm
--      `fingerprint`-i që e jep vetë shërbimi i pagesave. Numri i kartës nuk
--      duhet të kalojë fare nga serveri ynë — ajo është rregull PCI, dhe shkelja
--      e saj nuk është gabim teknik por përgjegjësi ligjore.
--
--  ⚠️  `ON DELETE SET NULL`, JO CASCADE.
--
--      Nëse gjurma do të fshihej bashkë me llogarinë, atëherë "fshi llogarinë →
--      hap një tjetër" do të ishte butoni zyrtar për provë të pafundme. Rreshti
--      mbetet; vetëm lidhja me përdoruesin bie.
--
--  I sigurt për t'u ri-ekzekutuar.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS trial_claims (
  id          CHAR(36) NOT NULL DEFAULT (UUID()),

  kind        ENUM('device','card','ip') NOT NULL,

  /* SHA-256 në hex — gjithmonë 64 shenja. Vetë vlera burimore nuk ruhet. */
  fingerprint CHAR(64) NOT NULL,

  /* NULL pasi llogaria fshihet — gjurma mbijeton, pronari jo. */
  user_id     CHAR(36) NULL,

  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  /* Rregulli i vërtetë i kësaj tabele, i shkruar te skema e jo te kodi:
     një gjurmë, një provë. Edhe dy kërkesa në të njëjtin çast nuk e kalojnë. */
  UNIQUE KEY uq_trial_claim (kind, fingerprint),

  KEY idx_trial_claim_user (user_id),
  CONSTRAINT fk_trial_claim_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* Kontrolli. `gjurme` do të jetë 0 sot — mbushet me provën e parë të re. */
SELECT
  (SELECT COUNT(*) FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'trial_claims') AS tabela,
  (SELECT COUNT(*) FROM trial_claims)                                 AS gjurme,
  (SELECT COUNT(*) FROM users WHERE trial_used_at IS NOT NULL)        AS prova_te_dhena;
