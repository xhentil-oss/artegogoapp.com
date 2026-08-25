import { useState } from "react";
import { T } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { HABITS, PERIODS } from "../../data/tracking.js";
import { lastDays, lastMonths } from "../../lib/time.js";
import { useProgress } from "../../store/ProgressContext.jsx";
import { SegmentedControl } from "../../components/ui/Controls.jsx";
import { BarChart } from "../../components/ui/Charts.jsx";

/** Zakonet e ditës + grafik javor/mujor/vjetor. */
export function HabitTracker() {
  const [period, setPeriod] = useState("week");
  const { habitsToday, habitCount, habitScore, toggleHabit, habits } = useProgress();

  const completed = Object.values(habitsToday).filter(Boolean).length;
  const bars = buildBars(period, habitScore, habits);

  return (
    <section style={{ ...sx.panel, marginBottom: 16 }}>
      <div style={{ color: T.ink, fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Zakonet e Ditës</div>
      <div style={{ color: T.sub, fontSize: 13, marginBottom: 16 }}>
        {completed} nga {habitCount} të plotësuara sot
      </div>

      {/* Gjithmonë 3 kolona: 6 zakonet mbushin saktësisht dy rreshta. Me grid
          që shton kolona vetë, korniza e gjerë nxirrte 4 kolona dhe linte një
          rresht jetim me dy pllaka. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {HABITS.map((habit) => {
          const on = Boolean(habitsToday[habit.id]);
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className="ag-press"
              style={{
                background: on ? "#2BB67318" : T.bg,
                border: `1.5px solid ${on ? T.success : T.line}`,
                borderRadius: 14,
                padding: "14px 8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                transition: "all .2s",
              }}
            >
              <span style={{ fontSize: 24, filter: on ? "none" : "grayscale(0.6) opacity(0.7)" }}>
                {habit.emoji}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: on ? T.ink : T.sub }}>
                {habit.label}
              </span>
            </button>
          );
        })}
      </div>

      <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} style={{ marginBottom: 14 }} />

      {/* Shtylla e fundit është gjithmonë e sotmja — rritet sapo shënohet një
          zakon më lart, pa asnjë hap tjetër. */}
      <BarChart
        bars={bars}
        max={HABITS.length}
        dense={period === "month"}
        labelEvery={period === "month" ? 5 : 1}
        highlight={bars.length - 1}
      />
    </section>
  );
}

/** Ndërton shtyllat e grafikut sipas periudhës. */
function buildBars(period, habitScore, habits) {
  if (period === "year") {
    return lastMonths(12).map((month) => {
      const entries = Object.entries(habits).filter(([key]) => key.startsWith(month.key));
      const total = entries.reduce((sum, [, day]) => sum + Object.values(day).filter(Boolean).length, 0);
      return { label: month.label, value: entries.length ? total / entries.length : 0 };
    });
  }

  const days = period === "week" ? 7 : 30;
  return lastDays(days).map((day) => ({
    label: period === "week" ? day.weekday : day.dayOfMonth,
    value: habitScore(day.key),
  }));
}
