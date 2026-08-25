import { useState } from "react";
import { Bookmark, Check, Layers, Sparkles, Wand2, X } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { toSequence, totalMinutes } from "../../domain/sequence.js";
import { useSession } from "../../store/SessionContext.jsx";
import { usePlayer } from "../../store/PlayerContext.jsx";
import { Paywall } from "../premium/Paywall.jsx";
import { IntentWizard } from "./IntentWizard.jsx";
import { BlockBuilder } from "./BlockBuilder.jsx";
import { GenerateProgress } from "./GenerateProgress.jsx";
import { SavedSessions } from "./SavedSessions.jsx";
import { useSavedSessions } from "./useSavedSessions.js";

const MODES = [
  { id: "wizard", label: "Gjenero", icon: Wand2 },
  { id: "blocks", label: "Ndërto", icon: Layers },
];

/**
 * Skeda "Krijo": dy rrugë për të montuar një seancë — wizard i udhëhequr
 * ose ndërtues manual — dhe ruajtja e saj me emër.
 */
export function CreateScreen() {
  const { isPremium } = useSession();
  const { play } = usePlayer();
  const { sessions, save, remove } = useSavedSessions();

  const [mode, setMode] = useState("wizard");
  const [sequence, setSequence] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const startPlayback = () => {
    setGenerating(false);
    play(sequence);
  };

  const handleSave = (name) => {
    if (!save(name, sequence)) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          <SavedSessions sessions={sessions} onRemove={remove} />

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
            <SummaryBar
              sequence={sequence}
              saved={saved}
              onSave={handleSave}
              onCreate={() => setGenerating(true)}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Wizard-i i shuar pas paywall-it, sa për të treguar vlerën. */
function LockedPreview() {
  return (
    <div style={{ padding: `0 ${layout.gutter}px` }}>
      <Paywall feature="Ndërtuesi i pakufizuar i meditimit" />
      <div style={{ marginTop: 16, opacity: 0.5, pointerEvents: "none" }}>
        <div style={{ margin: `0 -${layout.gutter}px` }}>
          <IntentWizard onGenerate={() => {}} />
        </div>
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

/**
 * Shirit i ngjitur poshtë: totali, ruajtja me emër, dhe nisja.
 * Fusha e emrit shfaqet vetëm kur kërkohet — shiriti mbetet i qetë.
 */
function SummaryBar({ sequence, saved, onSave, onCreate }) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  const confirm = () => {
    onSave(name);
    setName("");
    setNaming(false);
  };

  return (
    <div
      style={{
        position: "sticky",
        bottom: 92,
        margin: `18px ${layout.gutter}px 0`,
        background: T.ink,
        borderRadius: radii.lg,
        padding: naming ? "14px 14px" : "14px 18px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      }}
    >
      {naming ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirm();
              if (e.key === "Escape") setNaming(false);
            }}
            placeholder="Emri i seancës…"
            style={{
              ...sx.flexText,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: radii.pill,
              padding: "11px 16px",
              color: "#fff",
              outline: "none",
            }}
          />
          <button
            onClick={confirm}
            disabled={!name.trim()}
            aria-label="Ruaj seancën"
            className="ag-press"
            style={{
              ...circle(44, name.trim() ? "#fff" : "rgba(255,255,255,0.2)"),
              border: "none",
              padding: 0,
              cursor: name.trim() ? "pointer" : "default",
            }}
          >
            <Check size={19} color={name.trim() ? T.ink : "rgba(255,255,255,0.6)"} />
          </button>
          <button
            onClick={() => setNaming(false)}
            aria-label="Anulo"
            className="ag-press"
            style={{ ...sx.bareButton, ...sx.center, width: 40, height: 40, flexShrink: 0 }}
          >
            <X size={20} color="rgba(255,255,255,0.7)" />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ ...sx.flexText, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            {sequence.length} hapa ·{" "}
            <span style={{ color: "#fff", fontWeight: 700 }}>{totalMinutes(sequence)}m</span>
          </div>

          <button
            onClick={() => setNaming(true)}
            aria-label="Ruaj seancën me emër"
            className="ag-press"
            style={{
              ...sx.bareButton,
              ...sx.center,
              gap: 6,
              width: "auto",
              height: 44,
              padding: "0 12px",
              borderRadius: radii.pill,
              border: "1px solid rgba(255,255,255,0.3)",
              color: saved ? "#fff" : "rgba(255,255,255,0.85)",
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {saved ? <Check size={15} /> : <Bookmark size={15} />}
            {saved ? "U ruajt" : "Ruaj"}
          </button>

          <button
            onClick={onCreate}
            style={{
              background: "#fff",
              color: T.ink,
              border: "none",
              borderRadius: radii.pill,
              height: 44,
              padding: "0 16px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} /> Luaj
          </button>
        </div>
      )}
    </div>
  );
}
