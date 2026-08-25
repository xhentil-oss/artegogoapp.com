import { T, radii, shadows } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { CARD_WIDTH } from "../../theme/responsive.js";
import { intentMeta } from "../../domain/intent.js";
import { listPractices } from "../../services/contentRepository.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { Row, RowItem } from "../../components/ui/Row.jsx";

/**
 * "Eksploro praktikat" — hyrje sipas modalitetit (si e bën praktikën),
 * përballë grid-it të kategorive që është sipas situatës (kur e bën).
 *
 * Çdo pllakë hap folderin e koleksionit përkatës.
 */
export function PracticeRow() {
  const { openFolder } = useNavigation();

  return (
    <Row>
      {listPractices().map((practice) => (
        <PracticeTile
          key={practice.id}
          practice={practice}
          onOpen={() => openFolder(practice.collection)}
        />
      ))}
    </Row>
  );
}

/** Pllakë + etiketë brenda të njëjtit buton — e gjitha reagon në prekje. */
function PracticeTile({ practice, onOpen }) {
  const meta = intentMeta(practice.collection.intent);
  const Icon = practice.icon;

  return (
    <RowItem width={CARD_WIDTH.practice}>
      <button onClick={onOpen} className="ag-card" style={{ ...sx.cardButton, textAlign: "center" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: radii.xl,
            background: tile(meta.g),
            position: "relative",
            ...sx.center,
            overflow: "hidden",
            boxShadow: shadows.cardSmall,
          }}
        >
          <div
            style={{
              ...sx.absoluteFill,
              background: "linear-gradient(160deg, rgba(255,255,255,0.18), rgba(0,0,0,0.18))",
            }}
          />
          <Icon size={30} color="#fff" style={{ position: "relative" }} />
        </div>

        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, marginTop: 9, lineHeight: 1.25 }}>
          {practice.label}
        </div>
        <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>{practice.count}</div>
      </button>
    </RowItem>
  );
}
