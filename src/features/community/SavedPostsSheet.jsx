import { ArrowLeft, Bookmark } from "lucide-react";
import { T, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useCommunity } from "../../store/CommunityContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { PostCard } from "./PostCard.jsx";

/**
 * POSTIMET E RUAJTURA — faqe më vete.
 *
 * ⚠️  Më parë rrinin brenda profilit, dy të shfaqura dhe të tjerat pas një
 *     butoni "Shih më shumë". Postimet janë kartela të plota — foto, karusele,
 *     meditim i bashkangjitur — ndaj pesëmbëdhjetë prej tyre e ngarkonin
 *     profilin aq sa ai pushonte së qeni ekran përmbledhës (kërkesë e
 *     klientes, 8 tetor 2026).
 *
 *     Tani profili mban vetëm një rresht me numrin dhe shigjetën; përmbajtja
 *     vizatohet KËTU, dhe vetëm kur hapet. Pra kartelat nuk ekzistojnë fare
 *     derisa të kërkohen.
 *
 * Përdoret i njëjti `PostCard` si te feed-i: "Ruaj" vazhdon ta heqë postimin
 * nga kjo listë vetvetiu, sepse të dyja lexojnë të njëjtën gjendje.
 */
export function SavedPostsSheet() {
  const { closeSaved } = useNavigation();
  const { savedPosts } = useCommunity();
  useBodyScrollLock();

  return (
    <div
      className="ag-sheet ag-fullscreen"
      style={{
        ...sx.fullSheet,
        zIndex: 56,
        padding: `${padTop(20)} ${layout.gutter}px ${padBottom(40)}`,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <button onClick={closeSaved} aria-label="Prapa" style={sx.bareButton}>
          <ArrowLeft size={24} color={T.ink} />
        </button>

        <div style={sx.flexText}>
          <div style={{ color: T.ink, fontSize: 20, fontWeight: 800 }}>Postimet e ruajtura</div>
          <div style={{ color: T.sub, fontSize: 12.5 }}>
            {savedPosts.length} {savedPosts.length === 1 ? "postim" : "postime"}
          </div>
        </div>

        <Bookmark size={20} color={T.gold} style={{ flexShrink: 0 }} />
      </header>

      {savedPosts.length === 0 ? (
        <p style={{ color: T.faint, fontSize: 13.5, lineHeight: 1.6, textAlign: "center", margin: "40px 10px" }}>
          {'Shtyp "Ruaj" te një postim i komunitetit — do të shfaqet këtu, edhe pasi të zhduket nga feed-i.'}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
