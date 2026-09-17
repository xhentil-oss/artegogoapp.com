import { ChevronRight } from "lucide-react";
import { T, layout, radii, shadows } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { categoryFolder } from "../../services/contentRepository.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { CoverArt } from "../../components/art/CoverArt.jsx";

/**
 * "Eksploro kategoritë" — listë kutish.
 *
 * Çdo kuti: thumb + emër + numër meditimesh + "Shiko të gjitha", dhe poshtë
 * një rresht horizontal kapakësh ku duken **2.5** — gjysma e kapakut të tretë
 * është ftesa për rrëshqitje, sinjali që ka më shumë përmbajtje anash.
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
 * 2.5 kapakë të dukshëm — gjysma e të tretit është ftesa për rrëshqitje.
 *
 * ⚠️  Ishin 3.5 dhe dilnin të vegjël; klientja i kërkoi më të mëdhenj (17
 *     shtator 2026). Sa më pak kapakë në pamje, aq më i madh secili — kjo
 *     është e vetmja pikë ku rregullohet.
 *
 * Përqindja te `width` matet ndaj kutisë së PËRMBAJTJES (pa padding-un), ndaj
 * zbritet vetëm hapësira mes kapakëve: për 2.5 kapakë duken 1.5 hapësira.
 */
const VISIBLE_COVERS = 2.5;
const COVER_GAP = 10;
const GAPS_IN_VIEW = VISIBLE_COVERS - 1;
const PREVIEW_COUNT = 8;

function CategoryBox({ category, onOpen }) {
  const { openMeditation } = useNavigation();

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

        {/* "Shiko të gjitha" zë vendin e shigjetës së zhveshur: e njëjta prekje,
            por tani thotë ç'ndodh kur e prek. */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            color: T.sub,
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          Shiko të gjitha
          <ChevronRight size={16} color={T.sub} />
        </span>
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
          <button
            key={item.id}
            onClick={() => openMeditation(item)}
            className="ag-press"
            style={{
              ...sx.bareButton,
              ...sx.snapItem,
              textAlign: "left",
              cursor: "pointer",
              width: `calc((100% - ${COVER_GAP * GAPS_IN_VIEW}px) / ${VISIBLE_COVERS})`,
              /* dysheme e ulët: në 320px llogaritja jep ~110px */
              minWidth: 90,
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <CoverArt intent={item.intent} image={item.cover} />
            </div>

            {/*
              Titulli pritet në dy rreshta, jo në një: emrat e meditimeve janë
              fjali të shkurtra ("Meditim për të marrë bekime") dhe një rresht
              i vetëm do t'i priste pothuaj të gjithë në mes të fjalës.
            */}
            <div
              style={{
                color: T.ink,
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.3,
                marginTop: 8,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.title}
            </div>
            <div style={{ color: T.sub, fontSize: 11.5, marginTop: 2 }}>{item.dur} min</div>
          </button>
        ))}
      </div>
    </section>
  );
}
