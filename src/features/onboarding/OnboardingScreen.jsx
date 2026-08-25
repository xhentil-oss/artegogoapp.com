import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { T, fonts, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { brandSplash } from "../../theme/gradients.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { REMINDER_SLOTS, defaultReminders } from "../../data/reminders.js";
import { useSession } from "../../store/SessionContext.jsx";
import { LotusMark } from "../../components/icons/BrandIcons.jsx";

const STEPS = 3;

/**
 * ONBOARDING — regjistrimi i parë, tre hapa.
 *
 * Ruhen VETËM emri dhe oraret e kujtesave. Specifikimi i hoqi me qëllim hapat
 * për qëllime dhe kohëzgjatje, që regjistrimi të mbetet i shkurtër.
 */
export function OnboardingScreen() {
  const { completeOnboarding } = useSession();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [reminders, setReminders] = useState(defaultReminders);

  const canAdvance = step !== 1 || name.trim().length > 0;

  const next = () => {
    if (step < STEPS - 1) setStep(step + 1);
    else completeOnboarding({ name, reminders });
  };

  const setSlot = (id, patch) =>
    setReminders((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  return (
    <div
      className="ag-viewport"
      style={{
        background: brandSplash,
        display: "flex",
        flexDirection: "column",
        padding: `${padTop(28)} 28px ${padBottom(28)}`,
      }}
    >
      <StepBar step={step} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {step === 0 && <Welcome />}
        {step === 1 && <NameStep value={name} onChange={setName} onSubmit={next} />}
        {step === 2 && <RemindersStep reminders={reminders} onChange={setSlot} />}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            aria-label="Prapa"
            className="ag-press"
            style={{ ...sx.bareButton, ...sx.center, width: 48, height: 48, color: "rgba(255,255,255,0.8)" }}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <button
          onClick={next}
          disabled={!canAdvance}
          className="ag-press"
          style={{
            flex: 1,
            background: "#fff",
            color: T.ink,
            border: "none",
            borderRadius: radii.pill,
            padding: 16,
            fontSize: 15.5,
            fontWeight: 700,
            cursor: canAdvance ? "pointer" : "default",
            opacity: canAdvance ? 1 : 0.45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {step === STEPS - 1 ? (
            <>
              <Check size={18} /> Fillo
            </>
          ) : (
            <>
              Vazhdo <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function StepBar({ step }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
      {Array.from({ length: STEPS }, (_, i) => (
        <div
          key={i}
          style={{
            height: 3,
            flex: 1,
            borderRadius: 2,
            background: i <= step ? "#fff" : "rgba(255,255,255,0.25)",
            transition: "background .3s",
          }}
        />
      ))}
    </div>
  );
}

/** Hapi 1 — mirëseardhje: logo e animuar + mesazh. */
function Welcome() {
  return (
    <div style={{ textAlign: "center" }}>
      {/* animacioni i ngadaltë i frymëmarrjes jep ndjesinë e praktikës */}
      <div style={{ animation: "breathe 5s ease-in-out infinite", display: "inline-block" }}>
        <LotusMark size={84} />
      </div>

      <h1
        style={{
          color: "#fff",
          fontFamily: fonts.display,
          fontSize: "clamp(28px, 8.6vw, 36px)",
          fontWeight: 700,
          margin: "26px 0 14px",
          lineHeight: 1.2,
        }}
      >
        Mirë se erdhe
      </h1>
      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: 1.6, margin: 0 }}>
        Një hapësirë e qetë për frymëmarrje, meditim dhe kthim te vetja.
        <br />
        Le t&apos;i marrim dy gjëra, dhe nisim.
      </p>
    </div>
  );
}

/** Hapi 2 — emri. */
function NameStep({ value, onChange, onSubmit }) {
  return (
    <div>
      <h1
        style={{
          color: "#fff",
          fontFamily: fonts.display,
          fontSize: "clamp(25px, 7.6vw, 32px)",
          fontWeight: 700,
          margin: "0 0 10px",
        }}
      >
        Si të të thërrasim?
      </h1>
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: "0 0 26px", lineHeight: 1.55 }}>
        Emri yt do të shfaqet në përshëndetjet e ditës.
      </p>

      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onSubmit()}
        placeholder="Emri"
        autoComplete="given-name"
        enterKeyHint="next"
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: radii.lg,
          padding: "16px 18px",
          color: "#fff",
          outline: "none",
        }}
      />
    </div>
  );
}

/** Hapi 3 — tre çaste kujtese, secili me ndërprerës dhe zgjedhës ore. */
function RemindersStep({ reminders, onChange }) {
  return (
    <div>
      <h1
        style={{
          color: "#fff",
          fontFamily: fonts.display,
          fontSize: "clamp(25px, 7.6vw, 32px)",
          fontWeight: 700,
          margin: "0 0 10px",
        }}
      >
        Kur do të të kujtojmë?
      </h1>
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: "0 0 24px", lineHeight: 1.55 }}>
        Aktivizo ato që do — ose lëri të fikura dhe vendos më vonë.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {REMINDER_SLOTS.map((slot) => {
          const state = reminders[slot.id];
          return (
            <div
              key={slot.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: state.enabled ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                border: `1px solid rgba(255,255,255,${state.enabled ? 0.35 : 0.15})`,
                borderRadius: radii.lg,
                padding: "14px 16px",
                transition: "background .2s, border-color .2s",
              }}
            >
              <span style={{ ...sx.flexText, color: "#fff", fontSize: 16, fontWeight: 600 }}>
                {slot.label}
              </span>

              <input
                type="time"
                value={state.time}
                disabled={!state.enabled}
                onChange={(e) => onChange(slot.id, { time: e.target.value })}
                aria-label={`Ora për ${slot.label}`}
                style={{
                  background: "rgba(255,255,255,0.16)",
                  border: "none",
                  borderRadius: radii.sm,
                  padding: "7px 10px",
                  color: "#fff",
                  opacity: state.enabled ? 1 : 0.4,
                  colorScheme: "dark",
                }}
              />

              <WhiteSwitch
                checked={state.enabled}
                onChange={(enabled) => onChange(slot.id, { enabled })}
                label={slot.label}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Ndërprerës mbi sfond të errët. */
function WhiteSwitch({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={`Kujtesa për ${label}`}
      style={{
        width: 46,
        height: 28,
        borderRadius: 14,
        border: "none",
        cursor: "pointer",
        background: checked ? "#fff" : "rgba(255,255,255,0.25)",
        position: "relative",
        flexShrink: 0,
        transition: "background .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 4,
          left: checked ? 22 : 4,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: checked ? T.eve1 : "#fff",
          transition: "left .2s, background .2s",
        }}
      />
    </button>
  );
}
