import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { padBottom } from "../../theme/responsive.js";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import * as billing from "../../services/billing.js";

/**
 * ARKA, BRENDA APLIKACIONIT.
 *
 * Kërkesë e klientes (19 nëntor 2026): fushat e kartës nuk duhet ta nxjerrin
 * njeriun jashtë NDIEJ-it. Më parë butoni e çonte te `checkout.stripe.com`
 * dhe e kthente me një ringarkim të plotë — dy kalime nëpër një domen tjetër,
 * pikërisht në çastin kur njeriu vendos nëse të besojë.
 *
 * ⚠️  FUSHAT DUKEN TONAT, POR NUK JANË. Ajo që vizatohet brenda `node` është
 *     një `iframe` nën domenin e Stripe-it. JavaScript-i ynë nuk i lexon dot
 *     shifrat edhe po të donte — dhe pikërisht kjo na mban jashtë detyrimeve
 *     të plota PCI-DSS. Asnjë fushë karte nuk duhet shtuar kurrë këtu si HTML
 *     i yni; do të ishte ndryshim ligjor, jo ndryshim pamjeje.
 *
 * ⚠️  PAMJA VJEN NGA PANELI I STRIPE-IT, JO NGA KODI. Ngjyrat, shkronjat dhe
 *     logoja e kësaj kornize rregullohen te Stripe → Settings → Branding.
 *     `initEmbeddedCheckout` nuk pranon stile; çdo përpjekje për t'i vendosur
 *     këtu nuk ka asnjë efekt.
 */
export function CheckoutSheet({ session, plan, onBack, onDone }) {
  const node = useRef(null);
  const doneRef = useRef(onDone);
  const [gabim, setGabim] = useState(null);
  const [gati, setGati] = useState(false);

  /* Jo gjatë vizatimit: shkrimi te një `ref` atje e bën komponentin të papastër. */
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useBodyScrollLock();

  useEffect(() => {
    let arka = null;
    let hequr = false;

    billing
      .mountCheckout(node.current, {
        clientSecret: session.clientSecret,
        publishableKey: session.publishableKey,
        /* Stripe e thërret kur pagesa mbyllet. Lexohet nga `ref`, që një
           rirender i ndërmjetëm të mos e ngrijë thirrjen e vjetër. */
        onComplete: () => doneRef.current?.(session.sessionId),
      })
      .then((e) => {
        /*
         * Fleta mund të jetë mbyllur ndërkohë që Stripe po ngarkohej. Pa këtë,
         * korniza mbetet e lidhur me një element që nuk ndodhet më te faqja
         * dhe çdo hapje e dytë dështon me "element nuk u gjet".
         */
        if (hequr) return e.destroy();
        arka = e;
        setGati(true);
      })
      .catch((err) => {
        if (!hequr) setGabim(err?.message ?? "Arka nuk u hap. Provo sërish.");
      });

    return () => {
      hequr = true;
      try {
        arka?.destroy();
      } catch {
        /* E shkatërruar tashmë — pa rëndësi. */
      }
    };
  }, [session.clientSecret, session.publishableKey, session.sessionId]);

  return (
    <div
      onClick={onBack}
      className="ag-fullscreen"
      style={{
        zIndex: 71,
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
          padding: `26px 20px ${padBottom(20)}`,
          maxHeight: "92%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: T.line, margin: "0 auto 18px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <button
            onClick={onBack}
            aria-label="Kthehu te planet"
            style={{
              ...sx.bareButton,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1px solid ${T.line}`,
              background: T.bg,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={17} color={T.ink} />
          </button>
          <h2 style={{ color: T.ink, fontSize: 19, fontWeight: 700, margin: 0 }}>Të dhënat e kartës</h2>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            color: T.sub,
            fontSize: 12,
            lineHeight: 1.45,
            margin: "0 0 14px 44px",
          }}
        >
          <Lock size={12} style={{ flexShrink: 0 }} />
          <span>Të dhënat shkojnë drejt te Stripe. NDIEJ nuk i sheh dot.</span>
        </div>

        {session.testMode && (
          <div
            style={{
              background: "rgba(214,164,74,0.12)",
              border: `1px solid ${T.gold}55`,
              borderRadius: radii.md,
              padding: "9px 12px",
              marginBottom: 12,
              color: T.ink,
              fontSize: 12,
              lineHeight: 1.45,
            }}
          >
            Mënyra e provës — nuk tërhiqen para. Kartë: <strong>4242 4242 4242 4242</strong>
          </div>
        )}

        {gabim && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,90,110,0.10)",
              border: `1px solid ${T.live}55`,
              borderRadius: radii.md,
              padding: "10px 12px",
              marginBottom: 12,
            }}
          >
            <AlertCircle size={15} color={T.live} style={{ flexShrink: 0 }} />
            <span style={{ color: T.ink, fontSize: 12.5, lineHeight: 1.45 }}>{gabim}</span>
          </div>
        )}

        {!gati && !gabim && (
          <p style={{ color: T.sub, fontSize: 13, textAlign: "center", margin: "28px 0" }}>
            Po hapet arka e sigurt…
          </p>
        )}

        {/* Korniza e Stripe-it vendoset këtu dhe e rregullon vetë lartësinë. */}
        <div ref={node} style={{ minHeight: gati ? 320 : 0 }} />

        {plan && (
          <p style={{ color: T.sub, fontSize: 11.5, lineHeight: 1.5, textAlign: "center", margin: "14px 0 0" }}>
            {plan}
          </p>
        )}
      </div>
    </div>
  );
}
