import { T, radii } from "../../theme/tokens.js";

/**
 * Grafik shtyllash vertikale.
 *
 * @param {{ bars: {label: string, value: number}[], max: number, dense?: boolean,
 *           height?: number, fill?: (bar) => string, labelEvery?: number }} props
 */
export function BarChart({ bars, max, dense = false, height = 90, fill, labelEvery = 1 }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: dense ? 2 : 6, height }}>
      {bars.map((bar, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: "100%",
              maxWidth: dense ? undefined : 34,
              borderRadius: "5px 5px 0 0",
              height: `${Math.max(3, (bar.value / max) * 100)}%`,
              background: bar.value > 0 ? fill?.(bar) ?? DEFAULT_FILL : T.line,
              transition: "height .4s",
            }}
          />
          {i % labelEvery === 0 && <div style={{ color: T.faint, fontSize: 9 }}>{bar.label}</div>}
        </div>
      ))}
    </div>
  );
}

const DEFAULT_FILL = `linear-gradient(180deg, ${T.success}, ${T.successSoft})`;

/**
 * Grafik pikash — pika ngrihet sa më e mirë gjendja.
 * @param {{ points: {label: string, value: number|null}[], colorFor: (v:number)=>string }} props
 */
export function DotChart({ points, colorFor, dense = false, height = 90, labelEvery = 1 }) {
  return (
    <div style={{ position: "relative", height, display: "flex", alignItems: "flex-end", gap: dense ? 2 : 6 }}>
      {points.map((point, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 5,
            height: "100%",
          }}
        >
          {point.value != null ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: colorFor(point.value),
                  /* pika ngjitet sipas vlerës 1–5 */
                  marginBottom: `${((point.value - 1) / 4) * 70}%`,
                  boxShadow: `0 0 8px ${colorFor(point.value)}88`,
                  transition: "margin .4s",
                }}
              />
            </div>
          ) : (
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.line }} />
          )}
          {i % labelEvery === 0 && <div style={{ color: T.faint, fontSize: 9 }}>{point.label}</div>}
        </div>
      ))}
    </div>
  );
}

/** Unazë progresi rrethore. */
export function ProgressRing({ percent, size = 150, stroke = 10, color = T.gold, children }) {
  const radius = size / 2 - stroke / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="rgba(255,255,255,0.55)"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Tri kuti statistikash në rresht. */
export function StatRow({ stats, onDark = false }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {stats.map(({ value, label }, i) => (
        <div
          key={i}
          style={
            onDark
              ? {
                  flex: 1,
                  background: "rgba(255,255,255,0.10)",
                  borderRadius: radii.lg,
                  padding: "16px 8px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  textAlign: "center",
                }
              : {
                  flex: 1,
                  background: T.bg2,
                  borderRadius: radii.lg,
                  padding: 16,
                  border: `1px solid ${T.line}`,
                }
          }
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: onDark ? "#fff" : T.ink,
              ...(onDark ? { fontFamily: "Georgia, serif" } : null),
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: onDark ? 9.5 : 11,
              color: onDark ? "rgba(255,255,255,0.65)" : T.sub,
              letterSpacing: 1,
              marginTop: onDark ? 3 : 2,
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
