import { Clock, Play } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { listLiveSessions } from "../../services/contentRepository.js";
import { LiveDot } from "../../components/ui/Badges.jsx";

/** Transmetimet live dhe workshopet. */
export function LiveScreen() {
  return (
    <div style={sx.screen}>
      <header style={{ textAlign: "center", padding: "30px 24px 24px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#FFE5E9",
            border: "1px solid #FFC2CC",
            borderRadius: 24,
            padding: "8px 18px",
            marginBottom: 22,
          }}
        >
          <LiveDot size={9} />
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, color: T.ink }}>LIVE</span>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, color: T.ink, margin: "0 0 12px", letterSpacing: -0.3 }}>
          Transmetimet <span style={{ color: T.sub }}>Live</span>
        </h2>
        <p
          style={{
            fontSize: 15,
            color: T.sub,
            margin: "0 auto",
            lineHeight: 1.6,
            maxWidth: 360,
          }}
        >
          Ndiqni sesionet tona live të meditimit, workshopeve dhe seancave të koçingut në kohë reale.
        </p>
      </header>

      <div
        className="ag-stagger"
        style={{ display: "flex", flexDirection: "column", gap: 16, padding: `0 ${layout.gutter}px 8px` }}
      >
        {listLiveSessions().map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      <p style={{ textAlign: "center", color: T.faint, fontSize: 12.5, padding: "18px 30px 0", lineHeight: 1.5 }}>
        Anëtarët Premium marrin njoftim para çdo transmetimi live.
      </p>
    </div>
  );
}

function SessionCard({ session }) {
  return (
    <div
      className="ag-card"
      style={{
        background: T.bg,
        borderRadius: radii.xxl,
        border: `1px solid ${T.line}`,
        padding: "26px 22px",
        textAlign: "center",
        position: "relative",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      {session.live && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#FFE5E9",
            borderRadius: radii.lg,
            padding: "5px 11px",
          }}
        >
          <LiveDot />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: T.ink }}>LIVE</span>
        </div>
      )}

      <div style={{ fontSize: 42, marginBottom: 14 }}>{session.emoji}</div>
      <div style={{ fontSize: 21, fontWeight: 800, color: T.ink, marginBottom: 8 }}>{session.title}</div>
      <p style={{ fontSize: 14.5, color: T.sub, margin: "0 0 18px", lineHeight: 1.5 }}>{session.sub}</p>

      <button
        className="ag-press"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: session.live ? "linear-gradient(135deg, #FF7A8E, #E0455E)" : T.bg2,
          color: session.live ? "#fff" : T.ink,
          border: session.live ? "none" : `1px solid ${T.line}`,
          borderRadius: 26,
          padding: "12px 24px",
          fontSize: 14.5,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {session.live ? (
          <>
            <Play size={16} /> Bashkohu tani
          </>
        ) : (
          <>
            <Clock size={15} /> {session.when}
          </>
        )}
      </button>
    </div>
  );
}
