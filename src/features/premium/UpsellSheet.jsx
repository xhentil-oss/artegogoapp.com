import { useState } from "react";
import { Check, Crown, Unlock, Bell, CreditCard } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { padBottom } from "../../theme/responsive.js";
import { PLANS, TRIAL_DAYS, planNote, trialTimeline } from "../../domain/subscription.js";
import { FREE_LIMIT } from "../../domain/access.js";
import { cancelPath } from "../../services/billing.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useSession } from "../../store/SessionContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { goldButton } from "./Paywall.jsx";

/** Ikona e secilit hap të timeline-it, sipas radhës së `trialTimeline()`. */
const STEP_ICONS = { start: Unlock, remind: Bell, bill: CreditCard };

/**
 * EKRANI I PAYWALL-IT (seksioni 8).
 *
 * Zemra e tij është timeline-i i qartë me tre hapa — modeli Headspace/Calm.
 * Arsyeja nuk është zbukurim: pjesa më e madhe e ankesave për abonime vjen
 * nga përdorues që nuk e kuptuan kur nis faturimi. Kur tri datat shihen
 * përpara se të shtypet butoni, kjo pyetje nuk mbetet e hapur.
 */
export function UpsellSheet() {
  const [plan, setPlan] = useState("year");
  const { closeUpsell } = useNavigation();
  const { subscribe } = useSession();
  useBodyScrollLock();

  const confirm = () => {
    subscribe(plan);
    closeUpsell();
  };

  return (
    <div
      onClick={closeUpsell}
      className="ag-fullscreen"
      style={{
        zIndex: 70,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: "fadeIn .25s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ag-sheet"
        style={{
          width: "100%",
          maxWidth: layout.sheetMaxWidth,
          background: "#fff",
          borderRadius: `${radii.sheet}px ${radii.sheet}px 0 0`,
          padding: `26px 26px ${padBottom(26)}`,
          maxHeight: "92%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: T.line, margin: "0 auto 22px" }} />

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Crown size={34} color={T.gold} style={{ marginBottom: 10 }} />
          <h2 style={{ color: T.ink, fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>
            Provoje {TRIAL_DAYS} ditë falas
          </h2>
          <p style={{ color: T.sub, fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
            Falas janë vetëm {FREE_LIMIT} meditime. Me abonim hapet i gjithë katalogu.
          </p>
        </div>

        <Timeline />

        <div style={{ display: "flex", gap: 10, margin: "24px 0 16px" }}>
          {PLANS.map((option) => (
            <PlanOption
              key={option.id}
              option={option}
              selected={plan === option.id}
              onSelect={() => setPlan(option.id)}
            />
          ))}
        </div>

        <button onClick={confirm} style={{ ...goldButton, padding: 15, fontSize: 15 }}>
          Fillo provën {TRIAL_DAYS}-ditore falas
        </button>

        {/* Kërkesë e Apple-it dhe e Google-it: kushtet duhen thënë pranë butonit,
            jo të fshehura pas një lidhjeje. */}
        <p style={{ color: T.faint, fontSize: 11.5, textAlign: "center", margin: "12px 0 0", lineHeight: 1.6 }}>
          Anulo kurdo nga {cancelPath()}, të paktën 24 orë para përfundimit.
          Pa anulim, abonimi rinovohet vetvetiu.
        </p>

        <button
          onClick={closeUpsell}
          style={{ ...sx.bareButton, color: T.sub, width: "100%", marginTop: 14, fontSize: 14 }}
        >
          Ndoshta më vonë
        </button>
      </div>
    </div>
  );
}

/** Tre hapat e provës, të lidhur me një vijë vertikale. */
function Timeline() {
  const steps = trialTimeline();

  return (
    <div style={{ position: "relative" }}>
      {/* Vija ndalon te hapi i fundit, jo poshtë tij — përndryshe do të dukej
          sikur pas faturimit vjen edhe diçka tjetër. */}
      <div
        style={{
          position: "absolute",
          left: 17,
          top: 18,
          bottom: 34,
          width: 2,
          background: `linear-gradient(180deg, ${T.gold}, ${T.line})`,
        }}
      />

      {steps.map((step, i) => {
        const Icon = STEP_ICONS[step.id];
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} style={{ display: "flex", gap: 14, marginBottom: isLast ? 0 : 18, position: "relative" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isLast ? T.bg2 : "rgba(224,169,60,0.16)",
                border: `1.5px solid ${isLast ? T.line : T.gold}`,
              }}
            >
              <Icon size={16} color={isLast ? T.sub : T.gold} />
            </div>

            <div style={{ paddingTop: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: T.ink, fontSize: 14.5, fontWeight: 800 }}>{step.title}</span>
                <span style={{ color: T.faint, fontSize: 11.5, fontWeight: 600 }}>{step.day}</span>
              </div>
              <div style={{ color: T.sub, fontSize: 12.5, marginTop: 2, lineHeight: 1.45 }}>
                {step.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Kartelë plani me shenjë të qartë zgjedhjeje — ✓ ari kur është aktive. */
function PlanOption({ option, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      aria-label={`Plani ${option.label}, ${option.price}`}
      style={{
        flex: 1,
        background: selected ? "rgba(224,169,60,0.10)" : T.bg2,
        border: `2px solid ${selected ? T.gold : T.line}`,
        borderRadius: radii.lg,
        padding: "16px 14px",
        cursor: "pointer",
        textAlign: "left",
        position: "relative",
      }}
    >
      {option.best && (
        <span
          style={{
            position: "absolute",
            top: -9,
            right: 12,
            background: T.gold,
            color: T.ink,
            fontSize: 9,
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 10,
            letterSpacing: 0.3,
          }}
        >
          MË E MIRA
        </span>
      )}

      {/* Shenja e zgjedhjes rri gjithmonë në të njëjtin vend: pa vendin e
          rezervuar, kartelat do të kërcenin sa herë ndërrohej plani. */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `2px solid ${selected ? T.gold : T.line}`,
          background: selected ? T.gold : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        {selected && <Check size={12} color="#fff" strokeWidth={3.5} />}
      </div>

      <div style={{ color: T.sub, fontSize: 12, marginBottom: 3 }}>{option.label}</div>
      <div style={{ color: T.ink, fontSize: 21, fontWeight: 800, letterSpacing: -0.4 }}>
        {option.price}
      </div>
      <div style={{ color: T.faint, fontSize: 11, marginTop: 2 }}>{planNote(option)}</div>
    </button>
  );
}
