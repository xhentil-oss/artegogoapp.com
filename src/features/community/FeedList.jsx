import { Send, User } from "lucide-react";
import { T, layout, radii, shadows } from "../../theme/tokens.js";
import { circle } from "../../theme/styles.js";
import { listFeed } from "../../services/contentRepository.js";
import { useSession } from "../../store/SessionContext.jsx";
import { PostCard } from "./PostCard.jsx";
import { useFeedComments } from "./useFeedComments.js";

/**
 * Feed-i i frymëzimit.
 *
 * Komentet mbahen KËTU, jo brenda çdo kartele: të gjitha postimet ndajnë të
 * njëjtin çelës ruajtjeje, ndaj kopje të pavarura state-i do të shkruanin
 * njëra mbi tjetrën.
 */
export function FeedList() {
  const { isAdmin } = useSession();
  const { commentsFor, addComment } = useFeedComments();

  return (
    <div style={{ paddingBottom: 8, background: T.bg2, minHeight: "60vh" }}>
      <header style={{ padding: `8px ${layout.gutter}px 16px`, background: T.bg }}>
        <h1
          style={{
            fontSize: "clamp(24px, 8vw, 30px)",
            fontWeight: 800,
            color: T.ink,
            margin: "0 0 4px",
            letterSpacing: -0.5,
          }}
        >
          Komuniteti
        </h1>
        <p style={{ fontSize: 15, color: T.sub, margin: 0 }}>Frymëzim i përditshëm nga Arte Gogo</p>
      </header>

      <Composer isAdmin={isAdmin} />

      <div className="ag-stagger" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 14px" }}>
        {listFeed().map((post) => (
          <PostCard
            key={post.id}
            post={post}
            comments={commentsFor(post.id)}
            onComment={(text) => addComment(post.id, text)}
          />
        ))}
      </div>
    </div>
  );
}

function Composer({ isAdmin }) {
  return (
    <div
      style={{
        margin: "12px 14px",
        background: T.bg,
        borderRadius: 14,
        padding: 14,
        boxShadow: shadows.raised,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ ...circle(40, T.bg2), border: `1px solid ${T.line}` }}>
        <User size={20} color={T.faint} />
      </div>

      <div style={{ flex: 1, background: T.bg2, borderRadius: radii.pill, padding: "11px 18px", color: T.faint, fontSize: 14.5 }}>
        {isAdmin ? "Shkruaj një postim…" : "Çfarë ke në mendje?"}
      </div>

      {isAdmin && (
        <button
          className="ag-press"
          style={{
            background: T.ink,
            color: "#fff",
            border: "none",
            borderRadius: 20,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <Send size={14} /> Posto
        </button>
      )}
    </div>
  );
}
