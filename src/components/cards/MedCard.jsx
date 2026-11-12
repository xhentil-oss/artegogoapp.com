import { T } from "../../theme/tokens.js";
import { sx, cover } from "../../theme/styles.js";
import { CARD_WIDTH } from "../../theme/responsive.js";
import { authorFor, extraSecondsFor } from "../../lib/placeholders.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { CoverArt } from "../art/CoverArt.jsx";
import { AccessBadge } from "../ui/Badges.jsx";
import { RowItem } from "../ui/Row.jsx";

/* Raporte, jo lartësi fikse — kartelat tkurren në telefon pa u deformuar. */
const ASPECT_WIDE = "22 / 15";

/**
 * Kartela standarde e një meditimi brenda një rreshti horizontal.
 * `square` = kapak 1:1 me titull të madh; përndryshe kapak i shtypur.
 *
 * ⚠️  Prekja HAP FLETËN e meditimit, nuk nis dëgjimin. Dëgjimi nis me butonin
 *     "Luaj meditimin" atje — shih `features/library/MeditationSheet.jsx`.
 */
export function MedCard({ block, index = 0, square = false }) {
  const { accessBadge } = usePlayback();
  const { openMeditation } = useNavigation();
  const author = authorFor(index);

  return (
    <RowItem width={square ? CARD_WIDTH.square : CARD_WIDTH.wide}>
      <button onClick={() => openMeditation(block)} className="ag-card" style={sx.cardButton}>
        <div style={cover(square ? "square" : ASPECT_WIDE)}>
          <CoverArt intent={block.intent} title={block.title} sub={author} big={square} image={block.cover} />
          <AccessBadge {...accessBadge(block)} />
        </div>
      </button>

      <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginTop: 10, letterSpacing: -0.2 }}>
        {block.title}
      </div>
      <div style={{ fontSize: 12.5, color: T.sub, marginTop: 4 }}>
        {block.dur}m {extraSecondsFor(index)}s
      </div>
    </RowItem>
  );
}

/** Varianti në grid (gjerësia vjen nga grid-i), me shigjetë poshtë kapakut. */
export function GridCard({ block, index = 0 }) {
  const { accessBadge } = usePlayback();
  const { openMeditation } = useNavigation();
  const author = authorFor(index);

  return (
    <div>
      <button onClick={() => openMeditation(block)} className="ag-card" style={sx.cardButton}>
        <div style={cover("square")}>
          <CoverArt intent={block.intent} title={block.title} sub={author} big image={block.cover} />
          <AccessBadge {...accessBadge(block)} />
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
      <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
        {block.dur}m {extraSecondsFor(index, 11)}s
      </div>
    </div>
  );
}

/**
 * Kartelë folderi në stil Mindvalley: **imazh i pastër** (pa titull mbi të),
 * pastaj poshtë titulli dhe minutat.
 *
 * Titulli u hoq nga kapaku me qëllim — mbi imazh ai konkurronte me artin dhe
 * lexohej më keq; poshtë tij lexohet gjithmonë.
 */
export function CompactMedCard({ item }) {
  const { accessBadge } = usePlayback();
  const { openMeditation } = useNavigation();

  return (
    <RowItem width={CARD_WIDTH.folder}>
      <button
        onClick={() => openMeditation(item)}
        className="ag-card"
        style={{ ...sx.cardButton, textAlign: "left" }}
      >
        <div style={cover("square", 16)}>
          <CoverArt intent={item.intent} image={item.cover} />
          <AccessBadge {...accessBadge(item)} size={12} />
        </div>

        {/* Të njëjtat përmasa si titujt te "Eksploro kategoritë" dhe grid-i i
            praktikave — një madhësi e vetme për të njëjtën gjë. */}
        <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginTop: 10, lineHeight: 1.3 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 12.5, color: T.sub, marginTop: 3 }}>{item.dur} min</div>
      </button>
    </RowItem>
  );
}


/**
 * Kartela e një kënge ose pjese muzikore, te rrjeta e praktikës.
 *
 * Ndryshe nga `CompactMedCard`, që rri te një rresht horizontal dhe jep vetëm
 * minutat, kjo zë një kuti të rrjetës dhe shkruan edhe interpretuesin edhe
 * gjatësinë e saktë — sepse te muzika gjatësia nuk është "rreth sa minuta
 * zgjat", por vetë pjesa.
 *
 * ⚠️  VETËM TË DHËNA TË VËRTETA. `lib/placeholders.js` mban autorë dhe
 *     vlerësime të trilluara nga indeksi; këtu nuk përdoret asnjëri. Emri
 *     vjen nga `narrator` te databaza, gjatësia nga `durationSec`. Nëse
 *     njëri mungon, rreshti thjesht nuk shkruhet — më mirë bosh se i sajuar.
 *
 * ⚠️  PA YLL VLERËSIMI. Pamja që solli klientja e ka; ne jo, sepse asnjë
 *     meditim nuk ka marrë ende asnjë votë — të gjitha janë 0.00. Një "0,0 ★"
 *     poshtë çdo kënge do të lexohej si vlerësim i keq, jo si mungesë.
 *     Kur votat të fillojnë, rreshti hapet këtu dhe askund tjetër.
 */
export function TrackCard({ item }) {
  const { accessBadge } = usePlayback();
  const { openMeditation } = useNavigation();

  return (
    <button
      onClick={() => openMeditation(item)}
      className="ag-card"
      style={{ ...sx.cardButton, textAlign: "left" }}
    >
      <div style={cover("square", 16)}>
        <CoverArt intent={item.intent} image={item.cover} />
        <AccessBadge {...accessBadge(item)} size={12} />
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: T.ink,
          marginTop: 10,
          lineHeight: 1.3,
          /* Titujt e këngëve janë të gjatë — dy rreshta, pastaj pikë. Pa këtë,
             një titull tre-rreshtësh ia shtyn poshtë fqinjin e vet. */
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {item.title}
      </div>

      {item.narrator && (
        <div style={{ fontSize: 12.5, color: T.sub, marginTop: 3, ...sx.truncate }}>
          {item.narrator}
        </div>
      )}

      <div style={{ fontSize: 12.5, color: T.faint, marginTop: 2 }}>{gjatesia(item)}</div>
    </button>
  );
}

/** "3 min 49 s", ose vetëm minutat kur sekondat bien fiks. */
function gjatesia(item) {
  const sek = Number(item.durationSec) || 0;
  if (!sek) return `${item.dur} min`;
  const m = Math.floor(sek / 60);
  const s = sek % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} s`;
}
