import { useState } from "react";
import { Check } from "lucide-react";
import { T, onDark, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { immersiveBackdrop } from "../../theme/gradients.js";
import { FLUID, padTop, padBottom } from "../../theme/responsive.js";
import { SESSION_MOODS } from "../../data/tracking.js";
import { intentMeta } from "../../domain/intent.js";
import { totalMinutes } from "../../domain/sequence.js";
import { useSession } from "../../store/SessionContext.jsx";
import { usePlayer } from "../../store/PlayerContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { StatRow } from "../../components/ui/Charts.jsx";

const CONFETTI_COUNT = 14;

/** Ekrani i përmbylljes: statistika, zgjedhje gjendjeje, konfeti. */
export function CompletionSheet({ sequence, streak = 7 }) {
  const { name } = useSession();
  const { dismissCompletion } = usePlayer();
  const [mood, setMood] = useState(null);
  useBodyScrollLock();

  const meta = intentMeta(sequence[0]?.intent ?? "calm");
  const confetti = buildConfetti(meta.g);

  return (
    <div
      className="ag-fullscreen"
      style={{
        zIndex: 65,
        background: immersiveBackdrop(meta.g, "30%"),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${padTop(28)} 28px ${padBottom(28)}`,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ ...sx.absoluteFill, overflow: "hidden", pointerEvents: "none" }}>
        {confetti.map((piece, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 60,
              left: piece.left,
              width: piece.size,
              height: piece.size,
              borderRadius: 2,
              background: piece.color,
              animation: `confettiFall ${piece.duration}s ${piece.delay}s ease-in both`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div className="ag-page" style={{ width: "100%", maxWidth: 420, textAlign: "center", position: "relative" }}>
        <div
          style={{
            width: FLUID.completionRing,
            aspectRatio: "1 / 1",
            margin: "0 auto 28px",
            borderRadius: "50%",
            background: `conic-gradient(from 0deg, ${meta.g[0]}, ${T.gold}, ${meta.g[1]}, ${meta.g[0]})`,
            padding: 4,
            animation: "scaleIn .6s cubic-bezier(.2,1.2,.3,1) both",
            boxShadow: `0 0 50px ${meta.g[0]}88`,
          }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "rgba(10,6,20,0.5)", ...sx.center }}>
            <Check size={56} color="#fff" strokeWidth={2.5} />
          </div>
        </div>

        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, letterSpacing: 3, marginBottom: 8 }}>
          SEANCA U KRYE
        </div>
        <h2
          style={{
            color: "#fff",
            fontSize: "clamp(23px, 7.5vw, 30px)",
            fontWeight: 800,
            margin: "0 0 10px",
            fontFamily: "Georgia, serif",
          }}
        >
          Bravo, {name}
        </h2>
        <p style={{ color: onDark.secondary, fontSize: 15, lineHeight: 1.6, margin: "0 0 28px" }}>
          Sapo plotësove edhe një hap drejt koherencës zemër-tru. Mbaje këtë ndjesi me vete.
        </p>

        <div style={{ marginBottom: 28 }}>
          <StatRow
            onDark
            stats={[
              { value: `+${totalMinutes(sequence)}`, label: "MINUTA" },
              { value: sequence.length, label: "HAPA" },
              { value: streak, label: "DITË RRJESHT" },
            ]}
          />
        </div>

        <div style={{ color: onDark.primary, fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Si u ndjeve?</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 30, flexWrap: "wrap" }}>
          {SESSION_MOODS.map((option) => {
            const selected = mood === option.label;
            return (
              <button
                key={option.label}
                onClick={() => setMood(option.label)}
                className="ag-press"
                style={{
                  background: selected ? onDark.fillStrong : "rgba(255,255,255,0.08)",
                  border: `1px solid ${selected ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: radii.lg,
                  padding: "10px 12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  minWidth: 64,
                  transition: "all .2s",
                  transform: selected ? "scale(1.05)" : "scale(1)",
                }}
              >
                <span style={{ fontSize: 24 }}>{option.emoji}</span>
                <span style={{ color: "#fff", fontSize: 11 }}>{option.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => dismissCompletion(mood)}
          className="ag-press"
          style={{
            width: "100%",
            background: "#fff",
            color: meta.g[1],
            border: "none",
            borderRadius: radii.pill,
            padding: 16,
            fontSize: 15.5,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 12,
          }}
        >
          {mood ? "Ruaj dhe vazhdo" : "Vazhdo"}
        </button>
        <button
          onClick={() => dismissCompletion(mood)}
          style={{ ...sx.bareButton, color: "rgba(255,255,255,0.6)", fontSize: 14 }}
        >
          Shih progresin tim
        </button>
      </div>
    </div>
  );
}

/** Pozicione dhe ngjyra deterministe — asnjë random, asnjë kërcim në render. */
function buildConfetti([from, to]) {
  const palette = [from, to, T.gold, "#fff", T.eve1];
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    left: `${(i * 7 + 5) % 100}%`,
    delay: (i % 5) * 0.15,
    duration: 2.4 + (i % 3) * 0.5,
    color: palette[i % palette.length],
    size: 6 + (i % 3) * 3,
  }));
}
