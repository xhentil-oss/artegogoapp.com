import { useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { totalMinutes } from "../../domain/sequence.js";
import { useSession } from "../../store/SessionContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { usePlayer } from "../../store/PlayerContext.jsx";
import { Paywall } from "../premium/Paywall.jsx";
import { BlockBuilder } from "./BlockBuilder.jsx";
import { FILL_MS, GenerateProgress } from "./GenerateProgress.jsx";
import { tingulliMbushjes } from "../../lib/sfx.js";

/**
 * Skeda "Krijo": seanca montohet hap pas hapi te ndërtuesi.
 *
 * ⚠️  Kishte dy rrugë — "Gjenero" (wizard që e zgjidhte vetë seancën nga një
 *     qëllim) dhe "Ndërto". Klientja e hoqi të parën (17 shtator 2026), ndaj
 *     ra edhe ndërruesi mes tyre: një çelës me një zgjedhje të vetme nuk është
 *     çelës. `IntentWizard.jsx` mbeti në dosje, i pathirrur, nëse kthehet.
 *
 * Ruajtja me emër NUK ndodh këtu: sipas specifikimit ajo i takon ekranit të
 * përmbylljes, pasi seanca të jetë dëgjuar.
 */
export function CreateScreen() {
  const { isPremium } = useSession();
  const { play } = usePlayer();

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
          fontWeight: 700,
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
          <BlockBuilder sequence={sequence} setSequence={setSequence} />

          {sequence.length > 0 && (
            <SummaryBar
              sequence={sequence}
              onCreate={() => {
                /* Tingulli nis KËTU, brenda klikimit: iOS-i e lejon zërin vetëm
                   nga një prekje e vërtetë. Shih `lib/sfx.js`. */
                tingulliMbushjes(FILL_MS);
                setGenerating(true);
              }}
            />
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
            <BlockBuilder sequence={[]} setSequence={() => {}} />
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
