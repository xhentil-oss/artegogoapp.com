import { Lock, Play } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx, iconBox, circle } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { intentMeta } from "../../domain/intent.js";
import { authorFor } from "../../lib/placeholders.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { CoverArt } from "../art/CoverArt.jsx";
import { Rating } from "../ui/Badges.jsx";

/**
 * Rresht listë për një meditim — varianti me ikonë gradient.
 * Përdoret në pamjen e një kategorie.
 */
export function MeditationRow({ block, index = 0 }) {
  const { isLocked, playItems } = usePlayback();
  const locked = isLocked(block);
  const meta = intentMeta(block.intent);

  return (
    <button
      onClick={() => playItems(block)}
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
      <div style={iconBox(56, tile(meta.g))}>
        {locked ? <Lock size={20} color="#fff" /> : <Play size={20} color="#fff" />}
      </div>

      <div style={sx.flexText}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: T.ink, fontSize: 16, fontWeight: 700 }}>{block.title}</span>

        </div>
        <div style={{ color: T.sub, fontSize: 13, marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
          {authorFor(index)} · {block.dur}m · <Rating index={index} size={11} />
        </div>
      </div>
    </button>
  );
}

/**
 * Rresht listë me kapak të vogël — varianti i rezultateve të kërkimit.
 */
export function SearchResultRow({ block, index = 0, onBeforePlay }) {
  const { playItems } = usePlayback();
  const meta = intentMeta(block.intent);

  return (
    <button
      onClick={() => {
        onBeforePlay?.();
        playItems(block);
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
        <CoverArt intent={block.intent} />
      </div>

      <div style={sx.flexText}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: T.ink, fontSize: 15, fontWeight: 700 }}>{block.title}</span>

        </div>
        <div style={{ color: T.sub, fontSize: 12.5, marginTop: 2 }}>
          {meta.label} · {authorFor(index)} · {block.dur}m
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
