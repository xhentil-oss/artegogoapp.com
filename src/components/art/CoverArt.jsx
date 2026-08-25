import { useId } from "react";
import { fonts } from "../../theme/tokens.js";
import { sceneFor, SceneLayers } from "./scenes.jsx";

/**
 * Kapaku i një meditimi: peizazh procedural + titull i shtypur mbi të.
 *
 * Mbulon prindin e vet (`position: absolute; inset: 0`), ndaj prindi duhet
 * të ketë `position: relative` dhe `overflow: hidden`.
 *
 * Id-të e gradientëve rrjedhin nga `useId()`, që dy kapakë të njëjtë në
 * faqe të mos përplasen me `<defs>` të njëjta.
 */
export function CoverArt({ intent, title, sub, big = false }) {
  const scene = sceneFor(intent);
  const uid = useId().replace(/:/g, "");
  const bgId = `bg-${uid}`;
  const sunId = `sun-${uid}`;
  const shadeId = `shade-${uid}`;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg
        viewBox="0 0 300 300"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={scene.g[0]} />
            <stop offset="1" stopColor={scene.g[1]} />
          </linearGradient>
          <radialGradient id={sunId} cx="50%" cy="42%" r="40%">
            <stop offset="0" stopColor="#FFF7E0" />
            <stop offset="0.5" stopColor="#FFE0A0" stopOpacity="0.7" />
            <stop offset="1" stopColor="#FFE0A0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.42" />
          </linearGradient>
        </defs>

        <rect width="300" height="300" fill={`url(#${bgId})`} />
        <SceneLayers type={scene.type} sunId={sunId} />

        {/* mjegull poshtë, që teksti të lexohet */}
        <rect width="300" height="300" fill="#000" opacity="0.10" />
        <rect y="170" width="300" height="130" fill={`url(#${shadeId})`} />
      </svg>

      {title && <CoverTitle title={title} sub={sub} big={big} />}
    </div>
  );
}

function CoverTitle({ title, sub, big }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: big ? 16 : 12,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#fff",
          fontWeight: 900,
          lineHeight: 1.04,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          fontSize: big ? 21 : 15,
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          fontFamily: fonts.display,
        }}
      >
        {title}
      </div>
      {sub && (
        <div
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: big ? 10 : 8.5,
            letterSpacing: 2,
            marginTop: 5,
            textShadow: "0 1px 6px rgba(0,0,0,0.6)",
          }}
        >
          {sub.toUpperCase()}
        </div>
      )}
    </div>
  );
}
