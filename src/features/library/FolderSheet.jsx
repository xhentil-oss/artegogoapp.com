import { T, fonts, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { heroVeil } from "../../theme/gradients.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { CoverArt } from "../../components/art/CoverArt.jsx";
import { BackButton } from "../../components/ui/Controls.jsx";
import { GroupHead } from "../../components/ui/SectionHead.jsx";
import { CompactMedCard, TrackCard } from "../../components/cards/MedCard.jsx";

/**
 * Folderi i hapur: hero i kategorisë + një rresht horizontal për çdo nën-grup.
 * Vjen mbi ekran si fletë, ndaj mbyllet me butonin "prapa", pa prekur skedën.
 */
export function FolderSheet({ collection }) {
  const { closeFolder } = useNavigation();
  /* i njëjti komponent shërben të dyja pamjet: `desc` thotë "sipas kategorive"
     kur hapet një teknikë, dhe "sipas teknikave" kur hapet një kategori */
  /* "grid" vjen nga `techniqueFolder`; shih `layout` te `domain/classification.js`. */
  const rrjete = collection.layout === "grid";
  /*
   * ⚠️  Te rrjeta numërohet `items`, JO `groups`.
   *
   *     `groupBy` i hedh poshtë rreshtat pa kategori — ata nuk bien te asnjë
   *     bucket i njohur. Një këngë nuk ka kategori (`category_id` rri NULL te
   *     databaza, me qëllim: përndryshe do të dilte edhe te folderi i asaj
   *     kategorie). Po ta numëronim me `groups`, rrjeta do të shihte zero dhe
   *     ekrani do të shkruante "Së shpejti" mbi një praktikë plot këngë.
   */
  const total = rrjete
    ? (collection.items?.length ?? 0)
    : collection.groups.reduce((sum, g) => sum + g.items.length, 0);
  useBodyScrollLock();

  return (
    <div className="ag-sheet ag-fullscreen" style={{ ...sx.fullSheet, zIndex: 55 }}>
      <div
        style={{
          minHeight: 180,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 24,
          padding: `${padTop(layout.gutter)} ${layout.gutter}px ${layout.gutter}px`,
        }}
      >
        <div style={sx.absoluteFill}>
          <CoverArt intent={collection.intent} image={collection.cover} big />
        </div>
        <div style={{ ...sx.absoluteFill, background: heroVeil }} />

        <BackButton onClick={closeFolder} blur />

        <div style={{ position: "relative" }}>
          {/* titulli tkurret në telefon të ngushtë pa u prerë */}
          <h2
            style={{
              color: "#fff",
              fontSize: "clamp(21px, 6vw, 27px)",
              fontWeight: 700,
              margin: 0,
              /* titull hero — serif */
              fontFamily: fonts.display,
              lineHeight: 1.15,
            }}
          >
            {collection.label}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, margin: "5px 0 0" }}>
            {total === 0
              ? "Së shpejti"
              : rrjete
                ? `${total} pjesë`
                : `${collection.desc} · ${total} meditime`}
          </p>
        </div>
      </div>

      <div style={{ padding: `8px 0 ${padBottom(40)}` }}>
        {/*
          Një folder bosh hapet vetëm te dy praktikat e reja, që shfaqen para
          se të vijë audioja (shih `soon` te `data/techniques.js`). Pa këtë
          rresht, poshtë hero-s nuk do të kishte asgjë fare — dhe ekrani do të
          dukej i prishur, jo në pritje.
        */}
        {total === 0 && (
          <p
            style={{
              fontSize: 14.5,
              color: T.sub,
              lineHeight: 1.55,
              margin: 0,
              padding: `18px ${layout.gutter}px`,
              textAlign: "center",
            }}
          >
            Kjo praktikë po përgatitet.
            <br />
            Përmbajtja e parë vjen së shpejti.
          </p>
        )}

        {/*
          Rrjeta e këngëve dhe e muzikës: një rrjetë e vetme dy-kolonëshe, pa
          ndarje sipas kategorive. Ato nuk kanë kategori — dhe një rresht
          horizontal që rrëshqitet fsheh gjysmën e kapakëve, ndërsa pikërisht
          kapaku është ajo që e bën njeriun të zgjedhë një këngë.
        */}
        {rrjete && total > 0 && (
          <div
            className="ag-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              /* `start` — pa të, një titull dy-rreshtësh ia zhvendos kapakun
                 fqinjit brenda të njëjtit rresht. E njëjta arsye si te
                 `TechniqueGrid` dhe `CategoryList`. */
              alignItems: "start",
              padding: `6px ${layout.gutter}px 0`,
            }}
          >
            {collection.items.map((item) => (
              <TrackCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {!rrjete && collection.groups.map((group, groupIndex) => (
          <section key={group.name} style={{ marginTop: groupIndex === 0 ? 14 : 24 }}>
            <GroupHead title={group.name} count={group.items.length} />
            {/* scrollPaddingLeft: shih shënimin në components/ui/Row.jsx */}
            <div
              className="ag-scroll-x"
              style={{
                ...sx.scrollRow,
                padding: `2px ${layout.gutter}px 4px`,
                scrollPaddingLeft: layout.gutter,
              }}
            >
              {group.items.map((item, i) => (
                <CompactMedCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
