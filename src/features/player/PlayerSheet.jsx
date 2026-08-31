import {
  Bookmark,
  ChevronLeft,
  Download,
  Headphones,
  Info,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Share2,
} from "lucide-react";
import { T, layout, onDark, radii, shadows } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile, immersiveBackdrop } from "../../theme/gradients.js";
import { FLUID, padTop, padBottom } from "../../theme/responsive.js";
import { fmt } from "../../lib/format.js";
import { shareText } from "../../lib/share.js";
import { downloadAudio, REASON, REASON_TEXT } from "../../services/audio.js";
import { intentMeta } from "../../domain/intent.js";
import { usePlayer } from "../../store/PlayerContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useCollections } from "../../store/CollectionsContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { Leaf } from "../../components/icons/BrandIcons.jsx";
import { useState } from "react";
import { usePlayerEngine } from "./usePlayerEngine.js";

/**
 * Player-i imersiv. E gjithë kohëmatja jeton në `usePlayerEngine`;
 * ky komponent është vetëm pamje.
 */
export function PlayerSheet({ sequence }) {
  const { minimize, complete } = usePlayer();
  const engine = usePlayerEngine(sequence, complete);
  const { isFavorite, toggleFavorite, isDownloaded, toggleDownload } = useCollections();
  const { openUpsell } = useNavigation();
  useBodyScrollLock();

  /* Të dyja listat i takojnë meditimit që po luhet tani, jo gjithë seancës. */
  const currentId = engine.current?.id;
  const favorite = currentId ? isFavorite(currentId) : false;
  const downloaded = currentId ? isDownloaded(currentId) : false;

  const meta = intentMeta(engine.current?.intent);
  const Icon = meta.icon;

  const close = () => {
    engine.detach();
    minimize();
  };

  /**
   * Konfirmim i shkurtër.
   *
   * ⚠️  Të tre butonat më parë vepronin NË HESHTJE — shpërndarja e hidhte
   *     rezultatin e vet poshtë, dhe shkarkimi vetëm ndizte një flamur. Një
   *     veprim që nuk thotë asgjë duket i prishur edhe kur ka punuar.
   */
  const [flash, setFlash] = useState(null);
  const say = (message) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 2200);
  };

  const [downloading, setDownloading] = useState(false);

  /**
   * Shkarkim i vërtetë: lidhje e nënshkruar nga serveri, pastaj skedari.
   *
   * ⚠️  Regjistrimi te `/me/downloads` bëhet VETËM pas suksesit. Më parë
   *     flamuri ndizej menjëherë, ndaj profili tregonte një meditim "të
   *     shkarkuar" që nuk ekzistonte askund në pajisje.
   */
  const download = async () => {
    if (!engine.current || downloading) return;

    if (downloaded) {
      toggleDownload(currentId);
      say("Hequr nga të shkarkuarat");
      return;
    }

    setDownloading(true);
    const result = await downloadAudio(engine.current);
    setDownloading(false);

    if (result.ok) {
      toggleDownload(currentId);
      say(`U shkarkua: ${result.name}`);
      return;
    }
    /* 402 nga serveri nuk është gabim për t'u treguar — është ftesë. */
    if (result.reason === REASON.PREMIUM) {
      openUpsell();
      return;
    }
    say(REASON_TEXT[result.reason] ?? "Shkarkimi nuk u krye.");
  };

  /** Ruaj te të preferuarat — shfaqet te Profili, dhe shkon te databaza. */
  const favoriteToggle = () => {
    if (!currentId) return;
    toggleFavorite(currentId);
    say(favorite ? "Hequr nga të preferuarat" : "Ruajtur te të preferuarat");
  };

  /**
   * Shpërndan meditimin aktual me fletën native, ose e kopjon.
   *
   * Lidhja është faqja e aplikacionit, jo një lidhje e drejtpërdrejtë drejt
   * meditimit: nuk ka ende rrugë që ta hapë një meditim nga URL-ja, dhe një
   * lidhje që nuk çon askund është më keq se asnjë.
   */
  const share = async () => {
    const result = await shareText({
      title: "Arte Gogo",
      text: `${engine.current?.title} — ${meta.label}\n${engine.current?.desc ?? ""}`,
      url: window.location.origin,
    });
    if (result === "shared") say("U shpërnda");
    else if (result === "copied") say("Teksti u kopjua");
    else if (result === "failed") say("Shpërndarja nuk u krye");
  };

  return (
    <div
      className="ag-sheet ag-fullscreen"
      style={{
        zIndex: 60,
        background: immersiveBackdrop(meta.g),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        /* safe-area: notch lart, shiriti i gjesteve poshtë */
        padding: `${padTop(20)} 26px ${padBottom(36)}`,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/*
        Konfirmimi. Brenda fletës dhe me `position: fixed`, që të mos zhvendoset
        kur përmbajtja poshtë rrëshqet.
      */}
      {flash && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: `calc(${padBottom(36)} + 78px)`,
            zIndex: 80,
            maxWidth: "88%",
            padding: "10px 18px",
            borderRadius: radii.pill,
            background: "rgba(12,10,24,0.92)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            textAlign: "center",
            boxShadow: shadows.immersive,
            pointerEvents: "none",
          }}
        >
          {flash}
        </div>
      )}

      {/* ---------- shiriti i sipërm ---------- */}
      <div
        style={{
          width: "100%",
          maxWidth: layout.sheetMaxWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <button
          onClick={close}
          aria-label="Minimizo player-in"
          style={{ ...sx.bareButton, ...sx.center, width: 44, height: 44, marginLeft: -10 }}
        >
          <ChevronLeft size={28} color="#fff" />
        </button>

        <div style={{ display: "flex", gap: 14 }}>
          <OutlineCircle
            onClick={download}
            label={downloading ? "Po shkarkohet…" : downloaded ? "Hiq nga të shkarkuarat" : "Shkarko"}
            active={downloaded}
          >
            <Download size={17} color={downloaded ? T.gold : "#fff"} />
          </OutlineCircle>

          <OutlineCircle onClick={share} label="Shpërndaj">
            <Share2 size={17} color="#fff" />
          </OutlineCircle>

          <OutlineCircle
            onClick={favoriteToggle}
            label={favorite ? "Hiq nga të preferuarat" : "Ruaj te të preferuarat"}
            active={favorite}
          >
            <Bookmark size={17} color={favorite ? T.gold : "#fff"} fill={favorite ? T.gold : "none"} />
          </OutlineCircle>
        </div>
      </div>

      {/* ---------- disku ---------- */}
      {/* përmasa relative ndaj fletës: 240px kur ka hapësirë, 74% kur ngushtohet */}
      <div
        style={{
          width: FLUID.playerDisc,
          maxWidth: layout.sheetMaxWidth,
          aspectRatio: "1 / 1",
          borderRadius: 28,
          marginTop: 14,
          marginBottom: 28,
          flexShrink: 0,
          background: tile(meta.g),
          ...sx.center,
          position: "relative",
          boxShadow: engine.playing
            ? `${shadows.immersive}, 0 0 80px ${meta.g[0]}99`
            : shadows.immersive,
          overflow: "hidden",
          animation: engine.playing ? "breathe 6s ease-in-out infinite" : "none",
          transition: "box-shadow .6s ease",
        }}
      >
        <div
          style={{
            ...sx.absoluteFill,
            background:
              "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.05) 0deg 6deg, transparent 6deg 12deg)",
          }}
        />
        <div
          style={{
            width: FLUID.playerRing,
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, rgba(255,255,255,0.9), rgba(255,255,255,0.3), rgba(255,255,255,0.9))",
            ...sx.center,
            animation: engine.playing ? "spin 16s linear infinite" : "none",
          }}
        >
          <div
            style={{
              width: FLUID.playerCore,
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              background: tile(meta.g),
              ...sx.center,
            }}
          >
            <Icon size={40} color="#fff" />
          </div>
        </div>
      </div>

      {/* ---------- titulli ---------- */}
      <h2
        style={{
          fontSize: "clamp(21px, 6.5vw, 26px)",
          color: "#fff",
          margin: "0 0 8px",
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {engine.current?.title}
      </h2>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
        <div style={circle(24, tile(meta.g))}>
          <Leaf size={13} />
        </div>
        <span style={{ color: onDark.primary, fontSize: 15 }}>Arte Gogo · {meta.label}</span>
      </div>
      <p
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 13.5,
          maxWidth: 360,
          textAlign: "center",
          lineHeight: 1.6,
          margin: "10px 0 0",
        }}
      >
        {engine.current?.desc}
      </p>

      {/* ---------- kontrollet ---------- */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(18px, 7vw, 30px)", margin: "36px 0 28px" }}>
        <SeekButton direction="back" seconds={engine.seekStep} onClick={() => engine.seek(-engine.seekStep)} />
        <button
          onClick={engine.toggle}
          className="ag-press"
          style={{
            ...circle(84, "#fff"),
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          }}
        >
          {engine.playing ? (
            <Pause size={34} color={meta.g[1]} />
          ) : (
            <Play size={34} color={meta.g[1]} style={{ marginLeft: 4 }} />
          )}
        </button>
        <SeekButton direction="forward" seconds={engine.seekStep} onClick={() => engine.seek(engine.seekStep)} />
      </div>

      {/* ---------- shënim mbi audion ---------- */}
      <div
        style={{
          width: "100%",
          maxWidth: layout.sheetMaxWidth,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 11,
            background: onDark.fill,
            borderRadius: radii.pill,
            padding: "13px 18px",
          }}
        >
          <Headphones size={18} color={onDark.secondary} />
          <span style={{ color: onDark.secondary, fontSize: 13.5 }}>
            Tinguj demo — zëvendëso me audio reale
          </span>
        </div>
        <div style={circle(50, onDark.fill)}>
          <Info size={19} color={onDark.secondary} />
        </div>
      </div>

      {/* ---------- progresi ---------- */}
      <div style={{ width: "100%", maxWidth: layout.sheetMaxWidth }}>
        <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 4 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${engine.blockPercent}%`,
              background: "#fff",
              borderRadius: 4,
              transition: "width 1s linear",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${engine.blockPercent}%`,
              top: "50%",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#fff",
              transform: "translate(-50%,-50%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              transition: "left 1s linear",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            color: onDark.secondary,
            fontSize: 14,
          }}
        >
          <span>{fmt(engine.blockElapsed)}</span>
          <span>{fmt(engine.blockSeconds)}</span>
        </div>

        {/* hapat e seancës, në proporcion me kohëzgjatjen */}
        <div style={{ display: "flex", gap: 3, marginTop: 12 }}>
          {sequence.map((block, i) => (
            <div
              key={block.uid}
              style={{
                flex: block.dur,
                height: 3,
                borderRadius: 2,
                background:
                  i < engine.index ? "#fff" : i === engine.index ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        <div style={{ textAlign: "center", color: onDark.muted, fontSize: 12, marginTop: 10 }}>
          Hapi {engine.index + 1} nga {sequence.length} · {fmt(engine.overallElapsed)} /{" "}
          {fmt(engine.overallSeconds)}
        </div>
      </div>
    </div>
  );
}

function OutlineCircle({ onClick, children, label, active }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="ag-press"
      style={{
        ...circle(42, active ? "rgba(224,169,60,0.18)" : "none"),
        border: `1.5px solid ${active ? T.gold : onDark.hairline}`,
        padding: 0,
        cursor: onClick ? "pointer" : "default",
        transition: "background .2s, border-color .2s",
      }}
    >
      {children}
    </button>
  );
}

/** Kërcim ±15s — numri shkruhet brenda ikonës rrethore. */
function SeekButton({ direction, seconds, onClick }) {
  const Icon = direction === "back" ? RotateCcw : RotateCw;
  return (
    <button onClick={onClick} style={{ ...sx.bareButton, position: "relative" }}>
      <Icon size={40} color={onDark.primary} strokeWidth={1.4} />
      <span
        style={{
          position: "absolute",
          inset: 0,
          ...sx.center,
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          paddingTop: 2,
        }}
      >
        {seconds}
      </span>
    </button>
  );
}
