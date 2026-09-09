import { useState } from "react";
import { CloudOff, RotateCw, X } from "lucide-react";
import { T, radii } from "../theme/tokens.js";
import { useCatalogResult } from "../hooks/useCatalog.js";
import { hydrateCatalog } from "../services/catalog.js";

/**
 * Shirit i hollë kur katalogu NUK erdhi nga serveri.
 *
 * ⚠️  PSE EKZISTON: rënia te `data/collections.js` ndodhte në HESHTJE. Kur
 *     API-ja nuk përgjigjej, aplikacioni hapej normalisht dhe tregonte më pak
 *     kategori — dhe kjo lexohej si "kategoritë u zhdukën", si humbje e
 *     përmbajtjes. Përmbajtja nuk humbi kurrë; serveri nuk u lexua.
 *
 *     Dhe ka pasojë të dytë, më të rëndë: meditimet lokale nuk kanë id-të e
 *     databazës, ndaj asnjëri nuk luhet. Pa këtë shirit, aplikacioni dukej i
 *     shëndetshëm dhe ishte i papërdorshëm.
 *
 * ⚠️  MBYLLET, dhe nuk kthehet derisa faqja të rifreskohet. Një shirit që rri
 *     përgjithmonë mbi titullin e ekranit është njoftim që u bë pengesë.
 *
 * Nuk shfaqet kur katalogu është në rregull — pra në rrugën normale nuk zë
 * asnjë piksel.
 */

/**
 * Sa pritet një riprovë para se butoni të lirohet.
 *
 * ⚠️  `api.js` ka afat 15 sekonda, dhe kur serveri pranon lidhjen pa u
 *     përgjigjur, riprova e konsumon të plotë. Butoni rrinte "Po provoj…"
 *     pesëmbëdhjetë sekonda dhe dukej i ngecur. Mbushja vazhdon në sfond —
 *     nëse ia del, `hydrateCatalog` njofton vetë dhe shiriti zhduket.
 */
const PRITJA_MS = 8000;

const kutia = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  margin: "8px 16px 0",
  padding: "9px 10px 9px 12px",
  background: T.bg2,
  border: `1px solid ${T.line}`,
  borderRadius: radii.md,
};

const teksti = { flex: 1, fontSize: 12, lineHeight: 1.3, color: T.sub };

function MbyllButon({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Mbyll njoftimin"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: 26,
        height: 26,
        padding: 0,
        border: "none",
        borderRadius: radii.pill,
        background: "transparent",
        color: T.faint,
        cursor: "pointer",
      }}
    >
      <X size={15} />
    </button>
  );
}

export function CatalogNotice() {
  const result = useCatalogResult();
  const [duke, setDuke] = useState(false);
  const [pandryshuar, setPandryshuar] = useState(false);
  const [mbyllur, setMbyllur] = useState(false);

  if (result.ok || mbyllur) return null;

  /*
   * Dy gjendje, dy fjalime.
   *
   * ⚠️  `pending` do të thotë "serveri lexohet ende" — jo "dështoi". Të thuash
   *     "nuk u lexua" ndërsa kërkesa është në rrugë është gënjeshtër që zbulon
   *     vetveten pas dy sekondash, dhe butoni "Provo sërish" atje nuk ka
   *     kuptim: një riprovë mbi një kërkesë që rrjedh vetëm shton një të dytë.
   */
  if (result.pending) {
    return (
      <div role="status" style={kutia}>
        <CloudOff size={16} color={T.faint} style={{ flexShrink: 0 }} />
        <span style={teksti}>Po lexohet serveri… deri atëherë tregohet përmbajtja pa internet.</span>
        <MbyllButon onClick={() => setMbyllur(true)} />
      </div>
    );
  }

  const provoSerish = async () => {
    setDuke(true);
    setPandryshuar(false);

    const perfundoi = await Promise.race([
      hydrateCatalog().then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), PRITJA_MS)),
    ]);

    setDuke(false);
    /* Nëse ia dilte, ky komponent do të kishte dalë nga pema bashkë me
       `result.ok`; pra po jemi ende këtu, riprova nuk ndryshoi gjë. */
    if (!perfundoi) setPandryshuar(true);
    setTimeout(() => setPandryshuar(false), 3000);
  };

  const etiketa = duke ? "Po provoj…" : pandryshuar ? "Prapë pa lidhje" : "Provo sërish";

  return (
    <div role="status" style={kutia}>
      <CloudOff size={16} color={T.faint} style={{ flexShrink: 0 }} />
      <span style={teksti}>Serveri nuk u lexua — meditimet nuk luhen derisa lidhja të kthehet.</span>

      <button
        type="button"
        onClick={provoSerish}
        disabled={duke}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexShrink: 0,
          padding: "6px 10px",
          border: "none",
          borderRadius: radii.pill,
          background: T.ink,
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          cursor: duke ? "default" : "pointer",
          opacity: duke ? 0.55 : 1,
        }}
      >
        <RotateCw size={12} />
        {etiketa}
      </button>

      <MbyllButon onClick={() => setMbyllur(true)} />
    </div>
  );
}
