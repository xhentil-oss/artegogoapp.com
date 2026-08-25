import { T, radii } from "../../theme/tokens.js";
import { brandSplash } from "../../theme/gradients.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { useSession } from "../../store/SessionContext.jsx";
import { Leaf } from "../../components/icons/BrandIcons.jsx";

/** Ekrani i hyrjes. Demo: çdo buton hyn direkt. */
export function LoginScreen() {
  const { login } = useSession();

  return (
    <div
      className="ag-viewport"
      style={{
        background: brandSplash,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${padTop(28)} 28px ${padBottom(28)}`,
      }}
    >
      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: "clamp(28px, 9vw, 34px)", fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
          Arte Gogo
        </span>
        <Leaf size={26} />
      </div>
      {/* letterSpacing 3px me fjalë të gjata: në 320px duhet të mos mbushet */}
      <div
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: "clamp(11px, 3.4vw, 13px)",
          letterSpacing: 3,
          marginBottom: "clamp(32px, 8vh, 60px)",
          textAlign: "center",
        }}
      >
        MEDITIM · TRANSFORMIM
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 30,
        }}
      >
        <button
          onClick={login}
          style={{
            background: "#fff",
            color: T.ink,
            border: "none",
            borderRadius: radii.pill,
            padding: 16,
            fontSize: 15.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Vazhdo me Email
        </button>
        <button
          onClick={login}
          style={{
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: radii.pill,
            padding: 16,
            fontSize: 15.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Krijo llogari të re
        </button>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 6 }}>
          Demo — kliko për të hyrë
        </div>
      </div>
    </div>
  );
}
