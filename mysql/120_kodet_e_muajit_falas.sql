-- ═══════════════════════════════════════════════════════════════
--  MUAJI FALAS — 5 DHJETOR 2026 deri më 5 JANAR 2027
--
--  Fushatë e vetme, e kufizuar në kohë, e hapur vetëm me një nga 300 kodet që
--  dërgoi klientja. Një kod, një llogari, një herë.
--
--  ⚠️  KODET NUK DALIN KURRË TE FAQJA.
--
--      Dosja erdhi te `public/kopertina/`, dhe çdo gjë nën `public/` shërbehet
--      e hapur nga interneti: kushdo që merrte me mend emrin e skedarit do t'i
--      shkarkonte të treqindat. U zhvendos jashtë projektit më 18 nëntor 2026,
--      para se të ngarkohej diku. Pas këtij migrimi, e vërteta e kodeve rri
--      vetëm te kjo tabelë.
--
--  ⚠️  `used_at` MBETET EDHE PASI LLOGARIA FSHIHET (`ON DELETE SET NULL`).
--
--      Përndryshe fshirja e llogarisë do ta çlironte kodin, dhe i njëjti kod do
--      të jepte muaj pas muaji falas — e njëjta vrimë si te prova 3-ditore.
--
--  I sigurt për t'u ri-ekzekutuar: kodet hyjnë me `INSERT IGNORE`, ndaj
--  rrotullimi i dytë nuk i rikthen ato të përdorura në gjendjen e papërdorur.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

/* Gjendje e re e abonimit: dhuratë, jo blerje dhe jo provë. E ndarë, që ekrani
   të mos i thotë njeriut "Faturimi i radhës" për diçka që nuk faturohet. */
ALTER TABLE users
  MODIFY COLUMN subscription_status
  ENUM('active','cancelled','expired','trial','promo') NOT NULL DEFAULT 'expired';

/* Historiku i abonimit mëson një ngjarje të re. */
ALTER TABLE subscription_events
  MODIFY COLUMN event
  ENUM('trial_started','verified','cancelled','resumed','expired','restored','promo_redeemed')
  NOT NULL;

CREATE TABLE IF NOT EXISTS promo_codes (
  /* Kodi ËSHTË çelësi: dy rreshta me të njëjtin kod s'kanë kuptim. */
  code       CHAR(8)     NOT NULL,

  /* Emri i fushatës — që një fushatë e dytë të mos përzihet me këtë. */
  campaign   VARCHAR(32) NOT NULL DEFAULT 'dhjetor2026',

  used_at    DATETIME    NULL,
  used_by    CHAR(36)    NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (code),
  KEY idx_promo_used_by (used_by),
  KEY idx_promo_campaign (campaign, used_at),
  CONSTRAINT fk_promo_user FOREIGN KEY (used_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* Kontrolli: duhet `kode 300`, `te_perdorura 0`. */
SELECT
  (SELECT COUNT(*) FROM promo_codes WHERE campaign = 'dhjetor2026')                        AS kode,
  (SELECT COUNT(*) FROM promo_codes WHERE campaign = 'dhjetor2026' AND used_at IS NOT NULL) AS te_perdorura;
