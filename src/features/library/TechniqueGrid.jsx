import { T, radii, shadows } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { intentMeta } from "../../domain/intent.js";
import { CoverArt } from "../../components/art/CoverArt.jsx";

/**
 * "Eksploro praktikat" — grid 2-kolonësh me pilulat e teknikave.
 *
 * Çdo pilulë: kapak + ikonë me ngjyrën e teknikës brenda një rrethi të bardhë.
 * Prekja hap folderin e teknikës (meditimet grupohen sipas kategorive).
 *
 * @param {{ techniques: object[], onOpen: (technique) => void }} props
 */
export function TechniqueGrid({ techniques, onOpen }) {
  return (
    <div
      className="ag-stagger"
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
    >
      {techniques.map((technique) => (
        <TechniquePill key={technique.id} technique={technique} onOpen={() => onOpen(technique)} />
      ))}
    </div>
  );
}

function TechniquePill({ technique, onOpen }) {
  const meta = intentMeta(technique.intent);
  const Icon = technique.icon;

  return (
    <button onClick={onOpen} className="ag-card" style={{ ...sx.cardButton, textAlign: "left" }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          borderRadius: radii.lg,
          position: "relative",
          overflow: "hidden",
          boxShadow: shadows.cardSmall,
        }}
      >
        <CoverArt intent={technique.intent} />
        {/* ikona merr ngjyrën e teknikës brenda një rrethi të bardhë */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            ...circle(38, "#fff"),
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          <Icon size={19} color={meta.g[1]} />
        </div>
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: T.ink,
          marginTop: 9,
          lineHeight: 1.3,
          /* emrat e teknikave janë të gjatë — dy rreshta, pastaj pikë */
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {technique.label}
      </div>
      <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{technique.count} meditime</div>
    </button>
  );
}
