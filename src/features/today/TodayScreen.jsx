import { ChevronRight, Hexagon, Play } from "lucide-react";
import { T, fonts, layout, radii } from "../../theme/tokens.js";
import { sx, iconBox } from "../../theme/styles.js";
import { tile, readabilityVeil } from "../../theme/gradients.js";
import { dayPart } from "../../lib/time.js";
import { GREETINGS } from "../../data/greetings.js";
import { TABS } from "../../config/navigation.js";
import { intentMeta } from "../../domain/intent.js";
import {
  blocksForDayPart,
  listPrograms,
  listShorts,
  listSoundscapes,
} from "../../services/contentRepository.js";
import { useSession } from "../../store/SessionContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useProgress } from "../../store/ProgressContext.jsx";
import { usePlayback } from "../../hooks/usePlayback.js";
import { CoverArt } from "../../components/art/CoverArt.jsx";
import { Row } from "../../components/ui/Row.jsx";
import { SectionHead } from "../../components/ui/SectionHead.jsx";
import { MedCard } from "../../components/cards/MedCard.jsx";
import {
  ProgramProgressCard,
  ShortCard,
  SoundscapeCard,
} from "../../components/cards/ShowcaseCards.jsx";

/**
 * ⚠️  I PARKUAR — nuk është i lidhur me asnjë tab.
 *
 * Specifikimi (seksioni 3) përcakton 5 tabe: Komunitet · Meditime · Krijo ·
 * Programe · Profili. "Sot" nuk është ndër to, ndaj u hoq nga navigimi.
 *
 * Skedari nuk u fshi me qëllim: nëse ky ekran duhet të kthehet, mjafton ta
 * shtosh te `config/navigation.js` dhe te `App.jsx` — asnjë punë nuk humbi.
 *
 * Faqja "Sot" ishte pika e hyrjes, e përshtatur sipas orës: përshëndetja,
 * citati, banneri dhe meditimet e rekomanduara.
 */
export function TodayScreen() {
  const { name } = useSession();
  const { goToTab } = useNavigation();
  const { streak } = useProgress();
  const part = dayPart();
  const greeting = GREETINGS[part];
  const picks = blocksForDayPart(part);

  return (
    <div style={sx.screen}>
      <Greeting name={name} greeting={greeting} />
      <StreakCard days={streak} onOpen={() => goToTab(TABS.COMMUNITY)} />
      <DayBanner greeting={greeting} picks={picks} />

      <SectionHead
        title="Vazhdo programin"
        action="Shih të gjitha"
        onAction={() => goToTab(TABS.PROGRAMS)}
      />
      <Row>
        {listPrograms().slice(0, 3).map((program) => (
          <ProgramProgressCard key={program.id} program={program} />
        ))}
      </Row>

      <SectionHead
        title="Meditimet e tua për"
        accent="sot"
        action="Shih të gjitha"
        onAction={() => goToTab(TABS.LIBRARY)}
      />
      <Row>
        {picks.map((block, i) => (
          <MedCard key={block.id} block={block} index={i} square />
        ))}
      </Row>

      <SectionHead title="Të shkurtra ditore" />
      <Row>
        {listShorts().map((short) => (
          <ShortCard key={short.id} short={short} />
        ))}
      </Row>

      <SectionHead title="Tinguj për" accent="Fokus" />
      <Row>
        {listSoundscapes().map((soundscape, i) => (
          <SoundscapeCard key={soundscape.id} soundscape={soundscape} index={i} />
        ))}
      </Row>
    </div>
  );
}

/** Përshëndetja, emri dhe citati i ditës. */
function Greeting({ name, greeting }) {
  /* citati rrotullohet sipas datës — i njëjti gjatë të gjithë ditës */
  const quote = greeting.quotes[new Date().getDate() % greeting.quotes.length];
  const accent = intentMeta(greeting.intent);

  return (
    <>
      <div style={{ margin: `8px ${layout.gutter}px 4px` }}>
        <div style={{ fontSize: 15, color: T.sub, fontWeight: 500 }}>{greeting.hi},</div>
        <h1
          style={{
            fontSize: "clamp(24px, 8vw, 30px)",
            fontWeight: 800,
            color: T.ink,
            margin: "2px 0 0",
            letterSpacing: -0.5,
          }}
        >
          {name}
        </h1>
      </div>

      <div
        style={{
          margin: `10px ${layout.gutter}px 14px`,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: tile(accent.g) }} />
        <p style={{ margin: 0, fontSize: 14.5, color: T.sub, fontStyle: "italic", lineHeight: 1.5 }}>
          “{quote}”
        </p>
      </div>
    </>
  );
}

/** Kartela e ditëve rresht — çon te progresi në profil. */
function StreakCard({ days, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="ag-press"
      style={{
        width: `calc(100% - ${layout.gutter * 2}px)`,
        margin: `0 ${layout.gutter}px 8px`,
        background: T.bg2,
        border: "none",
        borderRadius: radii.lg,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={iconBox(30, T.success, 8)}>
        <Hexagon size={16} color="#fff" fill="#fff" />
      </div>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: T.ink }}>
        {days}{" "}
        <span style={{ color: T.sub, fontWeight: 500, letterSpacing: 1, fontSize: 13 }}>DITË RRESHT</span>
      </span>
      <ChevronRight size={20} color={T.faint} />
    </button>
  );
}

/** Banneri i madh që nis ritualin e pjesës aktuale të ditës. */
function DayBanner({ greeting, picks }) {
  const { playItems } = usePlayback();
  const accent = intentMeta(greeting.intent);

  return (
    <div
      style={{
        margin: `18px ${layout.gutter}px 0`,
        borderRadius: radii.xxl,
        overflow: "hidden",
        position: "relative",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div style={sx.absoluteFill}>
        <CoverArt intent={greeting.intent} big />
      </div>
      <div style={{ ...sx.absoluteFill, background: readabilityVeil }} />

      <div style={{ position: "relative", padding: 20 }}>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, letterSpacing: 2, marginBottom: 6 }}>
          {greeting.label}
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: "clamp(18px, 5.6vw, 22px)",
            fontWeight: 800,
            marginBottom: 4,
            lineHeight: 1.2,
            fontFamily: fonts.display,
          }}
        >
          {greeting.sub}
        </div>
        <button
          onClick={() => playItems(picks.slice(0, 3))}
          className="ag-press"
          style={{
            marginTop: 12,
            background: "#fff",
            color: accent.g[1],
            border: "none",
            borderRadius: radii.pill,
            padding: "13px 22px",
            fontSize: 14.5,
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Play size={15} /> Fillo tani
        </button>
      </div>
    </div>
  );
}
