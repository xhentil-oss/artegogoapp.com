import { Play, X } from "lucide-react";
import { layout, radii, shadows } from "../../theme/tokens.js";
import { sx, circle, iconBox } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { padBottom } from "../../theme/responsive.js";
import { intentMeta } from "../../domain/intent.js";
import { usePlayer } from "../../store/PlayerContext.jsx";

/** Shirit mbi nav-in poshtë kur player-i minimizohet. */
export function MiniPlayer({ sequence }) {
  const { resume, dismissMinimized } = usePlayer();
  const first = sequence[0];
  const meta = intentMeta(first?.intent);
  const Icon = meta.icon;

  return (
    <div
      className="ag-sheet"
      style={{
        position: "fixed",
        left: 10,
        right: 10,
        /* mbi nav-in e fiksuar, duke llogaritur shiritin e gjesteve */
        bottom: padBottom(78),
        zIndex: 45,
        background: tile(meta.g),
        borderRadius: radii.lg,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: shadows.lifted,
        /* brenda kornizës, me 10px hapësirë nga buzët */
        maxWidth: layout.frameWidth - 20,
        margin: "0 auto",
      }}
    >
      <div style={iconBox(40, "rgba(255,255,255,0.2)", 11)}>
        <Icon size={20} color="#fff" />
      </div>

      <div style={sx.flexText}>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, ...sx.truncate }}>{first?.title}</div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11.5 }}>Arte Gogo · {meta.label}</div>
      </div>

      <button
        onClick={resume}
        aria-label="Vazhdo"
        className="ag-press"
        style={{ ...circle(42, "#fff"), border: "none", padding: 0, cursor: "pointer" }}
      >
        <Play size={18} color={meta.g[1]} style={{ marginLeft: 2 }} />
      </button>
      <button
        onClick={dismissMinimized}
        aria-label="Mbyll"
        className="ag-press"
        style={{ ...sx.bareButton, ...sx.center, width: 40, height: 40, flexShrink: 0 }}
      >
        <X size={20} color="rgba(255,255,255,0.85)" />
      </button>
    </div>
  );
}
