import { useState } from "react";
import { Crown, Lock, Play, Search } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile, rayTexture } from "../../theme/gradients.js";
import { CARD_WIDTH } from "../../theme/responsive.js";
import { ALL_AREAS } from "../../data/lifeAreas.js";
import { intentMeta } from "../../domain/intent.js";
import { programsByLifeArea } from "../../services/contentRepository.js";
import { useJourney } from "../../store/JourneyContext.jsx";
import { usePlayback } from "../../hooks/usePlayback.js";
import { Row, RowItem } from "../../components/ui/Row.jsx";
import { SectionHead } from "../../components/ui/SectionHead.jsx";
import { DurationTag } from "../../components/cards/ShowcaseCards.jsx";
import { CoverArt } from "../../components/art/CoverArt.jsx";
import { JourneyMap } from "./JourneyMap.jsx";

/**
 * Skeda "Programe" (seksioni 6.5).
 *
 * ⚠️  Kishte dy pilula sipër — "Programe" dhe "Progresioni Ditor" — që dilnin
 *     sapo nisej një program. Klientja i hoqi (17 shtator 2026).
 *
 *     Harta ditore NUK u hoq bashkë me to: tani hapet vetë kur prek një
 *     program, dhe kthimi te lista bëhet nga "Ndrysho programin" brenda saj.
 *     Po ta kisha hequr edhe atë, prekja e një programi do ta niste atë dhe
 *     ekrani nuk do të ndryshonte fare.
 */
export function ProgramsScreen() {
  const [showJourney, setShowJourney] = useState(false);

  /*
   * ⚠️  Pa filtër: "Kërko sipas kategorive" me pilulat Mendja/Shpirti/Trupi/
   *     Biznesi u hoq me kërkesë (17 shtator 2026). `ALL_AREAS` mbetet si
   *     argument që lista të vijë e plotë — programet janë katër, dhe një
   *     filtër mbi katër zëra kërkon më shumë punë se sa kursen.
   */
  const programs = programsByLifeArea(ALL_AREAS);

  return (
    <div style={sx.screen}>
      <h1
        style={{
          fontSize: "clamp(24px, 8vw, 30px)",
          fontWeight: 700,
          color: T.ink,
          margin: `8px ${layout.gutter}px 4px`,
          letterSpacing: -0.5,
        }}
      >
        Programe
      </h1>
      <p style={{ fontSize: 15, color: T.sub, margin: `0 ${layout.gutter}px 12px` }}>
        Udhëtime të strukturuara meditimi
      </p>

      {showJourney ? (
        <JourneyMap onChangeProgram={() => setShowJourney(false)} />
      ) : (
        <ProgramsList programs={programs} onStarted={() => setShowJourney(true)} />
      )}
    </div>
  );
}

function ProgramsList({ programs, onStarted }) {
  const { hasStarted } = useJourney();
  const started = programs.filter((p) => hasStarted(p.id));

  return (
    <>
      {programs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {started.length > 0 && (
            <>
              <SectionHead title="Vazhdo" accent="programet" hint={`${started.length}`} />
              <Row>
                {started.map((program) => (
                  <ContinueCard key={program.id} program={program} onStarted={onStarted} />
                ))}
              </Row>
            </>
          )}

          <SectionHead title="Të gjitha" accent="programet" hint={`${programs.length}`} />
          <div style={{ padding: `0 ${layout.gutter}px`, display: "flex", flexDirection: "column", gap: 10 }}>
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} onStarted={onStarted} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: `48px ${layout.gutter}px`, color: T.sub }}>
      <Search size={34} color={T.line} style={{ marginBottom: 14 }} />
      <div style={{ fontSize: 15, color: T.ink, fontWeight: 600, marginBottom: 6 }}>
        Asnjë program në këtë kategori
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
        Programe të reja shtohen vazhdimisht. Provo një kategori tjetër.
      </div>
    </div>
  );
}

/**
 * Kartelë e gjerë e programit në vazhdim — kapak, kohë, titull, play, progres.
 *
 * Gjerësia `hero` (92% e enës) e lë buzën e kartelës tjetër të dukshme: pa të,
 * asgjë nuk tregon se rreshti rrëshqet.
 */
function ContinueCard({ program, onStarted }) {
  const { isPremium, openUpsell } = usePlayback();
  const { startProgram, progressFor } = useJourney();
  const meta = intentMeta(program.intent);
  const progress = progressFor(program.id) ?? { done: 0, total: program.lessons, percent: 0 };

  const open = () => {
    if (!isPremium) return openUpsell();
    startProgram(program.id);
    onStarted();
  };

  return (
    <RowItem width={CARD_WIDTH.hero}>
      <button
        onClick={open}
        className="ag-card"
        style={{
          ...sx.cardButton,
          borderRadius: 20,
          overflow: "hidden",
          border: `1px solid ${T.line}`,
          textAlign: "left",
          width: "100%",
        }}
      >
        <div style={{ height: 150, background: tile(meta.g), position: "relative", ...sx.center }}>
          <div style={{ ...sx.absoluteFill, background: rayTexture }} />
          <DurationTag minutes={program.lessons * 4} />
          <span
            style={{
              color: "#fff",
              fontSize: 23,
              fontWeight: 700,
              letterSpacing: 0.5,
              position: "relative",
              textAlign: "center",
              padding: 12,
            }}
          >
            {program.title}
          </span>
        </div>

        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={sx.flexText}>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>
                {program.title}
              </div>
              <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>
                {progress.done} nga {progress.total} të përfunduara
              </div>
            </div>
            <div style={circle(42, T.ink)}>
              {isPremium ? (
                <Play size={17} color="#fff" style={{ marginLeft: 2 }} />
              ) : (
                <Lock size={16} color="#fff" />
              )}
            </div>
          </div>

          <ProgressBar percent={progress.percent} color={meta.g[1]} />
        </div>
      </button>
    </RowItem>
  );
}

/**
 * Kartë e plotë e listës "Të gjitha programet".
 *
 * ⚠️  Ishte rresht i ngushtë me një katror 56px dhe një shigjetë. Klientja i
 *     kërkon kartat e mëdha (17 shtator 2026): kapaku zë tërë gjerësinë dhe
 *     teksti rri mbi të.
 *
 * ⚠️  Titulli është me fontin e zakonshëm, jo me serifin e `fonts.display`.
 *     Specifikimi e ruante serifin për "emrat e programeve", por klientja e
 *     do njësoj me titujt e tjerë të aplikacionit.
 */
function ProgramCard({ program, onStarted }) {
  const { isPremium, openUpsell } = usePlayback();
  const { startProgram, progressFor } = useJourney();
  const progress = progressFor(program.id);
  const done = progress?.done ?? 0;

  const open = () => {
    if (!isPremium) return openUpsell();
    startProgram(program.id);
    onStarted();
  };

  return (
    <button
      onClick={open}
      className="ag-card"
      style={{
        ...sx.cardButton,
        position: "relative",
        overflow: "hidden",
        border: "none",
        borderRadius: radii.xl,
        padding: 0,
        textAlign: "left",
        minHeight: 138,
      }}
    >
      <div style={sx.absoluteFill}>
        <CoverArt intent={program.intent} big />
      </div>

      <span
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(0,0,0,0.35)",
          color: T.gold,
          borderRadius: radii.pill,
          padding: "5px 11px",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 0.6,
          backdropFilter: "blur(4px)",
        }}
      >
        <Crown size={11} /> PREMIUM
      </span>

      <div
        style={{
          position: "relative",
          minHeight: 138,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "18px 16px 14px",
        }}
      >
          {/* Pesha 700, si titujt e tjerë të aplikacionit — 800 e nxirrte këtë
              kartë jashtë ritmit të pjesës tjetër. */}
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: 0.2, lineHeight: 1.15 }}>
          {program.title}
        </div>
        <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 12.5, marginTop: 4 }}>{program.sub}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <ProgressBar percent={progress?.percent ?? 0} color="#fff" compact onDark />
          </div>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11.5, flexShrink: 0 }}>
            {done}/{program.lessons} ditë
          </span>
        </div>
      </div>
    </button>
  );
}

function ProgressBar({ percent, color, compact = false, onDark = false }) {
  return (
    <div
      style={{
        height: compact ? 4 : 6,
        borderRadius: 3,
        /* Mbi kapak të errët, `T.line` gri do të zhdukej: pista bëhet e bardhë
           e tejdukshme, që të dallohet ajo çka mbetet. */
        background: onDark ? "rgba(255,255,255,0.3)" : T.line,
        marginTop: onDark ? 0 : compact ? 7 : 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          borderRadius: 3,
          background: color,
          transition: "width .5s ease",
        }}
      />
    </div>
  );
}
