import { Check, Crown, ExternalLink, RotateCcw, UserMinus, X } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { STATUS_LABEL, TRIAL_DAYS, formatDate } from "../../domain/subscription.js";
import { cancelPath } from "../../services/billing.js";
import { useSession } from "../../store/SessionContext.jsx";
import { Paywall } from "./Paywall.jsx";

/**
 * Gjendja e abonimit, e dukshme dhe e menaxhueshme.
 *
 * Kur nuk ka abonim shfaqet paywall-i; përndryshe shfaqet plani, ditët e
 * mbetura dhe data e faturimit të radhës, plus anulimi ose rikthimi.
 */
export function SubscriptionCard() {
  const { subscriptionStatus } = useSession();
  const { status, plan, daysLeft, renewsAt, accessUntil } = subscriptionStatus;

  if (status === "none" || status === "expired") {
    return (
      <div style={{ marginBottom: 20 }}>
        {status === "expired" && (
          <div
            style={{
              background: T.bg2,
              border: `1px solid ${T.line}`,
              borderRadius: radii.md,
              padding: "10px 14px",
              marginBottom: 10,
              fontSize: 13,
              color: T.sub,
            }}
          >
            Abonimi yt ka skaduar. Përmbajtja premium është e kyçur sërish.
          </div>
        )}
        <Paywall
          feature={
            status === "expired"
              ? "Rikthe aksesin e plotë"
              : "Akses i plotë në të gjitha kategoritë dhe programet"
          }
        />
      </div>
    );
  }

  const trial = status === "trial";
  const cancelled = status === "cancelled";

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1A1A2E, #2B1B4A)",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={circle(34, "rgba(224,169,60,0.18)")}>
          <Crown size={17} color={T.gold} />
        </div>
        <div style={sx.flexText}>
          <div style={{ color: "#fff", fontSize: 15.5, fontWeight: 800 }}>
            {STATUS_LABEL[status]}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12.5, marginTop: 1 }}>
            Plani {plan.label} · {plan.price}
          </div>
        </div>
      </header>

      <Line
        label={trial ? "Prova mbaron pas" : cancelled ? "Aksesi mbaron pas" : "Rinovohet pas"}
        value={`${daysLeft} ditë`}
      />
      <Line
        label={cancelled ? "Aksesi deri më" : trial ? "Faturimi i parë" : "Faturimi i radhës"}
        value={formatDate(accessUntil ?? renewsAt)}
      />

      {trial && (
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.55, margin: "12px 0 0" }}>
          Prova falas zgjat {TRIAL_DAYS} ditë. Nuk faturohesh derisa të mbarojë.
        </p>
      )}

      {cancelled && (
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.55, margin: "12px 0 0" }}>
          Rinovimi u ndal. Përmbajtja premium mbetet e hapur deri në datën e mësipërme.
        </p>
      )}

      {!cancelled && <ManageNotice />}
    </section>
  );
}

/**
 * Ku anulohet vërtet abonimi.
 *
 * Nuk ka buton "Anulo" këtu me qëllim: abonimi kalon përmes In-App Purchase,
 * dhe si Apple ashtu edhe Google e mbajnë anulimin te cilësimet e pajisjes.
 * Një buton brenda aplikacionit do të premtonte diçka që s'e bën dot — do të
 * ndalte vetëm aksesin, ndërsa faturimi te dyqani do të vazhdonte.
 */
function ManageNotice() {
  return (
    <div
      style={{
        display: "flex",
        gap: 9,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: radii.md,
        padding: "11px 13px",
        marginTop: 14,
      }}
    >
      <ExternalLink size={14} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 11.5, lineHeight: 1.55 }}>
        Menaxho ose anulo nga <strong style={{ color: "#fff" }}>{cancelPath()}</strong>, të paktën
        24 orë para përfundimit.
      </span>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderTop: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{label}</span>
      <span style={{ color: "#fff", fontSize: 13.5, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/**
 * Kontroll demonstrimi — shfaqet vetëm në modalitetin Admin.
 * Zhvendos "orën" përpara, që kalimet provë → aktiv → skaduar të shihen
 * pa pritur ditë të vërteta.
 */
export function SubscriptionDemoControls() {
  const {
    subscription,
    subscriptionStatus,
    shiftDemoClock,
    resetDemoClock,
    cancelSubscription,
    resumeSubscription,
    resetToFreeDemo,
  } = useSession();
  if (!subscription) return null;

  const offset = subscription.offsetDays ?? 0;
  const cancelled = subscriptionStatus.status === "cancelled";

  return (
    <section style={{ ...sx.panel, borderRadius: radii.lg, padding: 16, marginBottom: 12 }}>
      <div style={{ color: T.ink, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
        Simulo kalimin e kohës (demo)
      </div>
      <div style={{ color: T.sub, fontSize: 12.5, marginBottom: 12 }}>
        Zhvendosur {offset} ditë · gjendja tani: <strong>{STATUS_LABEL[subscriptionStatus.status]}</strong>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[1, 3, 8, 40].map((days) => (
          <button
            key={days}
            onClick={() => shiftDemoClock(days)}
            className="ag-press"
            style={{
              background: T.bg,
              border: `1px solid ${T.line}`,
              borderRadius: radii.pill,
              padding: "9px 14px",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 600,
              color: T.ink,
            }}
          >
            +{days} ditë
          </button>
        ))}
        <button
          onClick={resetDemoClock}
          className="ag-press"
          style={{
            background: T.ink,
            border: "none",
            borderRadius: radii.pill,
            padding: "9px 14px",
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 700,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Check size={13} /> Rivendos
        </button>
      </div>

      {/* Anulimi rri vetëm këtu. Në aplikacionin e vërtetë e bën dyqani, jo
          aplikacioni — ky buton thjesht simulon atë që kthen dyqani. */}
      <div
        style={{
          borderTop: `1px solid ${T.line}`,
          marginTop: 14,
          paddingTop: 12,
        }}
      >
        <div style={{ color: T.sub, fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
          Simulo përgjigjen e dyqanit (në prodhim vjen nga App Store / Google Play):
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <DemoChip onClick={cancelled ? resumeSubscription : cancelSubscription}>
            {cancelled ? (
              <>
                <RotateCcw size={13} /> Rikthe abonimin
              </>
            ) : (
              <>
                <X size={13} /> Anulo abonimin
              </>
            )}
          </DemoChip>

          {/* Kthimi te llogaria falas — mënyra e vetme për ta parë sërish
              aplikacionin me dryna, pa fshirë ruajtjen e shfletuesit me dorë. */}
          <DemoChip onClick={resetToFreeDemo}>
            <UserMinus size={13} /> Kthehu te llogaria falas
          </DemoChip>
        </div>
      </div>
    </section>
  );
}

/** Buton i vogël i kontrolleve demo. */
function DemoChip({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="ag-press"
      style={{
        background: T.bg,
        border: `1px solid ${T.line}`,
        borderRadius: radii.pill,
        padding: "9px 14px",
        cursor: "pointer",
        fontSize: 12.5,
        fontWeight: 600,
        color: T.ink,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {children}
    </button>
  );
}
