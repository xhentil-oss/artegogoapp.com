import { layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { heroVeil } from "../../theme/gradients.js";
import { padTop } from "../../theme/responsive.js";
import { intentMeta } from "../../domain/intent.js";
import { blocksForCategory, intentCover } from "../../services/contentRepository.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { BackButton } from "../../components/ui/Controls.jsx";
import { MeditationRow } from "../../components/cards/MeditationRow.jsx";
import { CoverArt } from "../../components/art/CoverArt.jsx";

/** Një kategori e vetme (qëllim), si listë vertikale. */
export function CategoryScreen({ intent }) {
  const { closeCategory } = useNavigation();
  const meta = intentMeta(intent);
  const blocks = blocksForCategory(intent);
  const Icon = meta.icon;
  /* Foto koke si te dosjet; pa të, `CoverArt` vizaton peizazhin procedural. */
  const hero = intentCover(intent);

  return (
    <div style={sx.screen}>
      <div
        style={{
          minHeight: 230,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 24,
          padding: `${padTop(layout.gutter)} ${layout.gutter}px ${layout.gutter}px`,
        }}
      >
        {/* I njëjti ndërtim si te `FolderSheet`: foto, vello mbi të, dhe teksti
            sipër të dyjave — përndryshe titulli i bardhë humbet te fotot e
            çelëta. */}
        <div style={sx.absoluteFill}>
          <CoverArt intent={intent} image={hero?.cover} position={hero?.coverPos} big />
        </div>
        <div style={{ ...sx.absoluteFill, background: heroVeil }} />

        <BackButton onClick={closeCategory} blur />
        <div style={{ position: "relative" }}>
          <Icon size={34} color="rgba(255,255,255,0.85)" style={{ marginBottom: 8 }} />
          <h2 style={{ color: "#fff", fontSize: "clamp(22px, 7vw, 28px)", fontWeight: 700, margin: 0, lineHeight: 1.15 }}>
            {meta.label}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "4px 0 0" }}>
            {blocks.length} meditime të udhëhequra
          </p>
        </div>
      </div>

      <div
        className="ag-stagger"
        style={{
          padding: `14px ${layout.gutter}px 0`,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {blocks.map((block, i) => (
          <MeditationRow key={block.id} block={block} index={i} />
        ))}
      </div>
    </div>
  );
}
