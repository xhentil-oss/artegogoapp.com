import { Play } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { listLiveSessions } from "../../services/contentRepository.js";
import { LiveDot } from "../../components/ui/Badges.jsx";

/** Transmetimet live: meditime, mësime e praktika, pyetje dhe përgjigje. */
export function LiveScreen() {
  const sessions = listLiveSessions();
  /**
   * A është në ajër ndonjëri tani?
   *
   * ⚠️  Pulla "LIVE" lart shfaqet VETËM atëherë (kërkesë e klientes, 8 tetor
   *     2026). Më parë rrinte gjithmonë, me pikën e kuqe që pulson — pra
   *     ekrani thoshte "tani" edhe kur asgjë nuk ishte ndezur, dhe kush e
   *     hapte priste të gjente diçka duke ndodhur.
   *
   *     Kartelat poshtë mbeten gjithmonë: ato tregojnë ÇFARË ka, jo se çfarë
   *     po ndodh.
   */
  const dikushNeAjer = sessions.some((session) => session.live);

  return (
    <div style={sx.screen}>
      <header style={{ textAlign: "center", padding: "30px 24px 24px" }}>
        {dikushNeAjer && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#FFE5E9",
              border: "1px solid #FFC2CC",
              borderRadius: 24,
              padding: "8px 18px",
              marginBottom: 22,
            }}
          >
            <LiveDot size={9} />
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, color: T.ink }}>LIVE</span>
          </div>
        )}

        <h2 style={{ fontSize: 28, fontWeight: 700, color: T.ink, margin: "0 0 12px", letterSpacing: -0.3 }}>
          Transmetimet <span style={{ color: T.sub }}>Live</span>
        </h2>
        <p
          style={{
            fontSize: 15,
            color: T.sub,
            margin: "0 auto",
            lineHeight: 1.6,
            maxWidth: 360,
          }}
        >
          {/* Fjalia ndjek tri kartelat poshtë: meditim, mësime e praktika,
              pyetje e përgjigje. "Koçing" u hoq me kërkesë të klientes. */}
          Ndiqni sesionet tona live të meditimit, mësimet e praktikat dhe pyetjet e përgjigjet në kohë reale.
        </p>
      </header>

      <div
        className="ag-stagger"
        style={{ display: "flex", flexDirection: "column", gap: 16, padding: `0 ${layout.gutter}px 8px` }}
      >
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

    </div>
  );
}

function SessionCard({ session }) {
  /*
   * "Në ajër" dhe "ka link" janë dy gjëra të ndara.
   *
   * ⚠️  Serveri e jep `joinUrl` VETËM kur sesioni është ndezur, ndaj zakonisht
   *     vijnë bashkë. Por një sesion i ndezur pa adresë mbetet i mundshëm te të
   *     dhënat e vjetra, dhe atëherë butoni duhet të mbetet i pashtypshëm: një
   *     "Bashkohu tani" që nuk çon askund është më keq se asnjë buton.
   */
  const joinable = Boolean(session.live && session.joinUrl);
  const Element = joinable ? "a" : "button";

  return (
    <div
      className="ag-card"
      style={{
        background: T.bg,
        borderRadius: radii.xxl,
        border: `1px solid ${T.line}`,
        padding: "26px 22px",
        textAlign: "center",
        position: "relative",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      {session.live && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#FFE5E9",
            borderRadius: radii.lg,
            padding: "5px 11px",
          }}
        >
          <LiveDot />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: T.ink }}>LIVE</span>
        </div>
      )}

      <div style={{ fontSize: 42, marginBottom: 14 }}>{session.emoji}</div>
      <div style={{ fontSize: 21, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{session.title}</div>
      <p style={{ fontSize: 14.5, color: T.sub, margin: "0 0 18px", lineHeight: 1.5 }}>{session.sub}</p>

      {/*
          Kur sesioni është në ajër, butoni bëhet LINK i vërtetë.

          ⚠️  Jo një `<button>` me `window.open`: atë e bllokojnë pop-up
              blocker-at te disa shfletues, dhe nuk jep as "hap në skedë të re"
              me shtypje të gjatë — pra pikërisht sjelljet që pret dikush që i
              është dhënë një ftesë takimi.

          ⚠️  `rel="noopener"` është i domosdoshëm: pa të, faqja e hapur merr
              një referencë te dritarja jonë përmes `window.opener`.
      */}
      {/*
          NJË ETIKETË E VETME: "Bashkohu tani" (kërkesë e klientes, 8 tetor 2026).

          ⚠️  Oraret ("E mërkurë dhe e premte · 19:00") u hoqën nga butoni. Ato
              ishin premtim i shkruar me dorë te të dhënat, ndërsa e vërteta
              është te serveri: sesioni hapet kur admini e ndez, jo kur e thotë
              një tekst. Një orar që nuk përputhet me realitetin është më keq se
              asnjë orar.

          ⚠️  Kur nuk ka link, butoni mbetet I PASHTYPSHËM dhe i zbehtë — jo i
              fshehur. Etiketa thotë ku shkohet; ngjyra thotë nëse mund të
              shkohet tani. Një buton i gjallë që nuk çon askund do të ishte
              gabim; një buton që zhduket do ta linte kartelën pa fund.
      */}
      <Element
        {...(joinable
          ? { href: session.joinUrl, target: "_blank", rel: "noopener noreferrer" }
          : { type: "button", disabled: true })}
        className={joinable ? "ag-press" : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: joinable ? "linear-gradient(135deg, #FF7A8E, #E0455E)" : T.bg2,
          color: joinable ? "#fff" : T.faint,
          border: joinable ? "none" : `1px solid ${T.line}`,
          borderRadius: 26,
          padding: "12px 24px",
          fontSize: 14.5,
          fontWeight: 700,
          cursor: joinable ? "pointer" : "default",
          textDecoration: "none",
        }}
      >
        <Play size={16} /> Bashkohu tani
      </Element>
    </div>
  );
}
