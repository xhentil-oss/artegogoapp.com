import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { useSession } from "../../store/SessionContext.jsx";

/**
 * FSHIRJA E LLOGARISË
 *
 * E kërkon Apple-i për çdo aplikacion që lejon krijim llogarie, dhe e kërkon
 * GDPR-ja si të drejtë. Pa të, aplikacioni nuk kalon rishikimin e App Store-it.
 *
 * ⚠️  TRI PENGESA, ME QËLLIM: hapja e panelit, shkrimi i fjalëkalimit, dhe
 *     butoni i fundit. Veprimi nuk kthehet mbrapsht — të 20 tabelat e lidhura
 *     me llogarinë ikin me `ON DELETE CASCADE` — ndaj një prekje e vetme te
 *     telefoni nuk duhet të mjaftojë.
 *
 * ⚠️  ABONIMI TE DYQANI THUHET HAPUR. Fshirja e llogarisë NUK e ndal pagesën
 *     te App Store ose Google Play; atë e mban dyqani. Pa këtë fjali,
 *     përdoruesi fshin llogarinë dhe vazhdon të paguajë muaj me radhë — dhe
 *     me të drejtë do të mendonte se e mashtruam.
 */
export function DeleteAccount() {
  const { deleteAccount, canAdmin } = useSession();

  const [hapur, setHapur] = useState(false);
  const [fjalekalimi, setFjalekalimi] = useState("");
  const [gabimi, setGabimi] = useState(null);
  const [duke, setDuke] = useState(false);

  /* Admini nuk e fshin dot llogarinë nga aplikacioni — do të mbyllte panelin
     përgjithmonë. Serveri e ndal gjithsesi me 403; këtu thjesht nuk premtohet
     diçka që nuk bëhet. */
  if (canAdmin) return null;

  const fshi = async () => {
    setDuke(true);
    setGabimi(null);
    const result = await deleteAccount(fjalekalimi);
    setDuke(false);
    if (!result.ok) {
      setGabimi(result.error);
      setFjalekalimi("");
      return;
    }
    /* Me sukses nuk bëhet gjë tjetër: `deleteAccount` e zbrazi sesionin, dhe
       `App` kalon vetë te ekrani i hyrjes. */
  };

  if (!hapur) {
    return (
      <button
        onClick={() => setHapur(true)}
        className="ag-press"
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "14px 13px",
          marginTop: 4,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          color: T.faint,
          ...sx.center,
          gap: 7,
        }}
      >
        <Trash2 size={14} /> Fshi llogarinë
      </button>
    );
  }

  return (
    <div
      style={{
        marginTop: 10,
        padding: 15,
        border: `1px solid ${T.line}`,
        borderRadius: radii.lg,
        background: T.bg2,
      }}
    >
      <div style={{ display: "flex", gap: 9, marginBottom: 10 }}>
        <AlertTriangle size={18} color={T.gold} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>
          Fshirja nuk kthehet mbrapsht
        </div>
      </div>

      <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: 1.5, color: T.sub }}>
        Ikin përgjithmonë: seancat, minutat, streak-u, medaljet, zakonet,
        gjendjet, të preferuarat, shkarkimet, seancat që ke ndërtuar dhe
        rrugëtimi. Nuk ka rrugë kthimi, as për ne.
      </p>

      <p style={{ margin: "0 0 14px", fontSize: 12.5, lineHeight: 1.5, color: T.sub }}>
        <strong style={{ color: T.ink }}>Abonimi nuk anulohet këtu.</strong> Nëse ke
        paguar përmes App Store ose Google Play, ndaloje nga cilësimet e dyqanit —
        përndryshe pagesa vazhdon edhe pa llogari.
      </p>

      <label
        style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.sub, marginBottom: 6 }}
        htmlFor="fshi-fjalekalimin"
      >
        Shkruaj fjalëkalimin për të konfirmuar
      </label>
      <input
        id="fshi-fjalekalimin"
        type="password"
        value={fjalekalimi}
        onChange={(e) => setFjalekalimi(e.target.value)}
        autoComplete="current-password"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border: `1px solid ${gabimi ? T.gold : T.line}`,
          borderRadius: radii.md,
          fontSize: 14,
          fontFamily: "inherit",
          background: T.bg,
          color: T.ink,
        }}
      />

      {gabimi && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: T.gold, fontWeight: 600 }}>{gabimi}</div>
      )}

      <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
        <button
          onClick={() => {
            setHapur(false);
            setFjalekalimi("");
            setGabimi(null);
          }}
          disabled={duke}
          className="ag-press"
          style={{
            flex: 1,
            padding: 12,
            border: `1px solid ${T.line}`,
            borderRadius: radii.pill,
            background: T.bg,
            color: T.ink,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: duke ? "default" : "pointer",
          }}
        >
          Jo, mbaje
        </button>
        <button
          onClick={fshi}
          disabled={duke || fjalekalimi.length === 0}
          className="ag-press"
          style={{
            flex: 1,
            padding: 12,
            border: "none",
            borderRadius: radii.pill,
            background: "#B3261E",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: duke || fjalekalimi.length === 0 ? "default" : "pointer",
            opacity: duke || fjalekalimi.length === 0 ? 0.5 : 1,
          }}
        >
          {duke ? "Po fshihet…" : "Fshi përgjithmonë"}
        </button>
      </div>
    </div>
  );
}
