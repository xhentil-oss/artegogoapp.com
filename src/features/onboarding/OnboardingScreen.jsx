import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { REMINDER_SLOTS, defaultReminders } from "../../data/reminders.js";
import { useSession } from "../../store/SessionContext.jsx";

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
            style={{
              ...sx.center,
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: radii.round,
              background: T.bg2,
              border: `1px solid ${T.line}`,
              color: T.sub,
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <button
          onClick={next}
          disabled={!canAdvance}
          className="ag-press"
          style={{
            flex: 1,
            background: T.ink,
            color: "#fff",
            border: "none",
            borderRadius: radii.pill,
            padding: 18,
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
              <Sparkles size={18} /> Përfundo
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
            background: i <= step ? T.ink : T.line,
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
        {/* E njëjta logo si te hyrja — nga `public/`, pra me rrugë absolute. */}
        <img src="/transparent-logo-2.png" alt="Arte Gogo" style={{ height: 84, width: "auto", display: "block" }} />
      </div>

      <h1
        style={{
          color: T.ink,
          fontSize: "clamp(28px, 8.6vw, 36px)",
          fontWeight: 700,
          margin: "26px 0 14px",
          lineHeight: 1.2,
        }}
      >
        Mirë se erdhe
      </h1>
      <p style={{ color: T.sub, fontSize: 16, lineHeight: 1.6, margin: 0 }}>
        Kjo është hapësira jote për të krijuar.
        <br />
        Për të larguar zhurmën e çdo shpërqëndrimi,
        <br />
        për të dëgjuar zemrën,
        <br />
        dhe për t’u rikthyer tek vetja,
        <br />
        për të ndier gëzimin e jetës
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
          color: T.ink,
          fontSize: "clamp(25px, 7.6vw, 32px)",
          fontWeight: 700,
          margin: "0 0 10px",
        }}
      >
        Si të të thërrasim?
      </h1>
      <p style={{ color: T.sub, fontSize: 15, margin: "0 0 26px", lineHeight: 1.55 }}>
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
          background: T.bg2,
          border: `1px solid ${T.line}`,
          borderRadius: radii.lg,
          padding: "16px 18px",
          color: T.ink,
          outline: "none",
        }}
      />
    </div>
  );
}

/** Hapi 3 — tre çaste kujtese, secili me ikonë, ndërprerës dhe zgjedhës ore. */
function RemindersStep({ reminders, onChange }) {
  return (
    <div>
      <h1
        style={{
          color: T.ink,
          fontSize: "clamp(25px, 7.6vw, 32px)",
          fontWeight: 700,
          margin: "0 0 10px",
        }}
      >
        Kur të të kujtojmë?
      </h1>
      <p style={{ color: T.sub, fontSize: 15, margin: "0 0 24px", lineHeight: 1.55 }}>
        Çdo ditë do të marrësh një meditim të ri për çastin që zgjedh. Aktivizo ato që do dhe cakto
        orarin — ose lëri të fikura.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {REMINDER_SLOTS.map((slot) => {
          const state = reminders[slot.id];
          const Ikona = slot.icon;
          return (
            <div
              key={slot.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                /* E ndezur = kartë e bardhë me kufi të zi; e fikur = kartë gri pa
                   kufi. Kufiri rri 2px edhe kur është i tejdukshëm, që rreshti të
                   mos kërcejë kur ndizet. */
                background: state.enabled ? T.bg : T.bg2,
                border: `2px solid ${state.enabled ? T.ink : "transparent"}`,
                borderRadius: radii.lg,
                padding: "12px 14px",
                transition: "background .2s, border-color .2s",
              }}
            >
              {/* Vijë e hollë me ngjyrë, jo emoji. Ngjyra rri edhe kur kujtesa
                  është e fikur: rreshti i fikur njihet tashmë nga sfondi gri,
                  kufiri i hequr, ora e fshehur dhe ndërprerësi — ta zbehje
                  edhe ikonën ishte sinjali i pestë për të njëjtën gjë. */}
              <Ikona
                size={22}
                strokeWidth={1.6}
                color={slot.color}
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              />

              <span style={sx.flexText}>
                <span style={{ display: "block", color: T.ink, fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
                  {slot.label}
                </span>
                <span style={{ display: "block", color: T.sub, fontSize: 12.5, marginTop: 2 }}>
                  {slot.hint}
                </span>
              </span>

              {/* ORA — shfaqet vetëm kur kujtesa është e ndezur; një orë pa
                  kujtesë nuk do të thotë asgjë.

                  ⚠️  Teksti shkruhet nga ne, jo nga `<input type="time">`.
                      Ai i fundit e formaton orën sipas gjuhës së SHFLETUESIT:
                      me anglisht del "07:00 AM" me një ikonë sahati, ndërsa
                      specifikimi kërkon "07:00" të pastër kudo. Input-i mbetet
                      sipër, i tejdukshëm — pra zgjedhësi vendas i telefonit
                      hapet si më parë, por pamja nuk varet nga gjuha. */}
              {state.enabled && (
                <label
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    background: T.bg2,
                    borderRadius: radii.sm,
                    padding: "8px 12px",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: T.ink, fontSize: 14.5, fontWeight: 700 }}>{state.time}</span>
                  <input
                    type="time"
                    value={state.time}
                    onChange={(e) => onChange(slot.id, { time: e.target.value })}
                    aria-label={`Ora për ${slot.label}`}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  />
                </label>
              )}

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

/** Ndërprerësi i kujtesës. */
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
        background: checked ? T.success : T.line,
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
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          transition: "left .2s",
        }}
      />
    </button>
  );
}
