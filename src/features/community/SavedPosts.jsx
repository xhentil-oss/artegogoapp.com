import { useState } from "react";
import { Bookmark } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { useCommunity } from "../../store/CommunityContext.jsx";
import { SectionHead } from "../../components/ui/SectionHead.jsx";
import { PostCard } from "./PostCard.jsx";

/** Sa postime tregohen pa u kërkuar — profili nuk duhet të bëhet feed i dytë. */
const PREVIEW = 2;

/**
 * "Të ruajturat" — postimet që përdoruesi ka shënuar me "Ruaj" te feed-i.
 *
 * ⚠️  Vizatohen me TË NJËJTIN `PostCard` si te feed-i, jo me rreshta të
 *     thjeshtuar. Kështu postimi mbetet i plotë — foto, karusel, meditimi i
 *     bashkangjitur — dhe të tre veprimet vazhdojnë të punojnë: "Ruaj" e heq
 *     nga kjo listë vetvetiu, sepse e lexon të njëjtën gjendje.
 *
 * Përmbajtja vjen nga `store/CommunityContext`, që e mban bashkë me id-në
 * (shih `services/userData.js`): feed-i kthen 50 postimet e fundit, ndaj një
 * postim i ruajtur më parë nuk gjendet dot më atje.
 */
export function SavedPosts() {
  const { savedPosts } = useCommunity();
  const [allOpen, setAllOpen] = useState(false);

  if (savedPosts.length === 0) {
    return (
      <section style={{ ...sx.panel, borderRadius: radii.lg, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bookmark size={17} color={T.gold} />
          <span style={{ color: T.ink, fontSize: 16, fontWeight: 800 }}>Postimet e ruajtura</span>
          <span style={{ color: T.faint, fontSize: 13.5 }}>· 0</span>
        </div>
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

  const shown = allOpen ? savedPosts : savedPosts.slice(0, PREVIEW);
  const mbeten = savedPosts.length - shown.length;

  return (
    <>
      <SectionHead flush title="Postimet e" accent="ruajtura" hint={`${savedPosts.length}`} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {shown.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* Hapet vetëm në kërkesë: pesëmbëdhjetë postime të plota njëri pas
            tjetrit do t'i zinin profilit tërë faqen. */}
        {mbeten > 0 && (
          <button
            onClick={() => setAllOpen(true)}
            className="ag-press"
            style={{
              background: "none",
              border: `1px solid ${T.line}`,
              borderRadius: 14,
              padding: 12,
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: 600,
              color: T.sub,
            }}
          >
            Shih {mbeten} {mbeten === 1 ? "postim tjetër" : "postime të tjera"}
          </button>
        )}
      </div>
    </>
  );
}
