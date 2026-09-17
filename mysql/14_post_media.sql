-- ═══════════════════════════════════════════════════════════════
--  KARUSELI — disa imazhe për një postim
--
--  `community_posts` mban NJË media: `media_url` + `media_type`. Kjo mjafton
--  për një foto ose një video, por jo për një karusel — dhe paneli tashmë e
--  lejon zgjedhjen e disa fotove.
--
--  ⚠️  Kolonat e vjetra NUK hiqen. Ato mbeten burimi i medias së parë, ndaj
--      çdo postim i botuar deri sot vazhdon të shfaqet pa u prekur, dhe një
--      klient i vjetër (aplikacion i pandërruar te telefoni) vazhdon ta lexojë
--      atë që lexonte. Tabela e re është SHTESË, jo zëvendësim.
--
--  ⚠️  Radha ruhet te `position`, jo te `created_at`. Dy imazhe të shtuara në
--      të njëjtin sekond do të kishin të njëjtën kohë, dhe karuseli do t'i
--      tregonte sipas humorit të bazës.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS community_post_media (
  id         CHAR(36)              NOT NULL DEFAULT (UUID()),
  post_id    CHAR(36)              NOT NULL,

  /* E njëjta formë si `community_posts.media_url` — adresë e plotë publike. */
  media_url  TEXT                  NOT NULL,
  media_type ENUM('image','video') NOT NULL,

  /* 0 = e para që shihet. Unike për postim, që radha të mos dyfishohet. */
  position   TINYINT UNSIGNED      NOT NULL DEFAULT 0,

  created_at DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_post_position (post_id, position),
  KEY idx_post_media (post_id),

  /* Kur postimi fshihet vërtet, media e tij ikën bashkë me të — përndryshe do
     të mbeteshin rreshta që nuk i referohen askujt. */
  CONSTRAINT fk_post_media_post FOREIGN KEY (post_id)
    REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────
--  Bartja e postimeve ekzistuese.
--
--  Çdo postim që ka tashmë një media e merr atë si element të parë të
--  karuselit. `NOT EXISTS` e bën këtë skript të përsëritshëm pa dëm: po u
--  rrodh dy herë, rreshtat nuk dyfishohen.
-- ───────────────────────────────────────────────────────────────
INSERT INTO community_post_media (post_id, media_url, media_type, position)
SELECT p.id, p.media_url, p.media_type, 0
  FROM community_posts p
 WHERE p.media_url IS NOT NULL
   AND p.media_type IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM community_post_media m WHERE m.post_id = p.id AND m.position = 0
   );
