import { T } from "../../theme/tokens.js";
import { sx, cover } from "../../theme/styles.js";
import { CARD_WIDTH } from "../../theme/responsive.js";
import { authorFor, extraSecondsFor } from "../../lib/placeholders.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { CoverArt } from "../art/CoverArt.jsx";
import { PremiumBadge, Rating } from "../ui/Badges.jsx";
import { RowItem } from "../ui/Row.jsx";

/* Raporte, jo lartësi fikse — kartelat tkurren në telefon pa u deformuar. */
const ASPECT_WIDE = "22 / 15";

/**
 * Kartela standarde e një meditimi brenda një rreshti horizontal.
 * `square` = kapak 1:1 me titull të madh; përndryshe kapak i shtypur.
 */
export function MedCard({ block, index = 0, square = false }) {
  const { isLocked, playItems } = usePlayback();
  const locked = isLocked(block);
  const author = authorFor(index);

  return (
    <RowItem width={square ? CARD_WIDTH.square : CARD_WIDTH.wide}>
      <button onClick={() => playItems(block)} className="ag-card" style={sx.cardButton}>
        <div style={cover(square ? "square" : ASPECT_WIDE)}>
          <CoverArt intent={block.intent} title={block.title} sub={author} big={square} />
          <PremiumBadge premium={block.premium} locked={locked} />
        </div>
      </button>

      <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginTop: 10, letterSpacing: -0.2 }}>
        {block.title}
      </div>
      <div style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>{author}</div>
      <div style={{ fontSize: 12.5, color: T.sub, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
        <Rating index={index} /> · {block.dur}m {extraSecondsFor(index)}s
      </div>
    </RowItem>
  );
}

/** Varianti në grid (gjerësia vjen nga grid-i), me shigjetë poshtë kapakut. */
export function GridCard({ block, index = 0 }) {
  const { isLocked, playItems } = usePlayback();
  const locked = isLocked(block);
  const author = authorFor(index);

  return (
    <div>
      <button onClick={() => playItems(block)} className="ag-card" style={sx.cardButton}>
        <div style={cover("square")}>
          <CoverArt intent={block.intent} title={block.title} sub={author} big />
          <PremiumBadge premium={block.premium} locked={locked} />
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "6px solid rgba(255,255,255,0.7)",
            }}
          />
        </div>
      </button>

      <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginTop: 10, letterSpacing: -0.2, lineHeight: 1.2 }}>
        {block.title}
      </div>
      <div style={{ fontSize: 13.5, color: T.sub, marginTop: 4 }}>{author}</div>
      <div style={{ fontSize: 13, color: T.sub, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
        <Rating index={index} /> · {block.dur}m {extraSecondsFor(index, 11)}s
      </div>
    </div>
  );
}

/** Kartelë e ngushtë, e përdorur brenda folderave. */
export function CompactMedCard({ item, index = 0 }) {
  const { isLocked, playItems } = usePlayback();
  const locked = isLocked(item);

  return (
    <RowItem width={CARD_WIDTH.compact}>
      <button onClick={() => playItems(item)} className="ag-card" style={sx.cardButton}>
        <div style={cover("square", 16)}>
          <CoverArt intent={item.intent} title={item.title} />
          <PremiumBadge premium={item.premium} locked={locked} size={12} />
        </div>
      </button>

      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, marginTop: 8, lineHeight: 1.25 }}>
        {item.title}
      </div>
      <div style={{ fontSize: 11.5, color: T.sub, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
        {item.dur}m · <Rating index={index} size={10} />
      </div>
    </RowItem>
  );
}
