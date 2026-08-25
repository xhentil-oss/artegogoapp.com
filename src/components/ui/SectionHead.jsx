import { ChevronRight } from "lucide-react";
import { T, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";

/**
 * Titulli i një seksioni.
 *
 * Dy lloje teksti në të djathtë, të ndara me qëllim:
 *   · `action` + `onAction` — buton i vërtetë, me shigjetë
 *   · `hint` — thjesht udhëzim, pa stil butoni
 *
 * Ndarja nuk është kozmetike: më parë `action` ishte thjesht një `<span>` pa
 * veprim, që dukej si lidhje dhe nuk bënte asgjë kur klikohej. Tani një
 * "Shih të gjitha" pa `onAction` nuk kompilohet si buton — nuk mund të
 * rilindë një lidhje e vdekur.
 */
export function SectionHead({ title, accent, action, onAction, hint }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: `0 ${layout.gutter}px`,
        margin: "26px 0 14px",
      }}
    >
      <h3 style={{ fontSize: 21, fontWeight: 800, color: T.ink, margin: 0, letterSpacing: -0.3 }}>
        {title} {accent && <span style={{ color: T.accent }}>{accent}</span>}
      </h3>

      {action && onAction && (
        <button
          onClick={onAction}
          className="ag-press"
          style={{
            ...sx.bareButton,
            display: "flex",
            alignItems: "center",
            gap: 2,
            /* Zona e prekjes rritet mbi 40px me padding, dhe margjina negative
               e kthen lartësinë e rreshtit aty ku ishte — gishti fiton hapësirë
               pa u zhvendosur pamja. */
            padding: "12px 2px 12px 10px",
            margin: "-4px -2px -4px 0",
            fontSize: 14,
            color: T.sub,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {action}
          <ChevronRight size={16} color={T.faint} />
        </button>
      )}

      {hint && !action && (
        <span style={{ fontSize: 13, color: T.faint, fontWeight: 500, flexShrink: 0 }}>{hint}</span>
      )}
    </div>
  );
}

/** Titull i nivelit të dytë, për nën-grupet brenda një folderi. */
export function GroupHead({ title, count }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: `0 ${layout.gutter}px`,
        marginBottom: 12,
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 800, color: T.ink, margin: 0 }}>{title}</h3>
      {count != null && <span style={{ fontSize: 12.5, color: T.faint }}>{count}</span>}
    </div>
  );
}
