import { Send, User } from "lucide-react";
import { T, radii, shadows } from "../../theme/tokens.js";
import { circle } from "../../theme/styles.js";
import { listFeed } from "../../services/contentRepository.js";
import { useSession } from "../../store/SessionContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";
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
      {/* Titulli u hoq: hero-ja mbi nën-tabet e mban tashmë identitetin e
          skedës, dhe dy tituj njëri mbi tjetrin zinin gjysmën e ekranit. */}
      {isAdmin && <Composer />}

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

/**
 * Kutia e postimit — vetëm për admin, siç e përcakton specifikimi.
 *
 * Më parë shfaqej për këdo, me tekstin "Çfarë ke në mendje?" dhe një buton që
 * nuk bënte asgjë: një kontroll i vdekur që u premtonte përdoruesve diçka që
 * nuk e kishin. Tani çon te paneli i admin-it, ku postimi shkruhet vërtet dhe
 * mund t'i bashkëngjitet një meditim.
 */
function Composer() {
  const { openAdmin } = useNavigation();

  return (
    <button
      onClick={() => openAdmin("community")}
      className="ag-press"
      style={{
        width: "calc(100% - 28px)",
        margin: "12px 14px",
        background: T.bg,
        border: "none",
        borderRadius: 14,
        padding: 14,
        boxShadow: shadows.raised,
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ ...circle(40, T.bg2), border: `1px solid ${T.line}`, flexShrink: 0 }}>
        <User size={20} color={T.faint} />
      </div>

      <span
        style={{
          flex: 1,
          background: T.bg2,
          borderRadius: radii.pill,
          padding: "11px 18px",
          color: T.faint,
          fontSize: 14.5,
        }}
      >
        Shkruaj një postim…
      </span>

      <span
        style={{
          background: T.ink,
          color: "#fff",
          borderRadius: 20,
          padding: "9px 16px",
          fontSize: 13,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <Send size={14} /> Posto
      </span>
    </button>
  );
}
