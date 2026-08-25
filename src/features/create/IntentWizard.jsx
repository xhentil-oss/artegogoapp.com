import { useState } from "react";
import { ChevronLeft, ChevronRight, Wand2 } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { autoGrid } from "../../theme/responsive.js";
import { listIntentions } from "../../services/contentRepository.js";
import { buildGuidedSequence } from "../../domain/sequence.js";
import { PrimaryButton } from "../../components/ui/Controls.jsx";

const DEPTHS = ["e lehtë", "e mesme", "e thellë"];
const STEP_COUNT = 3;

/**
 * Wizard tri-hapësh: qëllim → kohëzgjatje → thellësi.
 * Në fund thërret `onGenerate` me blloqet e propozuara.
 */
export function IntentWizard({ onGenerate }) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState(null);
  const [duration, setDuration] = useState(20);
  const [depth, setDepth] = useState("e mesme");

  const canAdvance = step !== 0 || intent !== null;

  const generate = () => onGenerate(buildGuidedSequence({ intent, maxMinutes: duration }));

  return (
    <div
      style={{
        background: T.bg2,
        borderRadius: radii.xxl,
        padding: 22,
        border: `1px solid ${T.line}`,
        margin: `0 ${layout.gutter}px`,
      }}
    >
      <StepBar step={step} />

      {step === 0 && <IntentStep value={intent} onChange={setIntent} />}
      {step === 1 && <DurationStep value={duration} onChange={setDuration} />}
      {step === 2 && <DepthStep value={depth} onChange={setDepth} />}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            ...sx.bareButton,
            color: T.sub,
            fontSize: 14,
            fontWeight: 600,
            opacity: step === 0 ? 0.3 : 1,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <ChevronLeft size={16} /> Prapa
        </button>

        {step < STEP_COUNT - 1 ? (
          <PrimaryButton onClick={() => setStep(step + 1)} disabled={!canAdvance}>
            Vazhdo <ChevronRight size={16} />
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={generate}>
            <Wand2 size={16} /> Gjenero
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

function StepBar({ step }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
      {Array.from({ length: STEP_COUNT }, (_, i) => (
        <div
          key={i}
          style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? T.ink : T.line }}
        />
      ))}
    </div>
  );
}

function StepTitle({ children }) {
  return <h3 style={{ fontSize: 20, fontWeight: 800, color: T.ink, margin: 0 }}>{children}</h3>;
}

function IntentStep({ value, onChange }) {
  return (
    <div>
      <StepTitle>Çfarë ke nevojë sot?</StepTitle>
      {/* 100px minimum: 2 kolona edhe brenda panelit në ekran 320px */}
      <div style={{ ...autoGrid(100, 10), marginTop: 16 }}>
        {listIntentions().map((intention) => {
          const Icon = intention.icon;
          const selected = value === intention.id;
          return (
            <button
              key={intention.id}
              onClick={() => onChange(intention.id)}
              style={{
                background: selected ? tile(intention.g) : T.bg,
                border: `1px solid ${selected ? "transparent" : T.line}`,
                borderRadius: 14,
                padding: "16px 10px",
                cursor: "pointer",
                color: selected ? "#fff" : T.ink,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon size={20} color={selected ? "#fff" : intention.g[1]} />
              <span style={{ fontSize: 12.5, textAlign: "center" }}>{intention.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DurationStep({ value, onChange }) {
  return (
    <div>
      <StepTitle>Sa kohë ke?</StepTitle>
      <div style={{ marginTop: 26, textAlign: "center" }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: T.ink }}>{value}</div>
        <div style={{ color: T.sub, fontSize: 12, letterSpacing: 2, marginBottom: 22 }}>MINUTA</div>
        <input
          type="range"
          min={5}
          max={45}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: T.ink }}
        />
      </div>
    </div>
  );
}

function DepthStep({ value, onChange }) {
  return (
    <div>
      <StepTitle>Sa thellë?</StepTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {DEPTHS.map((depth) => (
          <button
            key={depth}
            onClick={() => onChange(depth)}
            style={{
              background: value === depth ? T.ink : T.bg,
              color: value === depth ? "#fff" : T.ink,
              border: `1px solid ${value === depth ? T.ink : T.line}`,
              borderRadius: 14,
              padding: 16,
              cursor: "pointer",
              textAlign: "left",
              textTransform: "capitalize",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {depth}
          </button>
        ))}
      </div>
    </div>
  );
}
