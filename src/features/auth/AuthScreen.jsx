import { useState } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { T, fonts, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { brandSplash } from "../../theme/gradients.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import {
  MIN_PASSWORD,
  clearResetFromUrl,
  requestReset,
  resetTokenFromUrl,
} from "../../services/auth.js";
import { useSession } from "../../store/SessionContext.jsx";

const MODES = {
  in: { title: "Mirë se u ktheve", cta: "Hyr", swap: "Nuk ke llogari? Krijo një", other: "up" },
  up: { title: "Krijo llogarinë", cta: "Vazhdo", swap: "Ke llogari? Hyr", other: "in" },
  forgot: {
    title: "Rivendos fjalëkalimin",
    cta: "Dërgo link-un",
    swap: "Kthehu te hyrja",
    other: "in",
  },
  reset: {
    title: "Fjalëkalim i re",
    cta: "Ruaj dhe hyr",
    swap: "Kthehu te hyrja",
    other: "in",
  },
};

/**
 * HYRJA NË LLOGARI — ekrani i parë, para onboarding-ut.
 *
 * Rendi: llogaria → onboarding → aplikacioni. Onboarding-u pyet emrin dhe
 * oraret; llogaria është ajo që i mban ato mes pajisjeve kur të vijë backend-i.
 *
 * ⚠️  Fjalëkalimi kalon nga `services/auth` dhe NUK ruhet askund. Verifikimi i
 *     vërtetë ndodh te serveri — një kontroll brenda shfletuesit do të mund të
 *     anashkalohej nga kushdo që hap DevTools, ndaj do të ishte mashtrim.
 */
export function AuthScreen() {
  const { signIn, signUp, completeReset } = useSession();

  /*
   * Token-i lexohet një herë, në montim.
   *
   * ⚠️  Nëse është, ekrani hapet drejt te forma e fjalëkalimit të re — pa këtë
   *     përdoruesi që klikon link-un e email-it do të gjendej te hyrja, pa e
   *     ditur se çfarë duhet të bëjë.
   */
  const [resetToken] = useState(() => resetTokenFromUrl());
  const [mode, setMode] = useState(() => (resetTokenFromUrl() ? "reset" : "in"));
  const [notice, setNotice] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const meta = MODES[mode];

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    /* Katër modalitete, një formë. Fushat që nuk duhen fshihen më poshtë. */
    if (mode === "forgot") {
      const result = await requestReset(email);
      if (result.ok) setNotice(result.message);
      else setError(result.error);
      setBusy(false);
      return;
    }

    if (mode === "reset") {
      const result = await completeReset({ token: resetToken, password });
      if (result.ok) {
        /* Token-i hiqet nga adresa PATJETËR — përndryshe mbetet te historiku
           i shfletuesit dhe kopjohet bashkë me link-un. */
        clearResetFromUrl();
      } else {
        setError(result.error);
      }
      setBusy(false);
      return;
    }

    const action = mode === "in" ? signIn : signUp;
    const result = await action({ email, password });
    if (!result.ok) setError(result.error);
    setBusy(false);
  };

  const swap = () => {
    /* Kthimi te hyrja nga rivendosja heq edhe token-in nga adresa: përndryshe
       rifreskimi i radhës do ta hapte sërish formën e fjalëkalimit të re. */
    if (mode === "reset") clearResetFromUrl();
    setMode(meta.other);
    setError(null);
    setNotice(null);
  };

  return (
    <div
      className="ag-viewport"
      style={{
        background: brandSplash,
        display: "flex",
        flexDirection: "column",
        padding: `${padTop(28)} 28px ${padBottom(28)}`,
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          {/*
            Logoja e markës.

            ⚠️  Nga `public/`, pra me rrugë absolute `/transparent-logo-2.png`.
                Një import i zakonshëm do ta kalonte nëpër bundler dhe do t'i
                ndryshonte emrin; kjo mbetet e njëjta adresë edhe pas ndërtimit.

                `height` e caktuar dhe `width: auto` ruajnë përpjesëtimin
                pavarësisht se sa i gjerë është skedari.
          */}
          <img
            src="/transparent-logo-2.png"
            alt="Arte Gogo"
            style={{
              height: 72,
              width: "auto",
              display: "block",
              margin: "0 auto",
              /*
               * Skedari është vizatim i errët; sfondi këtu është gradient
               * vjollcë, ndaj mbi të mezi dallohej.
               *
               * `brightness(0)` i bën të gjitha pikselat e dukshëm të zinj,
               * `invert(1)` i kthen në të bardhë — transparenca mbetet e
               * paprekur. Kështu forma ruhet pa u dashur një skedar i dytë.
               * Nëse vjen një version i bardhë i logos, ky rresht hiqet.
               */
              filter: "brightness(0) invert(1)",
            }}
          />
          <h1
            style={{
              color: "#fff",
              fontFamily: fonts.display,
              fontSize: 30,
              fontWeight: 700,
              margin: "16px 0 8px",
              letterSpacing: -0.4,
            }}
          >
            {meta.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 14.5, margin: 0, lineHeight: 1.55 }}>
            Arte Gogo — hapësira jote e qetësisë
          </p>
        </div>

        {/* `noValidate`: `type="email"` mbahet për tastierën e telefonit (shenja
            @ e gatshme), por validimi i shfletuesit fiket. Përndryshe ai e ndal
            dërgimin me një flluskë në gjuhën e VET, dhe mesazhet tona shqip nuk
            do të shiheshin kurrë — dy stile gabimi për të njëjtën fushë. */}
        <form onSubmit={submit} noValidate>
          {/* Te "reset" email-i nuk kërkohet — token-i e mban identitetin. */}
          {mode !== "reset" && (
          <FieldRow icon={Mail}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              style={inputStyle}
            />
          </FieldRow>
          )}

          {/* Te "forgot" nuk ka fjalëkalim — dërgohet vetëm link-u. */}
          {mode !== "forgot" && (
          <FieldRow icon={Lock}>
            <input
              type={visible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Fjalëkalimi"
              aria-label="Fjalëkalimi"
              /* `new-password` te regjistrimi: përndryshe menaxheri i
                 fjalëkalimeve mbush atë të vjetër mbi një llogari të re */
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? "Fshih fjalëkalimin" : "Shfaq fjalëkalimin"}
              className="ag-press"
              style={{ ...sx.bareButton, ...sx.center, width: 34, height: 34, flexShrink: 0, cursor: "pointer" }}
            >
              {visible ? (
                <EyeOff size={17} color="rgba(255,255,255,0.7)" />
              ) : (
                <Eye size={17} color="rgba(255,255,255,0.7)" />
              )}
            </button>
          </FieldRow>
          )}

          {(mode === "up" || mode === "reset") && !error && !notice && (
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: "0 0 14px 4px" }}>
              Së paku {MIN_PASSWORD} shenja.
            </p>
          )}

          {/* Mesazhi i serverit pas kërkesës — i njëjti edhe kur email-i nuk
              ekziston, sepse ndryshe do të zbulohej cilat llogari ka. */}
          {notice && (
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: radii.md,
                padding: "11px 12px",
                marginBottom: 14,
              }}
            >
              <Mail size={15} color="#fff" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: "#fff", fontSize: 12.5, lineHeight: 1.5 }}>{notice}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,90,110,0.18)",
                border: "1px solid rgba(255,90,110,0.5)",
                borderRadius: radii.md,
                padding: "10px 12px",
                marginBottom: 14,
              }}
            >
              <AlertCircle size={15} color="#fff" style={{ flexShrink: 0 }} />
              <span style={{ color: "#fff", fontSize: 12.5, lineHeight: 1.45 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="ag-press"
            style={{
              width: "100%",
              background: "#fff",
              color: T.ink,
              border: "none",
              borderRadius: radii.pill,
              padding: 16,
              fontSize: 15.5,
              fontWeight: 700,
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.6 : 1,
              ...sx.center,
              gap: 8,
            }}
          >
            {busy ? "Një moment…" : meta.cta}
            {!busy && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Lidhja e harresës — vetëm te hyrja; te modalitetet e tjera s'ka kuptim. */}
        {mode === "in" && (
          <button
            onClick={() => {
              setMode("forgot");
              setError(null);
              setNotice(null);
            }}
            style={{
              ...sx.bareButton,
              width: "100%",
              marginTop: 14,
              color: "rgba(255,255,255,0.72)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Kam harruar fjalëkalimin
          </button>
        )}

        <button
          onClick={swap}
          style={{
            ...sx.bareButton,
            width: "100%",
            marginTop: 18,
            color: "rgba(255,255,255,0.85)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {meta.swap}
        </button>
      </div>

    </div>
  );
}

/** Fushë me ikonë majtas, mbi sfondin e errët të splash-it. */
function FieldRow({ icon: Icon, children }) {
  return (
    <div
      /* `ag-field-dark`: mban tekstin e autofill-it të bardhë mbi këtë sfond —
         shih rregullin te `styles/global.css`. */
      className="ag-field-dark"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.24)",
        borderRadius: radii.pill,
        padding: "4px 14px",
        marginBottom: 12,
      }}
    >
      <Icon size={17} color="rgba(255,255,255,0.7)" style={{ flexShrink: 0 }} />
      {children}
    </div>
  );
}

const inputStyle = {
  flex: 1,
  minWidth: 0,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#fff",
  /* 16px: nën këtë prag iOS zmadhon faqen sapo preket fusha */
  fontSize: 16,
  fontFamily: "inherit",
  padding: "12px 0",
};
