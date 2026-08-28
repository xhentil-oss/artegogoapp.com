import { Check, Clock, Lock, Play, Repeat, Sparkles } from "lucide-react";
import { T, fonts, layout, radii, shadows } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { intentMeta } from "../../domain/intent.js";
import { LIGHT_PER_STOP, STOP } from "../../domain/journey.js";
import { useJourney } from "../../store/JourneyContext.jsx";
import { usePlayback } from "../../hooks/usePlayback.js";
import { usePlayer } from "../../store/PlayerContext.jsx";
import { toSequence } from "../../domain/sequence.js";

/**
 * GJEOMETRIA E RRUGËS
 *
 * Të gjitha përmasat janë fikse me qëllim: rruga vizatohet si një SVG i vetëm
 * pas ndalesave, dhe ajo mund të dijë ku bie çdo shenjë vetëm nëse rreshtat
 * kanë lartësi të njëjtë.
 *
 * `MARKER_X` u zhvendos brenda sepse me zhvendosjen e mëparshme (±26 nga buza)
 * shenjat majtas dilnin jashtë kornizës. Tani qendra e kolonës rri 52px nga e
 * majta dhe lëkundja është ±18 — pra buza më e majtë bie te 10px, brenda.
 */
const ROW_H = 104;      // hapësira mes niveleve
const MARKER = 48;      // përmasa e shenjës; e njëjta për të tria gjendjet
const MARKER_X = 52;    // qendra e kolonës së shenjave
const SWING = 18;       // sa lëkundet çdo nivel majtas/djathtas
const MARKER_Y = MARKER / 2;

/** Zhvendosja horizontale e nivelit `i` — çift majtas, tek djathtas. */
const swingAt = (i) => (i % 2 === 0 ? -SWING : SWING);

/**
 * PROGRESIONI DITOR (seksioni 6.5)
 *
 * Rrugëtimi si lojë: një ndalesë për çdo ditë, të lidhura me një rrugë
 * gjarpëruese. Tri gjendje — e përfunduar (ari), e tanishme (violet, pulson),
 * e kyçur (gri).
 *
 * Ndalesat vizatohen si listë vertikale me zhvendosje anësore, jo si vijë
 * SVG: kështu secila mbetet buton i vërtetë me zonë të plotë prekjeje, dhe
 * rruga rri thjesht pas tyre.
 */
export function JourneyMap({ onChangeProgram }) {
  const { activeProgram, stops, summary, light } = useJourney();
  const { isPremium, openUpsell } = usePlayback();
  const { play } = usePlayer();

  if (!activeProgram) return null;

  const meta = intentMeta(activeProgram.intent);

  const startStop = (stop) => {
    /* Vetëm ndalesa e tanishme luhet: e kryera, e kyçura dhe ajo që pret
       nesërmen janë të gjitha jashtë radhe. */
    if (stop.state !== STOP.CURRENT || !stop.meditation) return;
    if (!isPremium) return openUpsell();
    /* Ndalesa i kalohet player-it, që përfundimi ta shënojë ditën vetë. */
    play(toSequence([stop.meditation]), "program", {
      programId: activeProgram.id,
      day: stop.day,
    });
  };

  return (
    <div style={{ padding: `0 ${layout.gutter}px ${layout.pageBottomPad}px` }}>
      <Header
        program={activeProgram}
        summary={summary}
        light={light}
        onChange={onChangeProgram}
      />

      <div style={{ position: "relative", marginTop: 26, height: stops.length * ROW_H }}>
        <Road stops={stops} />

        {stops.map((stop, i) => (
          <StopRow
            key={stop.day}
            stop={stop}
            index={i}
            colors={meta.g}
            onStart={() => startStop(stop)}
          />
        ))}
      </div>
    </div>
  );
}

/** Kreu: programi aktiv, progresi, pikët Dritë, dhe butoni "Ndrysho". */
function Header({ program, summary, light, onChange }) {
  const meta = intentMeta(program.intent);

  return (
    <section
      style={{
        background: tile(meta.g),
        borderRadius: radii.xxl,
        padding: 20,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={sx.flexText}>
          <div style={{ fontSize: 11.5, letterSpacing: 1.5, opacity: 0.8 }}>RRUGËTIMI YT</div>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: 24,
              fontWeight: 700,
              margin: "4px 0 0",
              letterSpacing: 0.3,
            }}
          >
            {program.title}
          </h2>
        </div>

        <button
          onClick={onChange}
          className="ag-press"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: radii.pill,
            padding: "7px 13px",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Repeat size={13} /> Ndrysho
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginBottom: 6 }}>
            {summary.done} nga {summary.total} ditë
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.25)" }}>
            <div
              style={{
                width: `${summary.percent}%`,
                height: "100%",
                borderRadius: 3,
                background: "#fff",
                transition: "width .5s ease",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.18)",
            borderRadius: radii.pill,
            padding: "8px 13px",
            flexShrink: 0,
          }}
        >
          <Sparkles size={14} color={T.gold} />
          <span style={{ fontSize: 13.5, fontWeight: 800 }}>{light}</span>
          <span style={{ fontSize: 11.5, opacity: 0.85 }}>Dritë</span>
        </div>
      </div>
    </section>
  );
}

/**
 * RRUGA — një SVG i vetëm pas ndalesave.
 *
 * Vizatohet si polyline diagonale nga një shenjë te tjetra, jo si vija
 * vertikale mes rreshtave: vetëm kështu duket rrugë, dhe jo copëza pa lidhje.
 * Segmenti ngjyroset ar sapo ndalesa e tij kryhet — pjesa e mbetur rri e
 * ndërprerë, si shteg që ende s'është përshkuar.
 *
 * Gjerësia e SVG-së është 100px me `viewBox` po 100 njësi: kështu një njësi
 * është një piksel, dhe koordinatat llogariten drejtpërdrejt.
 */
function Road({ stops }) {
  const height = stops.length * ROW_H;
  const point = (i) => ({
    x: MARKER_X + swingAt(i),
    y: i * ROW_H + MARKER_Y,
  });

  return (
    <svg
      aria-hidden
      width={100}
      height={height}
      viewBox={`0 0 100 ${height}`}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      {stops.slice(0, -1).map((stop, i) => {
        const from = point(i);
        const to = point(i + 1);
        const travelled = stop.state === STOP.DONE;

        return (
          <line
            key={stop.day}
            x1={from.x}
            y1={from.y + MARKER_Y + 4}
            x2={to.x}
            y2={to.y - MARKER_Y - 4}
            stroke={travelled ? T.gold : T.line}
            strokeWidth={travelled ? 3.5 : 3}
            strokeLinecap="round"
            strokeDasharray={travelled ? undefined : "1 9"}
          />
        );
      })}
    </svg>
  );
}

/** Një ndalesë e rrugëtimit, e vendosur në rreshtin e vet me lartësi fikse. */
function StopRow({ stop, index, colors, onStart }) {
  const done = stop.state === STOP.DONE;
  const current = stop.state === STOP.CURRENT;
  const waiting = stop.state === STOP.WAITING;
  const disabled = !current;

  return (
    <button
      onClick={onStart}
      disabled={disabled}
      aria-label={`Dita ${stop.day}${stop.meditation ? ` — ${stop.meditation.title}` : ""}${
        waiting ? " — hapet nesër" : ""
      }`}
      className={current ? "ag-press" : undefined}
      style={{
        position: "absolute",
        top: index * ROW_H,
        left: 0,
        right: 0,
        height: MARKER,
        display: "flex",
        alignItems: "center",
        gap: 13,
        background: "none",
        border: "none",
        /* Shenja bie te `MARKER_X ± SWING`; padding-u e vendos aty pa e nxjerrë
           butonin jashtë kornizës. */
        padding: `0 0 0 ${MARKER_X - MARKER / 2 + swingAt(index)}px`,
        cursor: current ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      <Marker
        done={done}
        current={current}
        waiting={waiting}
        colors={colors}
        day={stop.day}
      />

      <div style={{ ...sx.flexText, opacity: done || current || waiting ? 1 : 0.45 }}>
        <div style={{ color: T.faint, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
          DITA {stop.day}
        </div>
        <div style={{ color: T.ink, fontSize: 14.5, fontWeight: 700, ...sx.truncate }}>
          {stop.meditation?.title ?? "—"}
        </div>
        <div
          style={{
            color: done ? T.gold : waiting ? T.accent : T.sub,
            fontSize: 12,
            marginTop: 1,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {done ? (
            `+${LIGHT_PER_STOP} Dritë`
          ) : waiting ? (
            <>
              <Clock size={11} /> Hapet nesër
            </>
          ) : (
            stop.meditation && `${stop.meditation.dur} min`
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Rrethi i ndalesës — ari, violet pulsues, ose gri.
 *
 * Përmasa mbetet 48px për të tria gjendjet dhe e tanishmja zmadhohet me
 * `scale`. Po të ndryshonte vetë përmasa, qendra e saj do të zhvendosej dhe
 * rruga e vizatuar në SVG nuk do t'i binte më në mes.
 */
function Marker({ done, current, waiting, colors, day }) {
  return (
    <div
      className={current ? "ag-pulse" : undefined}
      style={{
        width: MARKER,
        height: MARKER,
        transform: current ? "scale(1.14)" : "none",
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: done ? T.gold : current ? tile(colors) : waiting ? "rgba(124,92,224,0.10)" : T.bg2,
        /* Ndalesa që pret nesërmen mban kufi violet: shihet se është e radhës,
           jo një nga të kyçurat e largëta. */
        border: done || current ? "none" : `2px ${waiting ? "dashed" : "solid"} ${waiting ? T.accent : T.line}`,
        boxShadow: current ? shadows.card : done ? `0 2px 10px ${T.gold}55` : "none",
        transition: "all .3s",
      }}
    >
      {done ? (
        <Check size={22} color="#fff" strokeWidth={3} />
      ) : current ? (
        <Play size={20} color="#fff" style={{ marginLeft: 2 }} />
      ) : waiting ? (
        <Clock size={19} color={T.accent} />
      ) : (
        <Lock size={17} color={T.faint} />
      )}

      {/* Numri i ditës mbi shenjë, sa për orientim në rrugëtime të gjata. */}
      {!done && !current && !waiting && (
        <span
          style={{
            position: "absolute",
            fontSize: 10,
            fontWeight: 800,
            color: T.faint,
            transform: "translateY(16px)",
          }}
        >
          {day}
        </span>
      )}
    </div>
  );
}
