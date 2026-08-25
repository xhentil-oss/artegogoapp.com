import { T, shadows } from "../../theme/tokens.js";
import { intentMeta } from "../../domain/intent.js";
import { collectionItems } from "../../services/contentRepository.js";
import { CoverArt } from "../art/CoverArt.jsx";

const PREVIEW_SLOTS = 4;

/**
 * Folder në stilin e iPhone-it: kuti gjysmë-transparente me katër kapakë
 * parapamjeje brenda, dhe etiketa poshtë.
 *
 * Etiketa është BRENDA butonit. Më parë qëndronte jashtë, ndaj klikimi mbi
 * emrin e kategorisë — pika më e natyrshme e prekjes — nuk bënte asgjë.
 */
export function FolderCard({ collection, onOpen }) {
  const items = collectionItems(collection);
  const preview = items.slice(0, PREVIEW_SLOTS);
  const emptySlots = Math.max(0, PREVIEW_SLOTS - preview.length);

  return (
    <button
      onClick={onOpen}
      className="ag-card"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        width: "100%",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 26,
          padding: 12,
          /* tint i lehtë i ngjyrës së kategorisë (`1A` = ~10% alfa) */
          background: `${intentMeta(collection.intent).g[1]}1A`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 8,
          }}
        >
          {preview.map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: 13,
                overflow: "hidden",
                position: "relative",
                boxShadow: shadows.soft,
              }}
            >
              <CoverArt intent={item.intent} />
            </div>
          ))}
          {Array.from({ length: emptySlots }, (_, i) => (
            <div key={`empty-${i}`} style={{ borderRadius: 13, background: "rgba(255,255,255,0.3)" }} />
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: T.ink, lineHeight: 1.15 }}>
          {collection.label}
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{items.length} meditime</div>
      </div>
    </button>
  );
}
