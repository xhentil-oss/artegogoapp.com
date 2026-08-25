import { T, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { autoGrid } from "../../theme/responsive.js";
import {
  listCollections,
  listSeries,
  popularBlocks,
  totalMeditations,
} from "../../services/contentRepository.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { Row } from "../../components/ui/Row.jsx";
import { SectionHead } from "../../components/ui/SectionHead.jsx";
import { MedCard } from "../../components/cards/MedCard.jsx";
import { SeriesCard } from "../../components/cards/ShowcaseCards.jsx";
import { FolderCard } from "../../components/cards/FolderCard.jsx";
import { PracticeRow } from "./PracticeRow.jsx";

/**
 * Biblioteka. Dy rrugë për të gjetur një praktikë:
 *   · "Eksploro praktikat" — sipas modalitetit (meditim, frymëmarrje, EFT…)
 *   · "Kategoritë" — sipas situatës (emergjencë, në punë, fëmijët…)
 */
export function LibraryScreen() {
  const { openCategory, openFolder } = useNavigation();
  const collections = listCollections();

  return (
    <div style={sx.screen}>
      {/* Shiriti i gjelbër u hoq: specifikimi kërkon sfond të bardhë me aurorë
          në krye të çdo ekrani — aurora vjen nga `AppShell`. */}
      <div style={{ padding: `8px ${layout.gutter}px 0` }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: T.ink, margin: "0 0 8px", letterSpacing: -0.5 }}>
          Meditim
        </h2>
        <p style={{ fontSize: 15, color: T.sub, margin: 0, lineHeight: 1.5 }}>
          Praktikë e udhëhequr për ndërgjegjësim, çlodhje dhe vetëdije.
        </p>
        {/* numrat llogaritohen nga katalogu, nuk shkruhen me dorë */}
        <p style={{ fontSize: 13.5, color: T.faint, margin: "8px 0 0" }}>
          {totalMeditations()} meditime · {collections.length} kategori
        </p>
      </div>

      <SectionHead title="Eksploro" accent="praktikat" hint="8 modalitete" />
      <PracticeRow />

      {/* `hint`, jo `action`: nuk ka ekran "të gjitha seritë" ku të çojë */}
      <SectionHead title="Seri të kuruara" hint={`${listSeries().length}`} />
      <Row>
        {listSeries().map((series) => (
          <SeriesCard key={series.id} series={series} onOpen={() => openCategory(series.intent)} />
        ))}
      </Row>

      <SectionHead title="Zgjedhjet popullore" />
      <Row>
        {popularBlocks().map((block, i) => (
          <MedCard key={block.id} block={block} index={i} square />
        ))}
      </Row>

      <SectionHead title="Kategoritë" hint="Prek për të hapur" />
      {/* 2 kolona në telefon, 4 në kornizë të plotë — grid-i vendos vetë */}
      <div className="ag-stagger" style={{ ...autoGrid(130), padding: `0 ${layout.gutter}px` }}>
        {collections.map((collection) => (
          <FolderCard
            key={collection.id}
            collection={collection}
            onOpen={() => openFolder(collection)}
          />
        ))}
      </div>
    </div>
  );
}
