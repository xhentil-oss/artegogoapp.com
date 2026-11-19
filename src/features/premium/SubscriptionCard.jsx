import { useState } from "react";
import { Crown, ExternalLink } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { STATUS_LABEL, TRIAL_DAYS, formatDate } from "../../domain/subscription.js";
import { cancelPath, openPortal } from "../../services/billing.js";
import { useSession } from "../../store/SessionContext.jsx";
import { Paywall } from "./Paywall.jsx";

/**
 * Gjendja e abonimit, e dukshme dhe e menaxhueshme.
 *
 * Kur nuk ka abonim shfaqet paywall-i; përndryshe shfaqet plani, ditët e
 * mbetura dhe data e faturimit të radhës, plus anulimi ose rikthimi.
 */
export function SubscriptionCard() {
  const { subscriptionStatus, subscription, cancelSubscription, resumeSubscription } = useSession();
  const { status, plan, daysLeft, renewsAt, accessUntil } = subscriptionStatus;

  /* `null` · `"pyet"` (konfirmim) · `"pune"` (duke pritur serverin) */
  const [faza, setFaza] = useState(null);
  const [gabim, setGabim] = useState(null);

  /*
   * A e mban Stripe këtë abonim?
   *
   * ⚠️  VENDOS NËSE BUTONI I ANULIMIT EKZISTON. Te App Store dhe Google Play
   *     anulimi bëhet VETËM te cilësimet e pajisjes; një buton brenda
   *     aplikacionit do të ndalte aksesin ndërsa dyqani do të vazhdonte të
   *     faturonte — pra do të ishte më keq se mungesa e tij.
   *
   *     Te Stripe është e kundërta: anulimi është veprim i vërtetë, dhe
   *     klientja e kërkoi shprehimisht si të detyrueshëm (19 nëntor 2026).
   */
  const stripe = subscription?.provider === "stripe";

  const anulo = async () => {
    setFaza("pune");
    setGabim(null);
    const result = await cancelSubscription();
    setFaza(null);
    if (!result?.ok) setGabim(result?.error ?? "Anulimi nuk u krye. Provo sërish.");
  };

  const rikthe = async () => {
    setFaza("pune");
    setGabim(null);
    const result = await resumeSubscription();
    setFaza(null);
    if (!result?.ok) setGabim(result?.error ?? "Rikthimi nuk u krye. Provo sërish.");
  };

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
  /* Dhurata e dhjetorit: nuk faturohet, nuk rinovohet, nuk anulohet. */
  const promo = status === "promo";

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
            {/* ⚠️  Te dhurata NUK shkruhet çmimi i planit. Ai numër do të
                   premtonte një faturë që nuk vjen kurrë. */}
            {promo ? "Dhuratë · nuk faturohesh" : `Plani ${plan.label} · ${plan.price}`}
          </div>
        </div>
      </header>

      <Line
        label={
          trial
            ? "Prova mbaron pas"
            : cancelled || promo
              ? "Aksesi mbaron pas"
              : "Rinovohet pas"
        }
        value={`${daysLeft} ditë`}
      />
      <Line
        label={
          cancelled || promo
            ? "Aksesi deri më"
            : trial
              ? "Faturimi i parë"
              : "Faturimi i radhës"
        }
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

      {promo && (
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.55, margin: "12px 0 0" }}>
          Muaji falas i dhjetorit. Nuk ka faturim dhe nuk ka çfarë të anulohet —
          pas datës së mësipërme vendos vetë nëse do të vazhdosh.
        </p>
      )}

      {gabim && (
        <p style={{ color: "#FFB4A8", fontSize: 12, lineHeight: 1.5, margin: "12px 0 0" }}>{gabim}</p>
      )}

      {/*
        ⚠️  TRE GJENDJE, JO DY.

            · Stripe + aktiv      → butoni i anulimit, me një hap konfirmimi.
            · Stripe + i anuluar  → butoni i rikthimit, sa kohë periudha zgjat.
            · Dyqan ose dhuratë   → vetëm udhëzimi; nuk kemi çfarë të anulojmë.
      */}
      {stripe && !promo && !cancelled && (
        <CancelBlock faza={faza} onAsk={() => setFaza("pyet")} onBack={() => setFaza(null)} onConfirm={anulo} until={accessUntil ?? renewsAt} trial={trial} />
      )}

      {stripe && cancelled && (
        <DarkButton onClick={rikthe} disabled={faza === "pune"}>
          {faza === "pune" ? "Duke rikthyer…" : "Rikthe rinovimin"}
        </DarkButton>
      )}

      {stripe && (
        <button
          onClick={openPortal}
          style={{
            ...sx.bareButton,
            width: "100%",
            marginTop: 10,
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Ndrysho kartën ose shkarko faturat
        </button>
      )}

      {!stripe && !cancelled && !promo && <ManageNotice />}
    </section>
  );
}

/**
 * Anulimi, me një hap konfirmimi.
 *
 * ⚠️  NJË SHTYPJE NUK MJAFTON, DHE KJO NUK ËSHTË PENGESË E QËLLIMSHME. Butoni
 *     rri mes të dhënave të abonimit, ku gishti rrëshqet; një anulim i rastit
 *     do të ndalte një rinovim që njeriu e donte, dhe rikthimi do të kërkonte
 *     të kuptuarit se çfarë ndodhi. Konfirmimi e thotë edhe deri kur mbetet
 *     aksesi — pikërisht pyetja që e ndal dikë nga paniku.
 */
function CancelBlock({ faza, onAsk, onBack, onConfirm, until, trial }) {
  if (faza !== "pyet") {
    return (
      <DarkButton onClick={onAsk} disabled={faza === "pune"}>
        {faza === "pune" ? "Duke anuluar…" : "Anulo abonimin"}
      </DarkButton>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: radii.md,
        padding: "13px 14px",
        marginTop: 14,
      }}
    >
      <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>
        Ta ndalim rinovimin?
      </p>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.55, margin: "6px 0 12px" }}>
        {trial
          ? `Nuk tarifohesh fare. Aksesi vazhdon deri më ${formatDate(until)}.`
          : `Nuk tarifohesh më. Gjithçka mbetet e hapur deri më ${formatDate(until)} — ditët që ke paguar nuk humbasin.`}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onBack}
          style={{
            ...sx.bareButton,
            flex: 1,
            padding: "10px 12px",
            borderRadius: radii.md,
            border: "1px solid rgba(255,255,255,0.22)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Jo, vazhdo
        </button>
        <button
          onClick={onConfirm}
          style={{
            ...sx.bareButton,
            flex: 1,
            padding: "10px 12px",
            borderRadius: radii.md,
            background: "#fff",
            color: "#1A1A2E",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          Po, anulo
        </button>
      </div>
    </div>
  );
}

/** Buton mbi sfondin e errët të kartës — i njëjti stil për të dy veprimet. */
function DarkButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sx.bareButton,
        width: "100%",
        marginTop: 14,
        padding: 12,
        borderRadius: radii.pill,
        border: "1px solid rgba(255,255,255,0.26)",
        color: "#fff",
        fontSize: 13.5,
        fontWeight: 700,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
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
