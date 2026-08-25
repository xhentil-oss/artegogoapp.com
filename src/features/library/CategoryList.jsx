import { ChevronRight } from "lucide-react";
import { T, layout, radii, shadows } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { categoryFolder } from "../../services/contentRepository.js";
import { CoverArt } from "../../components/art/CoverArt.jsx";

/**
 * "Eksploro kategoritë" — listë kutish.
 *
 * Çdo kuti: thumb + emër + numër meditimesh, dhe poshtë një rresht horizontal
 * kapakësh ku duken **3.5** — gjysma e kapakut të katërt është ftesa për
 * rrëshqitje, sinjali që ka më shumë përmbajtje anash.
 *
 * @param {{ categories: object[], onOpen: (category) => void }} props
 */
export function CategoryList({ categories, onOpen }) {
  return (
    <div
      className="ag-stagger"
      style={{ display: "flex", flexDirection: "column", gap: 14, padding: `0 ${layout.gutter}px` }}
    >
      {categories.map((category) => (
        <CategoryBox key={category.id} category={category} onOpen={() => onOpen(category)} />
      ))}
    </div>
  );
}

/**
 * 3.5 kapakë të dukshëm — gjysma e të katërtit është ftesa për rrëshqitje.
 *
 * Përqindja te `width` matet ndaj kutisë së PËRMBAJTJES (pa padding-un), ndaj
 * zbritet vetëm hapësira mes kapakëve: për 3.5 kapakë duken 2.5 hapësira.
 */
const VISIBLE_COVERS = 3.5;
const COVER_GAP = 10;
const GAPS_IN_VIEW = VISIBLE_COVERS - 1;
const PREVIEW_COUNT = 8;

function CategoryBox({ category, onOpen }) {
  /* parapamja lexohet nga i njëjti burim si folderi — pa dublikim të dhënash */
  const preview = categoryFolder(category.id)
    .groups.flatMap((group) => group.items)
    .slice(0, PREVIEW_COUNT);

  return (
    <section
      style={{
        background: T.bg,
        border: `1px solid ${T.line}`,
        borderRadius: radii.xl,
        boxShadow: shadows.soft,
        overflow: "hidden",
      }}
    >
      <button
        onClick={onOpen}
        className="ag-press"
        style={{
          ...sx.cardButton,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          textAlign: "left",
        }}
      >
        <div style={{ width: 46, height: 46, borderRadius: 12, overflow: "hidden", position: "relative", flexShrink: 0 }}>
          <CoverArt intent={category.intent} />
        </div>

        <div style={sx.flexText}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink, lineHeight: 1.25 }}>
            {category.label}
          </div>
          <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>{category.count} meditime</div>
        </div>

        <ChevronRight size={20} color={T.faint} />
      </button>

      <div
        className="ag-scroll-x"
        style={{
          display: "flex",
          gap: COVER_GAP,
          overflowX: "auto",
          padding: "0 14px 14px",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: 14,
        }}
      >
        {preview.map((item) => (
          <div
            key={item.id}
            style={{
              ...sx.snapItem,
              width: `calc((100% - ${COVER_GAP * GAPS_IN_VIEW}px) / ${VISIBLE_COVERS})`,
              /* dysheme e ulët: në 320px llogaritja jep ~66px */
              minWidth: 60,
              aspectRatio: "1 / 1",
              borderRadius: 10,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <CoverArt intent={item.intent} />
          </div>
        ))}
      </div>
    </section>
  );
}
