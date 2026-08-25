import { useRef, useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  Check,
  Copy,
  Globe,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { T, radii, shadows } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { compactCount } from "../../lib/format.js";
import { copyText, shareText } from "../../lib/share.js";
import { intentMeta } from "../../domain/intent.js";
import { Leaf } from "../../components/icons/BrandIcons.jsx";

const EXCERPT_LENGTH = 150;

/** Postim i feed-it. Çdo veprim bën diçka të vërtetë — asnjë buton dekorativ. */
export function PostCard({ post, comments = [], onComment }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [flash, setFlash] = useState(null);
  const inputRef = useRef(null);

  const meta = intentMeta(post.intent);
  const isLong = post.text.length > EXCERPT_LENGTH;
  const body = expanded || !isLong ? post.text : post.text.slice(0, EXCERPT_LENGTH).trimEnd();
  const likes = post.likes + (liked ? 1 : 0);
  const commentCount = post.comments + comments.length;

  /** Konfirmim i shkurtër, që veprimi të mos ndodhë "në heshtje". */
  const confirm = (message) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 1800);
  };

  const share = async () => {
    setMenuOpen(false);
    const result = await shareText({
      title: `Arte Gogo · ${post.author}`,
      text: `${post.text}\n\n— ${post.author}, Arte Gogo`,
    });
    if (result === "copied") confirm("Teksti u kopjua");
    else if (result === "failed") confirm("Shpërndarja nuk u krye");
  };

  const copy = async () => {
    setMenuOpen(false);
    confirm((await copyText(post.text)) === "copied" ? "Teksti u kopjua" : "Kopjimi nuk u krye");
  };

  const openComposer = () => {
    setExpanded(true);
    setComposing(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const submitComment = () => {
    onComment?.(draft);
    setDraft("");
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
          <Leaf size={20} color="#fff" />
        </div>

        <div style={sx.flexText}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: T.ink, fontSize: 15, fontWeight: 700 }}>{post.author}</span>
            {post.verified && <BadgeCheck size={16} color={T.info} fill={T.info} style={{ color: "#fff" }} />}
            <span style={{ color: T.faint, fontSize: 14 }}>· {post.handle}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: T.faint, fontSize: 12.5, marginTop: 1 }}>
            {post.time} · <Globe size={12} color={T.faint} />
          </div>
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
          {isLong && !expanded && (
            <span onClick={() => setExpanded(true)} style={{ color: T.sub, fontWeight: 600, cursor: "pointer" }}>
              Shih më shumë
            </span>
          )}
        </p>
      </div>

      {/* ---------- imazhi (vend-mbajtës gradient) ---------- */}
      <div style={{ height: 260, background: tile(meta.g), position: "relative", ...sx.center }}>
        <div
          style={{
            ...sx.absoluteFill,
            background: "linear-gradient(160deg, rgba(255,255,255,0.12), rgba(0,0,0,0.25))",
          }}
        />
        <meta.icon size={70} color="rgba(255,255,255,0.9)" style={{ position: "relative" }} />
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
          {post.type}
        </span>
      </div>

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
        <button
          onClick={openComposer}
          style={{ ...sx.bareButton, color: T.faint, fontSize: 13.5, padding: "4px 0" }}
        >
          {commentCount} komente
        </button>
      </div>

      <div style={{ height: 1, background: T.line, margin: "0 14px" }} />

      {/* ---------- veprimet ---------- */}
      <footer style={{ display: "flex", padding: "4px 8px" }}>
        <ActionButton
          icon={<ThumbsUp size={19} fill={liked ? T.info : "none"} color={liked ? T.info : T.sub} />}
          label="Pëlqej"
          active={liked}
          onClick={() => setLiked(!liked)}
        />
        <ActionButton
          icon={<MessageCircle size={19} color={composing ? T.info : T.sub} />}
          label="Komento"
          active={composing}
          onClick={openComposer}
        />
        <ActionButton
          icon={<Bookmark size={19} fill={saved ? T.gold : "none"} color={saved ? T.gold : T.sub} />}
          label="Ruaj"
          active={saved}
          activeColor={T.gold}
          onClick={() => {
            setSaved(!saved);
            confirm(saved ? "Hequr nga të ruajturat" : "Ruajtur");
          }}
        />
        <ActionButton icon={<Share2 size={19} color={T.sub} />} label="Shpërndaj" onClick={share} />
      </footer>

      {composing && (
        <CommentThread
          comments={comments}
          draft={draft}
          onDraft={setDraft}
          onSubmit={submitComment}
          inputRef={inputRef}
        />
      )}

      {flash && <Toast message={flash} />}
    </article>
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
function CommentThread({ comments, draft, onDraft, onSubmit, inputRef }) {
  return (
    <div style={{ borderTop: `1px solid ${T.line}`, padding: "12px 14px 14px", background: T.bg2 }}>
      {comments.map((comment, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={circle(30, T.line)}>
            <Check size={14} color={T.sub} />
          </div>
          <div
            style={{
              ...sx.flexText,
              background: T.bg,
              borderRadius: 14,
              padding: "9px 12px",
              fontSize: 14,
              color: T.ink,
              lineHeight: 1.45,
            }}
          >
            {comment.text}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="Shkruaj një koment…"
          style={{
            ...sx.flexText,
            background: T.bg,
            border: `1px solid ${T.line}`,
            borderRadius: radii.pill,
            padding: "11px 16px",
            outline: "none",
            color: T.ink,
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!draft.trim()}
          aria-label="Dërgo komentin"
          className="ag-press"
          style={{
            ...circle(44, draft.trim() ? T.ink : T.line),
            border: "none",
            padding: 0,
            cursor: draft.trim() ? "pointer" : "default",
          }}
        >
          <Send size={17} color="#fff" />
        </button>
      </div>

      <div style={{ fontSize: 11.5, color: T.faint, marginTop: 8 }}>
        Komentet ruhen në këtë pajisje derisa të lidhet serveri.
      </div>
    </div>
  );
}

/** Konfirmim i shkurtër mbi kartelë. */
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
