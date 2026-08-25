import { useEffect, useState } from "react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";

const STEP_LABELS = [
  "Po përziej frekuencat…",
  "Po sintetizoj hapësirën…",
  "Po ankoroj koherencën…",
  "Gati!",
];

const TICK_MS = 55;
const TICK_PERCENT = 4;
const SETTLE_MS = 350;

/** Animacion i gjenerimit. Thërret `onDone` kur mbush 100%. */
export function GenerateProgress({ onDone }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPct((current) => Math.min(100, current + TICK_PERCENT));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pct < 100) return undefined;
    const timer = setTimeout(onDone, SETTLE_MS);
    return () => clearTimeout(timer);
  }, [pct, onDone]);

  const label = STEP_LABELS[Math.min(STEP_LABELS.length - 1, Math.floor(pct / 25))];

  return (
    <div
      style={{
        background: T.bg2,
        borderRadius: radii.xxl,
        padding: 40,
        border: `1px solid ${T.line}`,
        textAlign: "center",
        margin: `0 ${layout.gutter}px`,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          margin: "0 auto 20px",
          background: `conic-gradient(from 0deg, ${T.eve1}, ${T.eve2}, ${T.eve1})`,
          animation: "spin 2s linear infinite",
          ...sx.center,
        }}
      >
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.bg }} />
      </div>

      <div style={{ color: T.ink, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
        Po krijohet meditimi yt
      </div>
      <div style={{ color: T.sub, fontSize: 13, marginBottom: 22 }}>{label}</div>

      <div style={{ height: 8, background: T.line, borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${T.eve1}, ${T.eve2})`,
            transition: "width .05s linear",
          }}
        />
      </div>
      <div style={{ color: T.sub, fontSize: 12, marginTop: 10 }}>{pct}%</div>
    </div>
  );
}
