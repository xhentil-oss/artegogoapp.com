import { Play, Star } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile, rayTexture, veil } from "../../theme/gradients.js";
import { CARD_WIDTH } from "../../theme/responsive.js";
import { intentMeta } from "../../domain/intent.js";
import { blocksByIntent, blocksForProgram } from "../../services/contentRepository.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { Leaf } from "../icons/BrandIcons.jsx";
import { RowItem } from "../ui/Row.jsx";

/* Raportet e kapakëve — mbajnë proporcionin kur gjerësia tkurret. */
const ASPECT = {
  program: "5 / 3",
  series: "30 / 17",
  short: "15 / 23",
  trending: "8 / 5",
};

/**
 * Kartelë programi me shirit progresi — faqja "Sot".
 *
 * E GJITHË kartela është buton: kapaku, titulli dhe shiriti i progresit.
 * Më parë vetëm rrethi i vogël i luajtjes reagonte, ndaj klikimi mbi titull
 * ose mbi progres nuk bënte asgjë. Rrethi mbetet vetëm shenjë vizuale (`div`,
 * jo `button` — buton brenda butoni është HTML i pavlefshëm).
 */
export function ProgramProgressCard({ program }) {
  const { playItems } = usePlayback();
  const meta = intentMeta(program.intent);
  const Icon = meta.icon;

  return (
    <RowItem width={CARD_WIDTH.hero}>
      <button
        onClick={() => playItems(blocksForProgram(program))}
        className="ag-card"
        style={{ ...sx.cardButton, textAlign: "left" }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: ASPECT.program,
            borderRadius: radii.xl,
            background: tile(meta.g),
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            padding: 16,
            overflow: "hidden",
          }}
        >
          <div style={{ ...sx.absoluteFill, background: rayTexture }} />
          <DurationTag minutes={program.lessons * 4} />
          <Icon size={34} color="rgba(255,255,255,0.5)" style={{ position: "absolute", top: 14, left: 14 }} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 10,
          }}
        >
          <div style={{ ...sx.flexText, fontSize: 17, fontWeight: 800, color: T.ink, letterSpacing: -0.3 }}>
            {program.title}
          </div>
          <div style={circle(44, T.ink)}>
            <Play size={16} color="#fff" style={{ marginLeft: 2 }} />
          </div>
        </div>

        <div style={{ height: 3, background: T.line, borderRadius: 2, marginTop: 10 }}>
          <div style={{ width: "12%", height: "100%", background: T.ink, borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 6 }}>
          0 nga {program.lessons} të përfunduara
        </div>
      </button>
    </RowItem>
  );
}

/** Kartelë serie e kuruar — hap kategorinë përkatëse. */
export function SeriesCard({ series, onOpen }) {
  const meta = intentMeta(series.intent);
  return (
    <RowItem width={CARD_WIDTH.hero}>
      <button
        onClick={onOpen}
        className="ag-card"
        style={{
          ...sx.cardButton,
          aspectRatio: ASPECT.series,
          borderRadius: radii.lg,
          background: tile(meta.g),
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 22,
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        <div style={{ ...sx.absoluteFill, background: "linear-gradient(110deg, rgba(0,0,0,0.4), transparent)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{series.title}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, letterSpacing: 1.5, marginTop: 8 }}>
            {series.sub}
          </div>
        </div>
      </button>
    </RowItem>
  );
}

/** Klip i shkurtër vertikal — luan praktikën e qëllimit të vet. */
export function ShortCard({ short }) {
  const { playItems } = usePlayback();
  const meta = intentMeta(short.intent);

  return (
    <RowItem width={CARD_WIDTH.compact}>
      <button
        onClick={() => playItems(blocksByIntent(short.intent).slice(0, 1))}
        className="ag-card"
        style={{
          ...sx.cardButton,
          aspectRatio: ASPECT.short,
          borderRadius: radii.lg,
          background: tile(meta.g),
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          padding: 12,
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        <Leaf size={16} color="rgba(255,255,255,0.8)" />
        <div style={{ ...sx.absoluteFill, background: veil("transparent 40%", "rgba(0,0,0,0.6)") }} />
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>
            {short.title}
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{short.author}</div>
        </div>
      </button>
    </RowItem>
  );
}

/**
 * Peizazh tingullor. Rrethi DHE etiketa poshtë janë brenda të njëjtit buton —
 * përndryshe gjysma e kartelës nuk reagon në prekje.
 */
export function SoundscapeCard({ soundscape, index = 0 }) {
  const { playItems } = usePlayback();
  const meta = intentMeta(soundscape.intent);

  return (
    <RowItem width={CARD_WIDTH.sound}>
      <button
        onClick={() => playItems(blocksByIntent(soundscape.intent).slice(0, 1))}
        className="ag-card"
        style={{ ...sx.cardButton, textAlign: "center" }}
      >
        {/* aspectRatio në vend të lartësisë fikse — rrethi mbetet rreth */}
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            background: tile(meta.g),
            position: "relative",
            ...sx.center,
            overflow: "hidden",
          }}
        >
          <div style={{ ...sx.absoluteFill, background: veil("rgba(255,255,255,0.1)", "rgba(0,0,0,0.3)") }} />
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 1, position: "relative" }}>
            {soundscape.title}
          </div>
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginTop: 10 }}>{soundscape.title}</div>
        <div
          style={{
            fontSize: 12,
            color: T.sub,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginTop: 2,
          }}
        >
          4.{7 + (index % 2)} <Star size={11} fill={T.gold} color={T.gold} />
        </div>
      </button>
    </RowItem>
  );
}

/** Etiketa e kohëzgjatjes, poshtë-djathtas mbi një kapak. */
export function DurationTag({ minutes }) {
  return (
    <span
      style={{
        position: "absolute",
        bottom: 12,
        right: 12,
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 8,
      }}
    >
      {minutes}m
    </span>
  );
}

export { ASPECT };
