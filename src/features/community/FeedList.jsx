import { useEffect } from "react";
import { Send, User } from "lucide-react";
import { T, radii, shadows } from "../../theme/tokens.js";
import { circle } from "../../theme/styles.js";
import { listFeed } from "../../services/contentRepository.js";
import { refreshFeedIfStale } from "../../services/catalog.js";
import { useSession } from "../../store/SessionContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { PostCard } from "./PostCard.jsx";

/**
 * Feed-i i frymëzimit.
 *
 * ⚠️  Komentet u hoqën nga pamja me kërkesë të klientes (16 shtator 2026):
 *     ranë numri "N komente", butoni "Komento" dhe fleta e shkrimit. Hook-u
 *     `useFeedComments.js` mbeti në dosje, i pathirrur — po u kërkuan sërish,
 *     kthehen pa u rishkruar.
 */
export function FeedList() {
  const { isAdmin } = useSession();

  /*
   * NUMRI I PËLQIMEVE ËSHTË I PËRBASHKËT — ndaj feed-i rilexohet.
   *
   * ⚠️  `post.likes` vjen nga serveri dhe ngrin te çasti kur u lexua feed-i:
   *     në nisje, një herë. Kur një llogari tjetër pëlqen të njëjtin postim,
   *     numri rritet te databaza, por kartela këtu do të tregonte ende atë të
   *     vjetrin derisa faqja të rifreskohej me dorë — dhe dy pëlqime nga dy
   *     profile do të dukeshin si një i vetëm.
   *
   *     Rileximi bëhet kur hapet skeda (ky komponent çmontohet kur shkohet
   *     gjetkë) dhe kur dritarja kthehet në plan të parë — pra pikërisht kur
   *     përdoruesi po e shikon. Afati te `refreshFeedIfStale` e ndal
   *     përsëritjen: një kalim i shpejtë mes skedave nuk bën katër kërkesa.
   */
  useEffect(() => {
    refreshFeedIfStale();

    const onVisible = () => {
      if (document.visibilityState === "visible") refreshFeedIfStale();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return (
    /* Sfond i tejdukshëm, jo gri: kartat ndahen vetë me kufirin dhe hijen e
       tyre, dhe bishti i aurorës vazhdon pas të parës — te pamja e klientes
       feed-i nuk rri mbi një pllakë gri. */
    <div style={{ paddingBottom: 8, background: "transparent", minHeight: "60vh" }}>
      {/* Titulli u hoq: hero-ja mbi nën-tabet e mban tashmë identitetin e
          skedës, dhe dy tituj njëri mbi tjetrin zinin gjysmën e ekranit. */}
      {isAdmin && <Composer />}

      <div className="ag-stagger" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 14px" }}>
        {listFeed().map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

/**
 * Kutia e postimit — vetëm për admin, siç e përcakton specifikimi.
 *
 * Më parë shfaqej për këdo, me tekstin "Çfarë ke në mendje?" dhe një buton që
 * nuk bënte asgjë: një kontroll i vdekur që u premtonte përdoruesve diçka që
 * nuk e kishin. Tani çon te paneli i admin-it, ku postimi shkruhet vërtet dhe
 * mund t'i bashkëngjitet një meditim.
 */
function Composer() {
  const { openAdmin } = useNavigation();

  return (
    <button
      onClick={() => openAdmin("community")}
      className="ag-press"
      style={{
        width: "calc(100% - 28px)",
        margin: "12px 14px",
        background: T.bg,
        border: "none",
        borderRadius: 14,
        padding: 14,
        boxShadow: shadows.raised,
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ ...circle(40, T.bg2), border: `1px solid ${T.line}`, flexShrink: 0 }}>
        <User size={20} color={T.faint} />
      </div>

      <span
        style={{
          flex: 1,
          background: T.bg2,
          borderRadius: radii.pill,
          padding: "11px 18px",
          color: T.faint,
          fontSize: 14.5,
        }}
      >
        Shkruaj një postim…
      </span>

      <span
        style={{
          background: T.ink,
          color: "#fff",
          borderRadius: 20,
          padding: "9px 16px",
          fontSize: 13,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <Send size={14} /> Posto
      </span>
    </button>
  );
}
