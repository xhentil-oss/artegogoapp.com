import { Bookmark, ChevronRight } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { useCommunity } from "../../store/CommunityContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";

/**
 * "Të ruajturat" te profili — vetëm hyrja, jo përmbajtja.
 *
 * ⚠️  Më parë këtu vizatoheshin vetë postimet: dy të plota dhe të tjerat pas
 *     një butoni "Shih më shumë". Por një postim është kartelë e plotë — foto,
 *     karusel, meditim i bashkangjitur — dhe disa prej tyre e ngarkonin
 *     profilin aq sa ai pushonte së qeni ekran përmbledhës. Me kërkesë të
 *     klientes (8 tetor 2026) përmbajtja kaloi te një faqe më vete
 *     (`SavedPostsSheet`), dhe këtu mbeti një rresht i vetëm.
 *
 *     Fitimi nuk është vetëm pamor: kartelat nuk vizatohen fare derisa faqja
 *     të hapet, ndaj profili nuk paguan më për to.
 *
 * Kur nuk ka asnjë, rreshti nuk hapet — shpjegimi zë vendin e shigjetës,
 * sepse një faqe bosh nuk i thotë asgjë kujt nuk e ka provuar ende "Ruaj".
 */
export function SavedPosts() {
  const { savedPosts } = useCommunity();
  const { openSaved } = useNavigation();

  const bosh = savedPosts.length === 0;

  const header = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Bookmark size={17} color={T.gold} />
      <span style={{ color: T.ink, fontSize: 16, fontWeight: 800, flex: 1, textAlign: "left" }}>
        Postimet e ruajtura
      </span>
      <span style={{ color: bosh ? T.faint : T.sub, fontSize: 13.5, fontWeight: 700 }}>
        {savedPosts.length}
      </span>
      {!bosh && <ChevronRight size={18} color={T.sub} />}
    </div>
  );

  if (bosh) {
    return (
      <section style={{ ...sx.panel, borderRadius: radii.lg, marginBottom: 16 }}>
        {header}
        <p
          style={{
            color: T.faint,
            fontSize: 13.5,
            lineHeight: 1.6,
            textAlign: "center",
            margin: "16px 6px 4px",
          }}
        >
          {'Shtyp "Ruaj" te një postim i komunitetit — do të shfaqet këtu, edhe pasi të zhduket nga feed-i.'}
        </p>
      </section>
    );
  }

  return (
    <button
      onClick={openSaved}
      className="ag-press"
      aria-label={`Hap postimet e ruajtura · ${savedPosts.length}`}
      /* `panel` PAS `cardButton`: i dyti i vendos `padding: 0` dhe sfond të
         tejdukshëm, dhe në rendin e kundërt rreshti do të dilte pa kuti. */
      style={{
        ...sx.cardButton,
        ...sx.panel,
        borderRadius: radii.lg,
        marginBottom: 16,
        cursor: "pointer",
        width: "100%",
      }}
    >
      {header}
    </button>
  );
}
