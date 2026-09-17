import { Bookmark, Check, Clock, Crown, Play } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { heroVeil } from "../../theme/gradients.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { intentMeta } from "../../domain/intent.js";
import { benefitsFor } from "../../domain/benefits.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useCollections } from "../../store/CollectionsContext.jsx";
import { usePlayback } from "../../hooks/usePlayback.js";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { CoverArt } from "../../components/art/CoverArt.jsx";
import { BackButton, CircleIconButton } from "../../components/ui/Controls.jsx";

/**
 * FLETA E MEDITIMIT — ç'është, para se të nisë.
 *
 * ⚠️  Prekja e një meditimi nuk e nis më dëgjimin drejtpërdrejt. Më parë
 *     shtypja e një kartele hapte player-in menjëherë: pa titull të plotë, pa
 *     përshkrim, pa kohëzgjatje të lexuar — vendimi merrej pa asnjë të dhënë.
 *     Tani hapet kjo fletë, dhe dëgjimi nis me butonin "Luaj meditimin".
 *
 * Vjen si fletë mbi ekran, jo si skedë: mbyllet me "prapa" dhe e lë pamjen e
 * mëparshme aty ku ishte.
 */
export function MeditationSheet({ item }) {
  const { closeMeditation } = useNavigation();
  const { isFavorite, toggleFavorite } = useCollections();
  const { playItems } = usePlayback();
  useBodyScrollLock();

  const meta = intentMeta(item.intent);
  const favorite = isFavorite(item.id);

  const luaj = () => {
    /* Fleta mbyllet e para: player-i vjen mbi të, dhe pas dëgjimit përdoruesi
       kthehet te lista, jo te kjo fletë. */
    closeMeditation();
    playItems(item);
  };

  return (
    <div className="ag-sheet ag-fullscreen" style={{ ...sx.fullSheet, zIndex: 58 }}>
      {/* ---------- kapaku ---------- */}
      <div
        style={{
          height: 300,
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: `${padTop(layout.gutter)} ${layout.gutter}px`,
        }}
      >
        <div style={sx.absoluteFill}>
          <CoverArt intent={item.intent} image={item.cover} big />
        </div>
        <div style={{ ...sx.absoluteFill, background: heroVeil }} />

        <BackButton onClick={closeMeditation} blur />

        <CircleIconButton
          onClick={() => toggleFavorite(item.id)}
          label={favorite ? "Hiq nga të preferuarat" : "Ruaj te të preferuarat"}
          blur
          background="rgba(0,0,0,0.35)"
        >
          <Bookmark size={19} color="#fff" fill={favorite ? "#fff" : "none"} />
        </CircleIconButton>
      </div>

      {/* ---------- teksti ---------- */}
      <div style={{ padding: `18px ${layout.gutter}px 0` }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <Etiketa color={meta.g[1]}>{meta.label}</Etiketa>
          {item.premium && (
            <Etiketa color={T.gold}>
              <Crown size={12} /> PREMIUM
            </Etiketa>
          )}
        </div>

        <h1 style={{ color: T.ink, fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
          {item.title}
        </h1>

        {/* Vetëm kohëzgjatja: yjet dhe autori ranë nga i gjithë aplikacioni. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: T.sub,
            fontSize: 13.5,
            marginTop: 8,
          }}
        >
          <Clock size={14} /> {item.dur} min
        </div>

        <p style={{ color: T.sub, fontSize: 15, lineHeight: 1.6, margin: "16px 0 0" }}>{item.desc}</p>

        <h2 style={{ color: T.ink, fontSize: 16, fontWeight: 700, margin: "26px 0 12px" }}>
          Çfarë do të ndjesh
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {benefitsFor(item.intent).map((rresht) => (
            <div key={rresht} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  ...sx.center,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: `${meta.g[1]}22`,
                  flexShrink: 0,
                }}
              >
                <Check size={13} color={meta.g[1]} />
              </span>
              <span style={{ color: T.sub, fontSize: 14.5 }}>{rresht}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- butoni ---------- */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: 28,
          padding: `12px ${layout.gutter}px ${padBottom(16)}`,
          background: T.bg,
        }}
      >
        <button
          onClick={luaj}
          className="ag-press"
          style={{
            width: "100%",
            background: T.ink,
            color: "#fff",
            border: "none",
            borderRadius: radii.pill,
            padding: 17,
            fontSize: 15.5,
            fontWeight: 700,
            cursor: "pointer",
            ...sx.center,
            gap: 9,
          }}
        >
          <Play size={17} fill="#fff" /> Luaj meditimin
        </button>
      </div>
    </div>
  );
}

/** Pilulë e vogël me tintin e ngjyrës së vet. */
function Etiketa({ color, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: `${color}1F`,
        color,
        borderRadius: radii.pill,
        padding: "6px 12px",
        fontSize: 11.5,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}
