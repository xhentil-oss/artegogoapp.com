import { Crown, ExternalLink } from "lucide-react";
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
