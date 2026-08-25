import { useState } from "react";
import { T } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { MOODS, PERIODS } from "../../data/tracking.js";
import { lastDays, lastMonths } from "../../lib/time.js";
import { useProgress } from "../../store/ProgressContext.jsx";
import { SegmentedControl } from "../../components/ui/Controls.jsx";
import { DotChart } from "../../components/ui/Charts.jsx";

/** Gjendja emocionale e ditës + kurbë historike. */
export function MoodTracker() {
  const [period, setPeriod] = useState("week");
  const { moods, moodToday, setMood } = useProgress();

  const points = buildPoints(period, moods);

  return (
    <section style={{ ...sx.panel, marginBottom: 16 }}>
      <div style={{ color: T.ink, fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Si u ndjeve sot?</div>
      <div style={{ color: T.sub, fontSize: 13, marginBottom: 16 }}>Shëno gjendjen tënde çdo ditë</div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 22 }}>
        {MOODS.map((mood) => {
          const selected = moodToday === mood.v;
          return (
            <button
              key={mood.v}
              onClick={() => setMood(mood.v)}
              className="ag-press"
              style={{
                flex: 1,
                background: selected ? `${mood.c}22` : T.bg,
                border: `2px solid ${selected ? mood.c : T.line}`,
                borderRadius: 16,
                padding: "12px 4px",
                cursor: "pointer",
                transition: "all .2s",
                transform: selected ? "scale(1.08)" : "scale(1)",
              }}
            >
              <span style={{ fontSize: 28, filter: selected ? "none" : "grayscale(0.5) opacity(0.75)" }}>
                {mood.e}
              </span>
            </button>
          );
        })}
      </div>

      <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} style={{ marginBottom: 16 }} />

      <DotChart
        points={points}
        colorFor={moodColor}
        dense={period === "month"}
        labelEvery={period === "month" ? 5 : 1}
      />
    </section>
  );
}

/** Ngjyra e pikës — mood-i më i afërt me vlerën (mesataret janë dhjetore). */
function moodColor(value) {
  return MOODS.reduce(
    (closest, mood) => (Math.abs(mood.v - value) < Math.abs(closest.v - value) ? mood : closest),
    MOODS[2]
  ).c;
}

function buildPoints(period, moods) {
  if (period === "year") {
    return lastMonths(12).map((month) => {
      const values = Object.entries(moods)
        .filter(([key]) => key.startsWith(month.key))
        .map(([, value]) => value);
      return {
        label: month.initial,
        value: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null,
      };
    });
  }

  const days = period === "week" ? 7 : 30;
  return lastDays(days).map((day) => ({
    label: period === "week" ? day.weekdayShort : day.dayOfMonth,
    value: moods[day.key] ?? null,
  }));
}
