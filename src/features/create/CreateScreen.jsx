import { useState } from "react";
import { Layers, Lock, Sparkles, Wand2 } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { toSequence, totalMinutes } from "../../domain/sequence.js";
import { useSession } from "../../store/SessionContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { usePlayer } from "../../store/PlayerContext.jsx";
import { Paywall } from "../premium/Paywall.jsx";
import { IntentWizard } from "./IntentWizard.jsx";
import { BlockBuilder } from "./BlockBuilder.jsx";
import { GenerateProgress } from "./GenerateProgress.jsx";

const MODES = [
  { id: "wizard", label: "Gjenero", icon: Wand2 },
  { id: "blocks", label: "Ndërto", icon: Layers },
];

/**
 * Skeda "Krijo": dy rrugë për të montuar një seancë — wizard i udhëhequr
 * ose ndërtues manual.
 *
 * Ruajtja me emër NUK ndodh këtu: sipas specifikimit ajo i takon ekranit të
 * përmbylljes, pasi seanca të jetë dëgjuar.
 */
export function CreateScreen() {
  const { isPremium } = useSession();
  const { play } = usePlayer();

  const [mode, setMode] = useState("wizard");
  const [sequence, setSequence] = useState([]);
  const [generating, setGenerating] = useState(false);

  /* "builder" e njofton ekranin e përmbylljes se seanca u ndërtua këtu —
     vetëm atëherë ai ofron ruajtjen me emër. */
  const startPlayback = () => {
    setGenerating(false);
    play(sequence, "builder");
  };

  return (
    <div style={sx.screen}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: T.ink,
          margin: `8px ${layout.gutter}px 2px`,
          letterSpacing: -0.5,
        }}
      >
        Krijo Meditimin
      </h1>
      <p style={{ fontSize: 14.5, color: T.sub, margin: `0 ${layout.gutter}px 18px` }}>
        Kombino mini-meditime në një seancë të personalizuar
      </p>

      {!isPremium ? (
        <LockedPreview />
      ) : generating ? (
        <GenerateProgress onDone={startPlayback} />
      ) : (
        <>
          <ModeSwitch value={mode} onChange={setMode} />

          {mode === "wizard" ? (
            <IntentWizard
              onGenerate={(blocks) => {
                setSequence(toSequence(blocks));
                setMode("blocks");
              }}
            />
          ) : (
            <BlockBuilder sequence={sequence} setSequence={setSequence} />
          )}

          {sequence.length > 0 && (
            <SummaryBar sequence={sequence} onCreate={() => setGenerating(true)} />
          )}
        </>
      )}
    </div>
  );
}

/**
 * Parapamja e kyçur për llogaritë falas.
 *
 * Wizard-i shfaqet i zbehtë vetëm si shembull i asaj që shkyçet. Më parë ishte
 * thjesht `pointerEvents: none` — prekja nuk bënte asgjë dhe dukej e prishur,
 * jo e kyçur. Tani e gjithë zona është buton që hap abonimin, dhe një shenjë
 * dryni e thotë hapur pse nuk reagon.
 */
function LockedPreview() {
  const { openUpsell } = useNavigation();

  return (
    <div style={{ padding: `0 ${layout.gutter}px` }}>
      <Paywall feature="Ndërtuesi i pakufizuar i meditimit" />

      <div style={{ position: "relative", marginTop: 16 }}>
        <div style={{ opacity: 0.4, pointerEvents: "none", filter: "grayscale(0.35)" }}>
          <div style={{ margin: `0 -${layout.gutter}px` }}>
            <IntentWizard onGenerate={() => {}} />
          </div>
        </div>

        <button
          onClick={openUpsell}
          aria-label="Shkyç ndërtuesin e meditimit"
          style={{
            position: "absolute",
            inset: 0,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: T.ink,
              color: "#fff",
              borderRadius: radii.pill,
              padding: "11px 18px",
              fontSize: 13.5,
              fontWeight: 700,
              boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
            }}
          >
            <Lock size={15} /> Kyçur — prek për ta hapur
          </span>
        </button>
      </div>
    </div>
  );
}

function ModeSwitch({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, margin: `0 ${layout.gutter}px 18px` }}>
      {MODES.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              ...sx.center,
              gap: 7,
              background: active ? T.ink : T.bg2,
              color: active ? "#fff" : T.sub,
              border: `1px solid ${active ? T.ink : T.line}`,
              borderRadius: radii.md,
              padding: 12,
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: 700,
            }}
          >
            <Icon size={15} /> {label}
          </button>
        );
      })}
    </div>
  );
}

/** Shirit i ngjitur poshtë: totali i seancës dhe nisja. */
function SummaryBar({ sequence, onCreate }) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 92,
        margin: `18px ${layout.gutter}px 0`,
        background: T.ink,
        borderRadius: radii.lg,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ ...sx.flexText, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
        {sequence.length} hapa ·{" "}
        <span style={{ color: "#fff", fontWeight: 700 }}>{totalMinutes(sequence)}m</span>
      </div>

      <button
        onClick={onCreate}
        className="ag-press"
        style={{
          background: "#fff",
          color: T.ink,
          border: "none",
          borderRadius: radii.pill,
          height: 44,
          padding: "0 18px",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexShrink: 0,
        }}
      >
        <Sparkles size={16} /> Krijo &amp; Luaj
      </button>
    </div>
  );
}
