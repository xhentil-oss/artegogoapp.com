import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { padBottom } from "../../theme/responsive.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useSession } from "../../store/SessionContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { goldButton } from "./Paywall.jsx";

const BENEFITS = [
  "Akses i plotë në të gjitha kategoritë",
  "Krijim i pakufizuar meditimesh",
  "Programe ekskluzive (7–21 ditë)",
  "Audio somatike premium",
  "Pa reklama",
];

const PLANS = [
  { id: "month", label: "Mujor", price: "9.99€", note: "/muaj" },
  { id: "year", label: "Vjetor", price: "59.99€", note: "kurse 50%", best: true },
];

/** Fletë abonimi që rrëshqet nga poshtë. */
export function UpsellSheet() {
  const [plan, setPlan] = useState("year");
  const { closeUpsell } = useNavigation();
  const { subscribe } = useSession();
  useBodyScrollLock();

  const confirm = () => {
    subscribe();
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
          /* 88% e viewport-it dinamik: fletja mbetet e kapshme edhe kur
             shiriti i browser-it është i dukshëm */
          maxHeight: "88%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: T.line, margin: "0 auto 22px" }} />

        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <Crown size={36} color={T.gold} style={{ marginBottom: 10 }} />
          <h2 style={{ color: T.ink, fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Bëhu Premium</h2>
          <p style={{ color: T.sub, fontSize: 13.5, margin: 0 }}>
            Zhblloko të gjithë eksperiencën Arte Gogo
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {BENEFITS.map((benefit) => (
            <div key={benefit} style={{ display: "flex", alignItems: "center", gap: 11, color: T.ink, fontSize: 14 }}>
              <div style={circle(22, "rgba(224,169,60,0.15)")}>
                <Check size={13} color={T.gold} />
              </div>
              {benefit}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {PLANS.map((option) => (
            <button
              key={option.id}
              onClick={() => setPlan(option.id)}
              style={{
                flex: 1,
                background: plan === option.id ? "rgba(224,169,60,0.1)" : T.bg2,
                border: `1.5px solid ${plan === option.id ? T.gold : T.line}`,
                borderRadius: radii.lg,
                padding: 16,
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
                    color: "#3A2410",
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 10,
                  }}
                >
                  MË E MIRA
                </span>
              )}
              <div style={{ color: T.sub, fontSize: 12, marginBottom: 4 }}>{option.label}</div>
              <div style={{ color: T.ink, fontSize: 22, fontWeight: 800 }}>{option.price}</div>
              <div style={{ color: T.faint, fontSize: 11 }}>{option.note}</div>
            </button>
          ))}
        </div>

        <button onClick={confirm} style={{ ...goldButton, padding: 15, fontSize: 15 }}>
          Fillo provën 7-ditore falas
        </button>
        <button
          onClick={closeUpsell}
          style={{ ...sx.bareButton, color: T.sub, width: "100%", marginTop: 12, fontSize: 14 }}
        >
          Ndoshta më vonë
        </button>
      </div>
    </div>
  );
}
