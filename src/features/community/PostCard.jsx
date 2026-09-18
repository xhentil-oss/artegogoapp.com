import { useState } from "react";
import {
  Bookmark,
  Copy,
  Heart,
  MoreHorizontal,
  Play,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { T, radii, shadows } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { compactCount } from "../../lib/format.js";
import { copyText, shareText } from "../../lib/share.js";
import { intentMeta } from "../../domain/intent.js";
import { findMeditation } from "../../services/contentRepository.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { useCommunity } from "../../store/CommunityContext.jsx";
import { CoverArt } from "../../components/art/CoverArt.jsx";

const EXCERPT_LENGTH = 150;

/**
 * Adresa e aplikacionit, për tekstin e shpërndarjes.
 *
 * `origin`, jo adresa e plotë: e tanishmja mund të mbajë `?reset=…` ose gjurmë
 * të tjera të sesionit, dhe ato nuk duhen dërguar te të tjerët.
 */
const appUrl = () => (typeof window === "undefined" ? "" : window.location.origin);

/** Postim i feed-it. Çdo veprim bën diçka të vërtetë — asnjë buton dekorativ. */
export function PostCard({ post }) {
  /*
   * Pëlqimi dhe ruajtja jetojnë te `store/CommunityContext`, jo këtu.
   *
   * ⚠️  Më parë ishin dy `useState` te kjo kartelë — pra gjendja e tyre
   *     zhdukej sapo komponenti çmontohej: një kalim te "Meditime" dhe kthimi
   *     te feed-i i fshinte të dyja, dhe numri i pëlqimeve kthehej te ai i
   *     serverit. Tani shkruhen te databaza, ndaj pëlqimi shihet edhe nga
   *     pajisja tjetër, dhe "Ruaj" mbush listën te profili.
   */
  const { isLiked, toggleLike, likeCount, isSaved, toggleSave } = useCommunity();
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [flash, setFlash] = useState(null);

  const meta = intentMeta(post.intent);

  /*
   * Meditimi i bashkangjitur kërkohet një herë, gjatë render-it, sepse tani
   * kartela tregon edhe kapakun, çastin dhe kohëzgjatjen — jo vetëm titullin.
   * Mund të mos gjendet (i papublikuar, i fshirë): atëherë bien vetëm fushat
   * që s'i ka postimi, dhe bashkëngjitja mbetet e hapshme.
   */
  /* Toleron edhe mungesën, edhe një varg të vetëm — postimet e vjetra s'e kanë. */
  const images = Array.isArray(post.images) ? post.images : post.image ? [post.image] : [];
  const video = typeof post.video === "string" ? post.video.trim() : "";

  const bashkangjitur = post.meditationId ? findMeditation(post.meditationId) : null;
  const metaMed = intentMeta(bashkangjitur?.intent ?? post.intent);
  /* `dur` te katalogu është minuta; `meditationDuration` te postimi sekonda. */
  const minuta = bashkangjitur?.dur ?? (post.meditationDuration ? Math.round(post.meditationDuration / 60) : null);
  const isLong = post.text.length > EXCERPT_LENGTH;
  const body = expanded || !isLong ? post.text : post.text.slice(0, EXCERPT_LENGTH).trimEnd();

  const liked = isLiked(post.id);
  const saved = isSaved(post.id);
  const likes = likeCount(post);

  const { playItems } = usePlayback();

  /**
   * Hap meditimin e bashkangjitur.
   *
   * ⚠️  Kalon nga `playItems`, jo drejt te player-i: ai kontrollon abonimin dhe
   *     hap paywall-in kur duhet. Pa këtë, një postim i komunitetit do të ishte
   *     rrugë e hapur drejt përmbajtjes premium — dhe rregulli i tre meditimeve
   *     falas do të anashkalohej me një klikim.
   */
  const openAttached = () => {
    const meditation = findMeditation(post.meditationId);
    if (meditation) {
      playItems(meditation);
      return;
    }
    /* Nuk gjendet te katalogu — p.sh. u shpublikua pas botimit të postimit. */
    confirm("Ky meditim nuk është më i disponueshëm.");
  };

  /** Konfirmim i shkurtër, që veprimi të mos ndodhë "në heshtje". */
  const confirm = (message) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 1800);
  };

  /**
   * Shpërndan postimin.
   *
   * ⚠️  Dërgohet edhe adresa e aplikacionit. Pa të, shpërndarja ishte tekst i
   *     zhveshur: marrësi lexonte citatin dhe nuk kishte ku të shkonte më tej.
   *     Nuk është link i postimit — ai do të kërkonte një rrugë publike për
   *     një postim të vetëm, që nuk ekziston ende.
   *
   * Te telefoni hapet fleta native (WhatsApp, Instagram, mesazhe); te
   * kompjuteri, ku ajo shpesh mungon, teksti kopjohet — dhe thuhet me shkrim,
   * që veprimi të mos dukët i pandodhur.
   */
  const share = async () => {
    setMenuOpen(false);
    const result = await shareText({
      title: `Arte Gogo · ${post.author}`,
      text: `${post.text}\n\n— ${post.author}, Arte Gogo`,
      url: appUrl(),
    });
    if (result === "shared") confirm("U shpërndau");
    else if (result === "copied") confirm("Teksti u kopjua");
    else if (result === "failed") confirm("Shpërndarja nuk u krye");
  };

  const copy = async () => {
    setMenuOpen(false);
    confirm((await copyText(post.text)) === "copied" ? "Teksti u kopjua" : "Kopjimi nuk u krye");
  };

  return (
    <article
      style={{
        background: T.bg,
        borderRadius: radii.lg,
        overflow: "hidden",
        boxShadow: shadows.soft,
        border: `1px solid ${T.line}`,
        position: "relative",
      }}
    >
      {/* ---------- autori ---------- */}
      <header style={{ display: "flex", alignItems: "center", gap: 11, padding: "14px 14px 10px" }}>
        <div style={circle(44, tile(meta.g))}>
          {/* Logoja e hyrjes — e njëjta si te `BottomNav`: e zezë mbi sfond
              të tejdukshëm, ndaj kthehet e bardhë me filtër mbi gradientin. */}
          <img
            src="/transparent-logo-2.png"
            alt=""
            aria-hidden="true"
            style={{ height: 22, width: "auto", filter: "brightness(0) invert(1)" }}
          />
        </div>

        <div style={sx.flexText}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: T.ink, fontSize: 15, fontWeight: 700 }}>{post.author}</span>
          </div>
          <div style={{ color: T.faint, fontSize: 12.5, marginTop: 1 }}>{post.time}</div>
        </div>

        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Më shumë"
          className="ag-press"
          style={{ ...sx.bareButton, ...sx.center, width: 40, height: 40 }}
        >
          <MoreHorizontal size={22} color={T.sub} />
        </button>
      </header>

      {menuOpen && <PostMenu onCopy={copy} onShare={share} onClose={() => setMenuOpen(false)} />}

      {/* ---------- teksti ---------- */}
      <div style={{ padding: "0 14px 12px" }}>
        <p style={{ color: T.ink, fontSize: 15, lineHeight: 1.55, margin: 0, whiteSpace: "pre-line" }}>
          {body}
          {isLong && !expanded && "… "}
          {/* Një çelës i vetëm, jo vetëm hapje: pa "Shih më pak" teksti i gjatë
              mbetej i hapur përgjithmonë dhe shtynte poshtë gjithë feed-in. */}
          {isLong && (
            <span
              role="button"
              tabIndex={0}
              onClick={() => setExpanded(!expanded)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setExpanded(!expanded)}
              style={{ color: T.sub, fontWeight: 600, cursor: "pointer" }}
            >
              {expanded ? " Shih më pak" : "Shih më shumë"}
            </span>
          )}
        </p>
      </div>

      {/* ---------- imazhet ---------- */}
      {/*
        ⚠️  Më parë këtu vizatohej GJITHMONË një drejtkëndësh gradienti me
            ikonën e çastit — një vend-mbajtës që dukej si foto e vërtetë dhe
            nuk mund të hiqej. Tani pamja varet nga `post.images`: bosh do të
            thotë postim vetëm me tekst, një adresë jep një foto, disa adresa
            japin karusel. Zgjedhja bëhet te paneli i admin-it.
      */}
      {video ? (
        <PostVideo src={video} label={post.type} />
      ) : (
        images.length > 0 && <PostImages images={images} label={post.type} />
      )}

      {/* ---------- meditimi i bashkangjitur ---------- */}
      {/*
        Seksioni 6.6: "Postimet mund të kenë një meditim të bashkangjitur që
        hapet kur prekesh."

        ⚠️  Titulli merret nga POSTIMI, jo nga katalogu. Serveri e kthen me
            `JOIN`; kërkimi te katalogu do të dështonte për një meditim të
            papublikuar, dhe bashkëngjitja do të dukej bosh pa asnjë shenjë pse.
      */}
      {post.meditationId && (
        <button
          onClick={openAttached}
          className="ag-press"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            width: "100%",
            margin: "12px 14px 0",
            maxWidth: "calc(100% - 28px)",
            padding: "10px 12px",
            background: T.bg2,
            border: `1px solid ${T.line}`,
            borderRadius: radii.lg,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {/* Kapaku i vërtetë, jo një rreth me ikonë: `CoverArt` bie vetë te
              peizazhi procedural nëse fotoja mungon ose nuk ngarkohet. */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <CoverArt intent={bashkangjitur?.intent ?? post.intent} image={bashkangjitur?.cover} />
          </div>

          <div style={sx.flexText}>
            <div
              style={{
                color: T.faint,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.1,
                textTransform: "uppercase",
              }}
            >
              Meditim në Arte Gogo
            </div>
            <div style={{ color: T.ink, fontSize: 14.5, fontWeight: 700, marginTop: 2, ...sx.truncate }}>
              {post.meditationTitle ?? bashkangjitur?.title ?? "Meditim i bashkangjitur"}
            </div>
            <div style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>
              {[metaMed.label, minuta ? `${minuta} min` : null].filter(Boolean).join(" · ")}
            </div>
          </div>

          {/* Gradienti i çastit të MEDITIMIT, jo i postimit — te pamja e
              klientes rrethi është ar sepse meditimi është "Bollëk". */}
          <div style={{ ...circle(40, tile(metaMed.g)), ...sx.center, flexShrink: 0 }}>
            <Play size={17} color="#fff" style={{ marginLeft: 2 }} />
          </div>
        </button>
      )}

      {/* ---------- numëratorët ---------- */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px 9px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex" }}>
            <ReactionPip color={T.info}>
              <ThumbsUp size={10} color="#fff" fill="#fff" />
            </ReactionPip>
            <ReactionPip color={T.like} overlap>
              <Heart size={10} color="#fff" fill="#fff" />
            </ReactionPip>
          </div>
          <span style={{ color: T.sub, fontSize: 13.5 }}>{compactCount(likes)}</span>
        </div>
      </div>

      <div style={{ height: 1, background: T.line, margin: "0 14px" }} />

      {/* ---------- veprimet ---------- */}
      <footer style={{ display: "flex", padding: "4px 8px" }}>
        <ActionButton
          icon={<ThumbsUp size={19} fill={liked ? T.info : "none"} color={liked ? T.info : T.sub} />}
          label="Pëlqej"
          active={liked}
          onClick={() => toggleLike(post.id)}
        />
        <ActionButton
          icon={<Bookmark size={19} fill={saved ? T.gold : "none"} color={saved ? T.gold : T.sub} />}
          label="Ruaj"
          active={saved}
          activeColor={T.gold}
          onClick={() => {
            /* Mesazhi vjen nga gjendja E RE, që kthen `toggleSave` — jo nga
               `saved`, i cili te ky render mban ende atë të vjetër. */
            confirm(toggleSave(post) ? "Ruajtur te profili" : "Hequr nga të ruajturat");
          }}
        />
        <ActionButton icon={<Share2 size={19} color={T.sub} />} label="Shpërndaj" onClick={share} />
      </footer>

      {flash && <Toast message={flash} />}
    </article>
  );
}

/**
 * Videoja e postimit.
 *
 * ⚠️  Pa `autoPlay`: një video që nis vetë mes një feed-i meditimi është e
 *     kundërta e asaj që kërkon ky aplikacion. Nis vetëm kur preket.
 *
 * `playsInline` është i domosdoshëm për iPhone — pa të, videoja hapet me
 * player-in e sistemit në ekran të plotë dhe e nxjerr përdoruesin nga feed-i.
 */
function PostVideo({ src, label }) {
  return (
    <div style={{ position: "relative", background: "#000" }}>
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }}
      />

      {label && (
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: 10,
            letterSpacing: 1.5,
            padding: "5px 12px",
            borderRadius: 20,
            textTransform: "uppercase",
            backdropFilter: "blur(4px)",
            pointerEvents: "none",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Imazhet e postimit: një foto, ose karusel kur janë disa.
 *
 * Karuseli është rrëshqitje horizontale me `scroll-snap`, jo një bibliotekë:
 * gishti e lëviz vetë, tastiera po ashtu, dhe pa asnjë kilobajt shtesë.
 * Pikat poshtë lexohen nga pozicioni i rrëshqitjes, ndaj tregojnë gjithmonë
 * të vërtetën edhe kur foto ndërrohet me gisht.
 */
function PostImages({ images, label }) {
  const [index, setIndex] = useState(0);
  const vetem = images.length === 1;

  const onScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    setIndex(Math.round(scrollLeft / Math.max(clientWidth, 1)));
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        className="ag-scroll-x"
        onScroll={vetem ? undefined : onScroll}
        style={{
          display: "flex",
          overflowX: vetem ? "hidden" : "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        {images.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              flex: "0 0 100%",
              width: "100%",
              height: 260,
              objectFit: "cover",
              display: "block",
              scrollSnapAlign: "start",
            }}
          />
        ))}
      </div>

      {label && (
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: 10,
            letterSpacing: 1.5,
            padding: "5px 12px",
            borderRadius: 20,
            textTransform: "uppercase",
            backdropFilter: "blur(4px)",
          }}
        >
          {label}
        </span>
      )}

      {!vetem && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {images.map((src, i) => (
            <span
              key={`pike-${src}-${i}`}
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === index ? "#fff" : "rgba(255,255,255,0.55)",
                transition: "width .2s, background .2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Menu me veprime që funksionojnë pa backend. */
function PostMenu({ onCopy, onShare, onClose }) {
  return (
    <>
      {/* shtresë e padukshme: klikimi jashtë e mbyll menunë */}
      <button
        onClick={onClose}
        aria-label="Mbyll menunë"
        style={{ position: "fixed", inset: 0, zIndex: 1, background: "transparent", border: "none" }}
      />
      <div
        style={{
          position: "absolute",
          top: 52,
          right: 12,
          zIndex: 2,
          background: T.bg,
          border: `1px solid ${T.line}`,
          borderRadius: 14,
          boxShadow: shadows.lifted,
          overflow: "hidden",
          minWidth: 180,
        }}
      >
        <MenuItem icon={<Copy size={16} color={T.sub} />} label="Kopjo tekstin" onClick={onCopy} />
        <div style={{ height: 1, background: T.line }} />
        <MenuItem icon={<Share2 size={16} color={T.sub} />} label="Shpërndaj" onClick={onShare} />
      </div>
    </>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ag-press"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        background: "none",
        border: "none",
        padding: "13px 14px",
        cursor: "pointer",
        fontSize: 14,
        color: T.ink,
        textAlign: "left",
      }}
    >
      {icon} {label}
    </button>
  );
}

/**
 * Komentet e ruajtura në pajisje. Deri sa të vijë backend-i, i shohin
 * vetëm ata në këtë telefon — thuhet hapur në UI, që të mos mashtrojë.
 */
function Toast({ message }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        background: T.ink,
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        padding: "9px 16px",
        borderRadius: radii.pill,
        boxShadow: shadows.lifted,
        animation: "fadeUp .25s ease both",
        zIndex: 3,
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}

function ReactionPip({ color, overlap, children }) {
  return (
    <div style={{ ...circle(20, color), border: "2px solid #fff", ...(overlap ? { marginLeft: -6 } : null) }}>
      {children}
    </div>
  );
}

function ActionButton({ icon, label, active, activeColor = T.info, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ag-press"
      style={{
        flex: 1,
        ...sx.center,
        gap: 7,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "11px 4px",
        borderRadius: 8,
        color: active ? activeColor : T.sub,
        fontSize: 13.5,
        fontWeight: 600,
      }}
    >
      <span style={{ animation: active ? "pop .35s ease" : "none" }}>{icon}</span> {label}
    </button>
  );
}
