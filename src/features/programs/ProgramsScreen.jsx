import { useState } from "react";
import { List, Lock, Play, Search } from "lucide-react";
import { T, fonts, layout, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile, rayTexture } from "../../theme/gradients.js";
import { CARD_WIDTH } from "../../theme/responsive.js";
import { ALL_AREAS } from "../../data/lifeAreas.js";
import { intentMeta } from "../../domain/intent.js";
import {
  blocksForProgram,
  listLifeAreas,
  programsByLifeArea,
} from "../../services/contentRepository.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { Row, RowItem } from "../../components/ui/Row.jsx";
import { SectionHead } from "../../components/ui/SectionHead.jsx";
import { PillButton } from "../../components/ui/Controls.jsx";
import { DurationTag, ASPECT } from "../../components/cards/ShowcaseCards.jsx";

/** Skeda "Programe": kërkim sipas fushës së jetës, trend, dhe në vazhdim. */
export function ProgramsScreen() {
  const [area, setArea] = useState(ALL_AREAS);
  const programs = programsByLifeArea(area);

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
      <p style={{ fontSize: 15, color: T.sub, margin: `0 ${layout.gutter}px 6px` }}>
        Udhëtime të strukturuara meditimi
      </p>

      <SectionHead title="Kërko sipas" accent="kategorive" />
      <AreaFilter value={area} onChange={setArea} />

      {programs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <SectionHead title="Në trend" hint={`${programs.length}`} />
          <Row>
            {programs.map((program, i) => (
              <TrendingCard key={program.id} program={program} rank={i + 1} />
            ))}
          </Row>

          <SectionHead title="Vazhdo programin" />
          <div style={{ padding: `0 ${layout.gutter}px`, display: "flex", flexDirection: "column", gap: 16 }}>
            {programs.slice(0, 2).map((program) => (
              <ContinueCard key={program.id} program={program} />
            ))}
          </div>
        </>
      )}
    </div>
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

/** Kartelë trendi — e gjitha e klikueshme, kapak dhe tekst bashkë. */
function TrendingCard({ program, rank }) {
  const { isPremium, playItems, openUpsell } = usePlayback();
  const meta = intentMeta(program.intent);

  const start = () => (isPremium ? playItems(blocksForProgram(program)) : openUpsell());

  return (
    <RowItem width={CARD_WIDTH.trending}>
      <button onClick={start} className="ag-card" style={{ ...sx.cardButton, textAlign: "left" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: ASPECT.trending,
            borderRadius: radii.lg,
            background: tile(meta.g),
            position: "relative",
            ...sx.center,
            overflow: "hidden",
          }}
        >
          <div style={{ ...sx.absoluteFill, background: rayTexture }} />
          <span
            style={{
              color: "#fff",
              fontFamily: fonts.display,
              fontSize: 21,
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

        <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "baseline" }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: T.faint, flexShrink: 0 }}>{rank}</span>
          <div style={sx.flexText}>
            {/* emri i programit — serif */}
            <div style={{ fontFamily: fonts.display, fontSize: 17, fontWeight: 700, color: T.ink }}>
              {program.title}
            </div>
            <div style={{ fontSize: 12.5, color: T.sub }}>{program.sub}</div>
          </div>
        </div>
      </button>
    </RowItem>
  );
}

/** Kartelë e programit në vazhdim — e gjitha e klikueshme. */
function ContinueCard({ program }) {
  const { isPremium, playItems, openUpsell } = usePlayback();
  const meta = intentMeta(program.intent);

  const start = () => (isPremium ? playItems(blocksForProgram(program)) : openUpsell());

  return (
    <button
      onClick={start}
      className="ag-card"
      style={{
        ...sx.cardButton,
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${T.line}`,
        textAlign: "left",
      }}
    >
      <div style={{ height: 180, background: tile(meta.g), position: "relative", ...sx.center }}>
        <div style={{ ...sx.absoluteFill, background: rayTexture }} />
        <DurationTag minutes={program.lessons * 4} />
        <span
          style={{
            color: "#fff",
            fontFamily: fonts.display,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: 0.5,
            position: "relative",
          }}
        >
          {program.title}
        </span>
      </div>

      <div style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={sx.flexText}>
          {/* emri i programit — serif */}
          <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: T.ink }}>
            {program.title}
          </div>
          <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>
            0 nga {program.lessons} të përfunduara
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={circle(44, T.ink)}>
            {isPremium ? <Play size={17} color="#fff" style={{ marginLeft: 2 }} /> : <Lock size={16} color="#fff" />}
          </div>
          <List size={22} color={T.sub} />
        </div>
      </div>
    </button>
  );
}
