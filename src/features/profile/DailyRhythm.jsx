import { useState } from "react";
import { Check, Lock, Moon, Play, Sun } from "lucide-react";
import { T, radii, shadows } from "../../theme/tokens.js";
import { circle } from "../../theme/styles.js";
import { hourLabel } from "../../lib/format.js";
import { DAILY_RHYTHM_STEPS } from "../../data/greetings.js";
import { intentMeta } from "../../domain/intent.js";
import { blocksByIntent } from "../../services/contentRepository.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { SunriseMark } from "../../components/icons/BrandIcons.jsx";
import { ProgressRing } from "../../components/ui/Charts.jsx";

/* Yje dekorative — pozicione fikse në përqindje. */
const STARS = [[20, 30], [80, 20], [60, 60], [88, 70], [14, 80]];

/**
 * Ritmi ditor: tre hapa që shkyçen sipas orës.
 * Përparimi mbetet brenda sesionit; kalon në backend bashkë me progresin.
 */
export function DailyRhythm() {
  const { playItems } = usePlayback();
  const [done, setDone] = useState({});

  const hour = new Date().getHours();
  const doneCount = Object.values(done).filter(Boolean).length;
  const percent = (doneCount / DAILY_RHYTHM_STEPS.length) * 100;

  const runStep = (step) => {
    playItems(blocksByIntent(step.intent).slice(0, 1));
    setDone((prev) => ({ ...prev, [step.id]: true }));
  };

  return (
    <section
      style={{
        /* sipërfaqe e brendshme — Sfond dytësor i paletës */
        background: T.bg2,
        borderRadius: radii.xxl,
        padding: "24px 20px",
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {STARS.map(([x, y]) => (
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.7,
          }}
        />
      ))}

      <div style={{ textAlign: "center", color: T.sub, fontSize: 15, fontWeight: 600, marginBottom: 18, position: "relative" }}>
        Ritmi yt ditor
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, position: "relative" }}>
        <ProgressRing percent={percent} color={T.gold}>
          <div style={{ fontSize: 13, color: T.sub }}>dita</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: T.ink, lineHeight: 1 }}>1</div>
          <div style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>
            hapi {doneCount} nga {DAILY_RHYTHM_STEPS.length}
          </div>
        </ProgressRing>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20, position: "relative" }}>
        <Chip emoji="🔥" label={`${doneCount} hapa sot`} />
        <Chip emoji="⭐" label={`${doneCount >= DAILY_RHYTHM_STEPS.length ? 1 : 0} arritje`} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        {DAILY_RHYTHM_STEPS.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            unlocked={hour >= step.fromHour}
            done={Boolean(done[step.id])}
            onRun={() => runStep(step)}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", color: T.faint, fontSize: 12.5, marginTop: 16, position: "relative" }}>
        Plotësoji të tri hapat që dita të hyjë në ditët rresht.
      </div>
    </section>
  );
}

function Chip({ emoji, label }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 24,
        padding: "9px 18px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: shadows.raised,
      }}
    >
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{label}</span>
    </div>
  );
}

function StepRow({ step, unlocked, done, onRun }) {
  const meta = intentMeta(step.intent);
  const color = unlocked ? meta.g[1] : T.faint;

  return (
    <div
      onClick={() => unlocked && !done && onRun()}
      className={unlocked ? "ag-card" : ""}
      style={{
        background: unlocked ? "#fff" : "rgba(255,255,255,0.45)",
        borderRadius: radii.xl,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: unlocked && !done ? "pointer" : "default",
        boxShadow: unlocked ? "0 3px 12px rgba(0,0,0,0.07)" : "none",
        opacity: unlocked ? 1 : 0.6,
        transition: "all .2s",
      }}
    >
      <StepIcon kind={step.icon} color={color} />

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: unlocked ? T.ink : T.faint }}>{step.title}</div>
        <div style={{ fontSize: 13.5, color: unlocked ? T.sub : T.faint, marginTop: 2 }}>{step.sub}</div>
      </div>

      {done ? (
        <div style={circle(28, T.success)}>
          <Check size={16} color="#fff" />
        </div>
      ) : unlocked ? (
        <Play size={20} color={color} />
      ) : (
        <div style={{ textAlign: "right" }}>
          <Lock size={16} color={T.faint} style={{ marginBottom: 2 }} />
          <div style={{ fontSize: 11, color: T.faint, lineHeight: 1.2 }}>
            Nga ora
            <br />
            {hourLabel(step.fromHour)}
          </div>
        </div>
      )}
    </div>
  );
}

function StepIcon({ kind, color }) {
  if (kind === "sunrise") return <SunriseMark size={30} color={color} />;
  if (kind === "sun") return <Sun size={28} color={color} />;
  return <Moon size={26} color={color} />;
}
