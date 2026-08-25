import { layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";

/**
 * Rresht horizontal me scroll-snap — enë standarde për kartelat.
 *
 * `ag-scroll-x` mban rrëshqitjen brenda rreshtit: pa të, kur rreshti mbërrin
 * në fund, gjesti kalon në faqen prapa (ose në navigimin "back" të browser-it).
 *
 * `scrollPaddingLeft` është i domosdoshëm, nuk është zbukurim: me
 * `scroll-snap-type: mandatory` dhe `scroll-snap-align: start`, browser-i
 * rreshton buzën e kartelës me buzën e *scrollport*-it dhe kështu "gëlltit"
 * padding-un e majtë — kartelat ngjiten pas buzës së kornizës. `scroll-padding`
 * e shtyn snapport-in brenda, dhe hapësira ruhet.
 */
export function Row({ children, pad = layout.gutter }) {
  return (
    <div
      className="ag-scroll-x"
      style={{ ...sx.scrollRow, padding: `2px ${pad}px 4px`, scrollPaddingLeft: pad }}
    >
      {children}
    </div>
  );
}

/**
 * Element brenda `Row`, me snap.
 * `width` pritet nga `theme/responsive.js` (`CARD_WIDTH.*`) — vlerë relative
 * ndaj enës (`min(300px, 92%)`), që tkurret në telefon dhe lë të dukshme
 * kartelën tjetër.
 */
export function RowItem({ width, children }) {
  return <div style={{ ...sx.snapItem, width }}>{children}</div>;
}
