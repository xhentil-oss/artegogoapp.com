/**
 * Skenat e kapakëve: peizazhe procedurale SVG, një për çdo qëllim.
 *
 * Kur kapakët reale (foto) të vijnë nga backend-i, `CoverArt` do të preferojë
 * `item.imageUrl` dhe këto skena mbeten si fallback — asnjë kapak bosh.
 */

/** Qëllimi → tipi i skenës + paleta e sfondit. */
export const SCENES = {
  calm:      { type: "waves",    g: ["#A8C0FF", "#3D5AA8"] },
  heart:     { type: "bloom",    g: ["#FFB3D1", "#C9457E"] },
  heal:      { type: "aurora",   g: ["#5C2B8C", "#A86BD9"] },
  focus:     { type: "mountain", g: ["#8AD0E8", "#2B6E8A"] },
  sleep:     { type: "night",    g: ["#3D4B8C", "#0E1640"] },
  energy:    { type: "sun",      g: ["#FF9E5C", "#C94B1E"] },
  stress:    { type: "bloom",    g: ["#FFC4B3", "#C9657E"] },
  transform: { type: "geo",      g: ["#B68BE8", "#5A2BC9"] },
  abundance: { type: "sun",      g: ["#FFD98A", "#C9912B"] },
  selflove:  { type: "bloom",    g: ["#FFB3C9", "#C94B8C"] },
};

export const sceneFor = (intent) => SCENES[intent] ?? SCENES.calm;

/**
 * Shtresat e një skene. `sunId` referon gradientin radial të përcaktuar
 * nga `CoverArt` (i vetmi që ka nevojë për një `<defs>` id).
 */
export function SceneLayers({ type, sunId }) {
  switch (type) {
    case "sun":
      return (
        <>
          <circle cx="150" cy="120" r="58" fill={`url(#${sunId})`} />
          <circle cx="150" cy="120" r="34" fill="#FFF3D6" opacity="0.95" />
          <path d="M0 210 Q75 190 150 210 T300 210 V300 H0 Z" fill="#000" opacity="0.18" />
          <path d="M0 240 Q75 225 150 245 T300 240 V300 H0 Z" fill="#000" opacity="0.14" />
        </>
      );

    case "waves":
      return (
        <>
          <circle cx="150" cy="105" r="40" fill="#fff" opacity="0.25" />
          {[150, 180, 210, 240, 270].map((y, i) => (
            <path
              key={y}
              d={`M0 ${y} Q75 ${y - 14} 150 ${y} T300 ${y} V300 H0 Z`}
              fill="#fff"
              opacity={0.06 + i * 0.02}
            />
          ))}
        </>
      );

    case "mountain":
      return (
        <>
          <circle cx="150" cy="100" r="30" fill="#FFF3D6" opacity="0.9" />
          <path d="M0 220 L70 130 L130 200 L190 120 L300 230 V300 H0 Z" fill="#000" opacity="0.22" />
          <path d="M0 250 L90 180 L160 240 L230 175 L300 250 V300 H0 Z" fill="#000" opacity="0.16" />
        </>
      );

    case "night":
      return (
        <>
          <circle cx="210" cy="80" r="26" fill="#E8ECFF" opacity="0.85" />
          {STARS.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#fff" opacity="0.8" />
          ))}
          <path d="M0 230 L80 190 L160 230 L240 195 L300 230 V300 H0 Z" fill="#000" opacity="0.3" />
        </>
      );

    case "aurora":
      return (
        <>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${-20 + i * 40} 300 Q150 ${120 + i * 30} ${320 - i * 30} 300`}
              stroke="#fff"
              strokeWidth={28 - i * 6}
              fill="none"
              opacity={0.12}
            />
          ))}
          <circle cx="150" cy="150" r="70" fill="#fff" opacity="0.08" />
        </>
      );

    case "bloom":
      return (
        <>
          {PETALS.map(({ x, y, rotation }, i) => (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="30"
              ry="16"
              fill="#fff"
              opacity="0.16"
              transform={`rotate(${rotation} ${x} ${y})`}
            />
          ))}
          <circle cx="150" cy="140" r="26" fill="#fff" opacity="0.3" />
        </>
      );

    case "geo":
      return (
        <>
          <path d="M150 70 L210 140 L150 210 L90 140 Z" fill="#fff" opacity="0.18" />
          <path d="M150 95 L188 140 L150 185 L112 140 Z" fill="#fff" opacity="0.22" />
          <path d="M150 70 L210 140 L150 210 L90 140 Z" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.4" />
        </>
      );

    default:
      return null;
  }
}

/* Pozicione fikse — të llogaritura një herë, jo në çdo render. */
const STARS = [[40, 50], [80, 90], [120, 40], [170, 110], [250, 140], [60, 150], [230, 60]];

const PETALS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return {
    x: 150 + Math.cos(angle) * 42,
    y: 140 + Math.sin(angle) * 42,
    rotation: (angle * 180) / Math.PI,
  };
});
