import { useState } from "react";
import { ChevronRight, Lock, Play, Search } from "lucide-react";
import { T, fonts, layout, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile, rayTexture } from "../../theme/gradients.js";
import { CARD_WIDTH } from "../../theme/responsive.js";
import { ALL_AREAS } from "../../data/lifeAreas.js";
import { intentMeta } from "../../domain/intent.js";
import { listLifeAreas, programsByLifeArea } from "../../services/contentRepository.js";
import { useJourney } from "../../store/JourneyContext.jsx";
import { usePlayback } from "../../hooks/usePlayback.js";
import { Row, RowItem } from "../../components/ui/Row.jsx";
import { SectionHead } from "../../components/ui/SectionHead.jsx";
import { PillButton } from "../../components/ui/Controls.jsx";
import { DurationTag } from "../../components/cards/ShowcaseCards.jsx";
import { JourneyMap } from "./JourneyMap.jsx";

const VIEWS = { PROGRAMS: "programs", JOURNEY: "journey" };

/**
 * Skeda "Programe" (seksioni 6.5) me dy nën-tabe.
 *
 * "Progresioni Ditor" shfaqet VETËM kur është nisur një program — një skedë
 * bosh që të fton askund do të ishte zhgënjim; kur nuk ka rrugëtim, ajo nuk
 * ekziston fare.
 */
export function ProgramsScreen() {
  const [view, setView] = useState(VIEWS.PROGRAMS);
  const [area, setArea] = useState(ALL_AREAS);
  const { activeProgram } = useJourney();

  const programs = programsByLifeArea(area);
  const showJourney = Boolean(activeProgram) && view === VIEWS.JOURNEY;

  return (
    <div style={sx.screen}>
      <h1
        style={{
          fontSize: "clamp(24px, 8vw, 30px)",
          fontWeight: 800,
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

      {activeProgram && (
        <div
          className="ag-scroll-x"
          style={{ display: "flex", gap: 8, padding: `0 ${layout.gutter}px 6px`, overflowX: "auto" }}
        >
          <PillButton active={view === VIEWS.PROGRAMS} onClick={() => setView(VIEWS.PROGRAMS)}>
            Programe
          </PillButton>
          <PillButton active={view === VIEWS.JOURNEY} onClick={() => setView(VIEWS.JOURNEY)}>
            Progresioni Ditor
          </PillButton>
        </div>
      )}

      {showJourney ? (
        <JourneyMap onChangeProgram={() => setView(VIEWS.PROGRAMS)} />
      ) : (
        <ProgramsList programs={programs} area={area} onArea={setArea} onStarted={() => setView(VIEWS.JOURNEY)} />
      )}
    </div>
  );
}

function ProgramsList({ programs, area, onArea, onStarted }) {
  const { hasStarted } = useJourney();
  const started = programs.filter((p) => hasStarted(p.id));

  return (
    <>
      <SectionHead title="Kërko sipas" accent="kategorive" />
      <AreaFilter value={area} onChange={onArea} />

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
              <ProgramRow key={program.id} program={program} onStarted={onStarted} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

/** Fushat e jetës si filtër. "Të gjitha" është gjendja fillestare. */
function AreaFilter({ value, onChange }) {
  const options = [{ id: ALL_AREAS, label: "Të gjitha" }, ...listLifeAreas()];

  return (
    <div
      className="ag-scroll-x"
      style={{ display: "flex", gap: 8, padding: `0 ${layout.gutter}px 4px`, overflowX: "auto" }}
    >
      {options.map((option) => (
        <PillButton key={option.id} active={value === option.id} onClick={() => onChange(option.id)}>
          {option.label}
        </PillButton>
      ))}
    </div>
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
              fontFamily: fonts.display,
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
              <div style={{ fontFamily: fonts.display, fontSize: 17, fontWeight: 700, color: T.ink }}>
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

/** Rresht i listës "Të gjitha programet". */
function ProgramRow({ program, onStarted }) {
  const { isPremium, openUpsell } = usePlayback();
  const { startProgram, progressFor, hasStarted } = useJourney();
  const meta = intentMeta(program.intent);
  const progress = progressFor(program.id);
  const started = hasStarted(program.id);

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
        ...sx.card,
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: 12,
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: radii.md,
          background: tile(meta.g),
          flexShrink: 0,
          ...sx.center,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ ...sx.absoluteFill, background: rayTexture }} />
      </div>

      <div style={sx.flexText}>
        <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: T.ink, ...sx.truncate }}>
          {program.title}
        </div>
        <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>{program.sub}</div>
        {started && progress && <ProgressBar percent={progress.percent} color={meta.g[1]} compact />}
      </div>

      <ChevronRight size={18} color={T.faint} style={{ flexShrink: 0 }} />
    </button>
  );
}

function ProgressBar({ percent, color, compact = false }) {
  return (
    <div
      style={{
        height: compact ? 4 : 6,
        borderRadius: 3,
        background: T.line,
        marginTop: compact ? 7 : 12,
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
