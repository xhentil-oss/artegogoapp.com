import { Check, Lock, Moon, Play, Sun } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { circle } from "../../theme/styles.js";
import { hourLabel } from "../../lib/format.js";
import { DAILY_RHYTHM_STEPS } from "../../data/greetings.js";
import { intentMeta } from "../../domain/intent.js";
import { rhythmPick } from "../../services/contentRepository.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { useProgress } from "../../store/ProgressContext.jsx";
import { SunriseMark } from "../../components/icons/BrandIcons.jsx";
import { ProgressRing } from "../../components/ui/Charts.jsx";
import { CoverArt } from "../../components/art/CoverArt.jsx";

/* Yje dekorative — pozicione fikse në përqindje. */
const STARS = [[20, 30], [80, 20], [60, 60], [88, 70], [14, 80]];

/**
 * Ritmi ditor: tre hapa që shkyçen sipas orës.
 *
 * ⚠️  Përparimi ruhet te databaza (`domain/rhythm.js` → `habits`), jo te
 *     `useState`. Më parë zhdukej sa herë ndërrohej skeda, dhe numri i ditës
 *     ishte i shkruar fiks te "1" — pra ekrani premtonte një ritëm që nuk
 *     mbahej mend askund.
 */
export function DailyRhythm() {
  const { playItems } = usePlayback();
  const { rhythmToday, rhythmCount, rhythmDay } = useProgress();

  const hour = new Date().getHours();
  const percent = (rhythmCount / DAILY_RHYTHM_STEPS.length) * 100;

  /**
   * Hapi shënohet i kryer VETËM kur dëgjimi mbaron.
   *
   * ⚠️  Më parë shënohej në çastin e shtypjes: mjaftonte të hapje player-in
   *     dhe ta mbyllje menjëherë që dita të dukej e plotësuar. Tani markuesi i
   *     kalohet player-it, dhe `complete()` e shënon — pra numëron praktika e
   *     bërë, jo butoni i shtypur.
   */
  const runStep = (item, step) => {
    if (!item) return;
    playItems([item], { ritualStep: step.id });
  };

  return (
    <section
      style={{
        /* I njëjti sfond si kartat e tjera të profilit (`Si u ndjeve sot?`,
           medaljet): një gradient i vetëm gurkali e nxirrte këtë bllok nga
           familja, ndaj u kthye te Sfondi dytësor i paletës. */
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
          <div style={{ fontSize: 44, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{rhythmDay}</div>
          <div style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>
            hapi {rhythmCount} nga {DAILY_RHYTHM_STEPS.length}
          </div>
        </ProgressRing>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        {DAILY_RHYTHM_STEPS.map((step) => {
          /* Meditimi i vërtetë i këtij hapi, për këtë ditë të ciklit. */
          const item = rhythmPick(step.intent, rhythmDay);

          return (
            <StepRow
              key={step.id}
              step={step}
              item={item}
              unlocked={hour >= step.fromHour}
              done={Boolean(rhythmToday[step.id])}
              onRun={() => runStep(item, step)}
            />
          );
        })}
      </div>

    </section>
  );
}

/**
 * Një hap i ditës.
 *
 * ⚠️  Titulli i madh është i MEDITIMIT, jo i hapit. "Meditimi i mëngjesit"
 *     rri sipër si etiketë e vogël, sepse ai emër nuk thotë asgjë për atë që
 *     do të dëgjohet — dhe pikërisht ajo ishte ankesa: tre kartela të njëjta
 *     çdo ditë, pa foto dhe pa emër.
 */
function StepRow({ step, item, unlocked, done, onRun }) {
  const meta = intentMeta(step.intent);
  const color = unlocked ? meta.g[1] : T.faint;
  const titulli = item?.title ?? step.title;
  const nenTitulli = item?.dur ? `${meta.label} · ${item.dur} min` : step.sub;

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
      {/* Kopertina e vërtetë; pa foto, `CoverArt` vizaton peizazhin procedural. */}
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
          opacity: unlocked ? 1 : 0.55,
        }}
      >
        <CoverArt intent={step.intent} image={item?.cover} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: unlocked ? T.sub : T.faint,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.9,
            textTransform: "uppercase",
          }}
        >
          <StepIcon kind={step.icon} color={color} />
          {step.title}
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 800,
            color: unlocked ? T.ink : T.faint,
            marginTop: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {titulli}
        </div>
        <div style={{ fontSize: 12.5, color: unlocked ? T.sub : T.faint, marginTop: 1 }}>
          {nenTitulli}
        </div>
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

/* I zvogëluar: tani rri brenda etiketës së vogël, jo si ikonë e vetme majtas. */
function StepIcon({ kind, color }) {
  if (kind === "sunrise") return <SunriseMark size={14} color={color} />;
  if (kind === "sun") return <Sun size={13} color={color} />;
  return <Moon size={13} color={color} />;
}
