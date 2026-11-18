import { Lock, Play } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx, iconBox, circle } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { intentMeta } from "../../domain/intent.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { CoverArt } from "../art/CoverArt.jsx";

/**
 * Rresht listë për një meditim — pamja e një kategorie.
 *
 * ⚠️  Më parë majtas rrinte vetëm një katror gradient me një trekëndësh, i
 *     njëjtë për çdo meditim të asaj kategorie. Kopertinat ekzistonin dhe
 *     hapeshin — vetëm ky rresht nuk i kërkonte. Pasoja e vërtetë nuk ishte
 *     estetike: klientja hapi "Hapje Zemre", pa tri rreshta pa foto, dhe
 *     nxori përfundimin se ato meditime nuk kanë as zë as kopertinë (18
 *     nëntor 2026). Një ekran që nuk tregon përmbajtjen e bën atë të duket
 *     e munguar.
 */
export function MeditationRow({ block }) {
  const { isLocked } = usePlayback();
  const { openMeditation } = useNavigation();
  const locked = isLocked(block);
  const meta = intentMeta(block.intent);

  return (
    <button
      onClick={() => openMeditation(block)}
      className="ag-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        ...sx.card,
        padding: 12,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {/* Kopertina e vërtetë; pa foto, `CoverArt` vizaton peizazhin procedural. */}
      <div style={{ width: 56, height: 56, borderRadius: radii.md, overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <CoverArt intent={block.intent} image={block.cover} />
      </div>

      <div style={sx.flexText}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: T.ink, fontSize: 16, fontWeight: 700 }}>{block.title}</span>

        </div>
        <div style={{ color: T.sub, fontSize: 13, marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
          {meta.label} · {block.dur}m
        </div>
      </div>

      {/* Drejtuesi i veprimit kalon djathtas, si te rezultatet e kërkimit —
          kështu kopertina zë vendin e vet dhe dryni mbetet i dukshëm. */}
      <div style={{ ...circle(42, locked ? T.faint : tile(meta.g)), flexShrink: 0 }}>
        {locked ? <Lock size={16} color="#fff" /> : <Play size={16} color="#fff" style={{ marginLeft: 2 }} />}
      </div>
    </button>
  );
}

/**
 * Rresht listë me kapak të vogël — varianti i rezultateve të kërkimit.
 */
export function SearchResultRow({ block, onBeforePlay }) {
  const { openMeditation } = useNavigation();
  const meta = intentMeta(block.intent);

  return (
    <button
      onClick={() => {
        onBeforePlay?.();
        openMeditation(block);
      }}
      className="ag-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        ...sx.card,
        borderRadius: 14,
        padding: 10,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ width: 54, height: 54, borderRadius: 11, overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <CoverArt intent={block.intent} image={block.cover} />
      </div>

      <div style={sx.flexText}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: T.ink, fontSize: 15, fontWeight: 700 }}>{block.title}</span>

        </div>
        <div style={{ color: T.sub, fontSize: 12.5, marginTop: 2 }}>
          {meta.label} · {block.dur}m
        </div>
      </div>

      <div style={circle(42, tile(meta.g))}>
        <Play size={16} color="#fff" style={{ marginLeft: 2 }} />
      </div>
    </button>
  );
}

/** Rresht kompakt brenda ndërtuesit të seancës. */
export function BuilderRow({ block, right, borderAccent }) {
  const meta = intentMeta(block.intent);
  const Icon = meta.icon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        background: T.bg,
        borderRadius: radii.md,
        padding: "11px 12px",
        border: `1px solid ${T.line}`,
        ...(borderAccent ? { borderLeft: `3px solid ${meta.g[1]}` } : null),
      }}
    >
      <div style={iconBox(30, tile(meta.g), 8)}>
        <Icon size={14} color="#fff" />
      </div>
      <div style={sx.flexText}>
        <div style={{ color: T.ink, fontSize: 14, fontWeight: 700 }}>{block.title}</div>
        <div style={{ color: T.sub, fontSize: 11.5 }}>
          {meta.label} · {block.dur}m
        </div>
      </div>
      {right}
    </div>
  );
}
