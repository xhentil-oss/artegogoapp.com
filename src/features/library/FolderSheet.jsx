import { layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { heroVeil } from "../../theme/gradients.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { collectionItems } from "../../services/contentRepository.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { CoverArt } from "../../components/art/CoverArt.jsx";
import { BackButton } from "../../components/ui/Controls.jsx";
import { GroupHead } from "../../components/ui/SectionHead.jsx";
import { CompactMedCard } from "../../components/cards/MedCard.jsx";

/**
 * Folderi i hapur: hero i kategorisë + një rresht horizontal për çdo nën-grup.
 * Vjen mbi ekran si fletë, ndaj mbyllet me butonin "prapa", pa prekur skedën.
 */
export function FolderSheet({ collection }) {
  const { closeFolder } = useNavigation();
  const total = collectionItems(collection).length;
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
          <CoverArt intent={collection.intent} big />
        </div>
        <div style={{ ...sx.absoluteFill, background: heroVeil }} />

        <BackButton onClick={closeFolder} blur />

        <div style={{ position: "relative" }}>
          {/* titulli tkurret në telefon të ngushtë pa u prerë */}
          <h2
            style={{
              color: "#fff",
              fontSize: "clamp(21px, 6vw, 27px)",
              fontWeight: 800,
              margin: 0,
              fontFamily: "Georgia, serif",
              lineHeight: 1.15,
            }}
          >
            {collection.label}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, margin: "5px 0 0" }}>
            {collection.desc} · {total} meditime
          </p>
        </div>
      </div>

      <div style={{ padding: `8px 0 ${padBottom(40)}` }}>
        {collection.groups.map((group, groupIndex) => (
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
