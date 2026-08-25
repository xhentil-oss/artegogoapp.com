import { T, fonts, radii } from "../../theme/tokens.js";

/**
 * Grafik shtyllash vertikale.
 *
 * `highlight` është indeksi i shtyllës së sotme — specifikimi (seksioni 10)
 * e kërkon të theksuar jeshile dhe të rritet në kohë reale. Ditët e shkuara
 * bien në një ton më të qetë, që syri të bjerë menjëherë te sotmja.
 *
 * @param {{ bars: {label: string, value: number}[], max: number, dense?: boolean,
 *           height?: number, fill?: (bar) => string, labelEvery?: number,
 *           highlight?: number }} props
 */
export function BarChart({ bars, max, dense = false, height = 90, fill, labelEvery = 1, highlight = -1 }) {
  return (
    <div style={{ display: "flex", gap: dense ? 2 : 6 }}>
      {bars.map((bar, i) => {
        const today = i === highlight;
        /* Etiketa e sotme shfaqet gjithmonë, edhe kur pamja mujore i tregon
           vetëm çdo të pestën — përndryshe theksimi do të mbetej pa emër. */
        const showLabel = today || i % labelEvery === 0;

        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            {/* Shtylla matet në përqindje, ndaj i duhet një pistë me lartësi të
                caktuar. Pa këtë, prindi flex mbetet me lartësi automatike dhe
                përqindja nuk zgjidhet — shtyllat dalin 0px, pra të padukshme. */}
            <div style={{ height, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: dense ? undefined : 34,
                  borderRadius: "5px 5px 0 0",
                  height: `${Math.max(3, (bar.value / max) * 100)}%`,
                  background: barFill(bar, today, fill),
                  /* Kur zakoni shënohet, shtylla rritet para syve. */
                  transition: "height .4s, background .3s",
                  boxShadow: today && bar.value > 0 ? `0 0 0 1.5px ${T.success}55` : "none",
                }}
              />
            </div>
            {showLabel && (
              <div
                style={{
                  color: today ? T.success : T.faint,
                  fontSize: 9,
                  fontWeight: today ? 800 : 500,
                }}
              >
                {bar.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Sfondi i një shtylle: bosh, e shkuar, ose e sotmja e theksuar. */
function barFill(bar, today, fill) {
  if (bar.value <= 0) return today ? T.bgSkeleton : T.line;
  if (fill) return fill(bar);
  return today ? TODAY_FILL : PAST_FILL;
}

/** E sotmja — jeshile e plotë, siç e kërkon specifikimi. */
const TODAY_FILL = `linear-gradient(180deg, ${T.success}, ${T.successSoft})`;
/** Ditët e shkuara — e njëjta jeshile, e zbutur, që të mos konkurrojë. */
const PAST_FILL = `linear-gradient(180deg, ${T.success}5E, ${T.successSoft}5E)`;

/**
 * Grafik pikash — pika ngrihet sa më e mirë gjendja.
 *
 * `highlight` shënon pikën e sotme (seksioni 10). Kur gjendja e sotme ende
 * nuk është shënuar, në vend të një pike të vogël gri shfaqet një unazë e
 * zbrazët në mes të shkallës: mungesa duhet të duket si ftesë, jo si e dhënë.
 *
 * @param {{ points: {label: string, value: number|null}[], colorFor: (v:number)=>string,
 *           dense?: boolean, height?: number, labelEvery?: number, highlight?: number }} props
 */
export function DotChart({ points, colorFor, dense = false, height = 90, labelEvery = 1, highlight = -1 }) {
  return (
    <div style={{ position: "relative", height, display: "flex", alignItems: "flex-end", gap: dense ? 2 : 6 }}>
      {points.map((point, i) => {
        const today = i === highlight;
        const showLabel = today || i % labelEvery === 0;
        const size = today ? 15 : 11;

        return (
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
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: colorFor(point.value),
                    /* pika ngjitet sipas vlerës 1–5 */
                    marginBottom: `${((point.value - 1) / 4) * 70}%`,
                    boxShadow: today
                      ? `0 0 0 3px #fff, 0 0 0 4.5px ${colorFor(point.value)}, 0 0 12px ${colorFor(point.value)}99`
                      : `0 0 8px ${colorFor(point.value)}88`,
                    transition: "margin .4s",
                  }}
                />
              </div>
            ) : today ? (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    border: `2px dashed ${T.faint}`,
                    /* në mes të shkallës 1–5, aty ku do të bjerë nesër */
                    marginBottom: "35%",
                  }}
                />
              </div>
            ) : (
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.line }} />
            )}

            {showLabel && (
              <div
                style={{
                  color: today ? T.ink : T.faint,
                  fontSize: 9,
                  fontWeight: today ? 800 : 500,
                }}
              >
                {point.label}
              </div>
            )}
          </div>
        );
      })}
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
              /* statistikat mbi sfond të errët i takojnë ekranit të përmbylljes */
              ...(onDark ? { fontFamily: fonts.display } : null),
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
