import { useEffect, useRef, useState } from "react";
import { Check, Clock, Lock, Play, Sparkles } from "lucide-react";
import { T, layout, radii, shadows } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { CoverArt } from "../../components/art/CoverArt.jsx";
import { intentMeta } from "../../domain/intent.js";
import { LIGHT_PER_STOP, STOP } from "../../domain/journey.js";
import { useJourney } from "../../store/JourneyContext.jsx";
import { usePlayback } from "../../hooks/usePlayback.js";
import { usePlayer } from "../../store/PlayerContext.jsx";
import { toSequence } from "../../domain/sequence.js";

/**
 * GJEOMETRIA E RRUGËS
 *
 * ⚠️  Rruga vizatohet në PIKSEL, jo në përqindje. Më parë SVG-ja shtrihej me
 *     `preserveAspectRatio="none"`: kjo mjaftonte për një vijë me trashësi të
 *     njëjtë, por jo për një rrugë që herë ngushtohet e herë zgjerohet — një
 *     formë e mbushur do të deformohej bashkë me shtrirjen. Prandaj gjerësia
 *     e kontejnerit matet dhe koordinatat llogariten drejtpërdrejt.
 *
 * ⚠️  Raporti lartësi/kërcim horizontal e mban kthesën të butë. `ROW_H` i
 *     vogël me lëkundje të gjerë e shtyp kurbën S dhe rruga mbivendoset vetë.
 */
const ROW_H = 100;      // hapësira mes ndalesave
const MARKER = 46;      // përmasa e rrethit; e njëjta për të tria gjendjet
const LEFT_X = 27;      // qendra e ndalesave çift, në % të gjerësisë
const RIGHT_X = 70;     // qendra e ndalesave tek
const MARKER_Y = MARKER / 2;
const ROAD_HW = 25;     // gjysmë-gjerësia bazë e rrugës
const ROAD_WAVE = 0.18; // sa zgjerohet në mes të çdo segmenti

/** Përqindja horizontale e ndalesës `i` — çift majtas, tek djathtas. */
const xAt = (i) => (i % 2 === 0 ? LEFT_X : RIGHT_X);

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

  /* Gjerësia e vërtetë e kolonës — rruga ka nevojë për piksel, jo përqindje. */
  const kutia = useRef(null);
  const [gjeresia, setGjeresia] = useState(0);

  useEffect(() => {
    const el = kutia.current;
    if (!el) return undefined;
    const vrojtues = new ResizeObserver(([hyrja]) => setGjeresia(hyrja.contentRect.width));
    vrojtues.observe(el);
    return () => vrojtues.disconnect();
  }, []);

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

      <div ref={kutia} style={{ position: "relative", marginTop: 26, height: stops.length * ROW_H }}>
        <Road stops={stops} colors={meta.g} width={gjeresia} />

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

/**
 * Kreu — kartë e errët me kapakun, emrin, ndalesën e tanishme dhe Dritën.
 *
 * ⚠️  Titulli me fontin e zakonshëm, jo me serifin e `fonts.display`: klientja
 *     i do emrat e programeve njësoj me titujt e tjerë të aplikacionit.
 */
function Header({ program, summary, light, onChange }) {
  return (
    <section
      style={{
        /* Vjollcë e errët, jo gradienti i çastit: te pamja e klientes kreu
           është i errët për çdo program, që rruga e ndritshme poshtë të dalë
           në plan të parë. */
        background: "linear-gradient(135deg, #2B2140 0%, #3B2F5E 100%)",
        borderRadius: radii.xxl,
        padding: 16,
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            overflow: "hidden",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <CoverArt intent={program.intent} />
        </div>

        <div style={sx.flexText}>
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, letterSpacing: 0.2 }}>
            {program.title}
          </h2>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>
            Ndalesa {Math.min(summary.done + 1, summary.total)} nga {summary.total}
          </div>
        </div>

        <button
          onClick={onChange}
          className="ag-press"
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.28)",
            borderRadius: radii.pill,
            padding: "8px 15px",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Ndrysho
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 14, fontSize: 12.5 }}>
        <Sparkles size={14} color={T.gold} />
        <span style={{ fontWeight: 800, color: T.gold }}>{light} Dritë</span>
        <span style={{ color: "rgba(255,255,255,0.55)" }}>· +{LIGHT_PER_STOP} për çdo ndalesë</span>
      </div>
    </section>
  );
}

/**
 * RRUGA — shteg makine me gjerësi që luhatet.
 *
 * ⚠️  NUK është vijë me trashësi (`stroke`), por FORMË E MBUSHUR: vetëm kështu
 *     rruga mund të ngushtohet diku dhe të zgjerohet diku tjetër, siç e kërkon
 *     pamja. Ndërtohet duke marrë mostra të kurbës qendrore dhe duke e
 *     zhvendosur secilën majtas e djathtas me një gjysmë-gjerësi që ndryshon.
 *
 * ⚠️  Zhvendosja bëhet vetëm horizontalisht, jo pingul me kurbën. Rruga është
 *     kryesisht vertikale, ndaj dallimi nuk shihet — dhe llogaritja e normales
 *     do të kërkonte derivatin e kurbës për çdo mostër, pa asnjë fitim pamor.
 *
 * Mbi formë vizatohen korsia e ndërprerë dhe, kur ka ditë të kryera, pjesa e
 * përshkuar me ngjyrën e programit.
 */
const MOSTRA = 26; // mostra për çdo segment mes dy ndalesave

function Road({ stops, colors, width }) {
  const height = stops.length * ROW_H;
  if (!width || stops.length < 2) return null;

  const px = (i) => (xAt(i) / 100) * width;
  const y = (i) => i * ROW_H + MARKER_Y;

  /* Pika e kurbës kubike mes ndalesave `i` dhe `i+1`, te `t` ∈ [0,1]. */
  const pointAt = (i, t) => {
    const x0 = px(i);
    const x1 = px(i + 1);
    const y0 = y(i);
    const y1 = y(i + 1);
    const dy = (y1 - y0) * 0.5;
    const u = 1 - t;
    return {
      x: u * u * u * x0 + 3 * u * u * t * x0 + 3 * u * t * t * x1 + t * t * t * x1,
      y: u * u * u * y0 + 3 * u * u * t * (y0 + dy) + 3 * u * t * t * (y1 - dy) + t * t * t * y1,
    };
  };

  /**
   * Mostrat e qendrës, nga ndalesa e parë te `deri`.
   *
   * Çdo mostër mban edhe `t`-në e vet BRENDA segmentit, sepse gjerësia varet
   * prej saj: rruga është më e ngushtë te ndalesat dhe zgjerohet në mes.
   */
  const qendra = (deri) => {
    const out = [];
    for (let i = 0; i < deri; i += 1) {
      for (let k = 0; k <= MOSTRA; k += 1) {
        if (i > 0 && k === 0) continue; // mos e përsërit pikën e përbashkët
        const t = k / MOSTRA;
        out.push({ ...pointAt(i, t), t });
      }
    }
    return out;
  };

  /**
   * Forma e rrugës: majtas para, djathtas mbrapsht.
   *
   * Gjysmë-gjerësia ndjek një gjysmë-sinus brenda ÇDO segmenti: zero te
   * ndalesat, maksimum në mes. Kështu rruga hapet mes dy ditëve dhe mblidhet
   * aty ku rrethi e mbulon gjithsesi.
   */
  const hw = (p) => ROAD_HW * (1 + ROAD_WAVE * Math.sin(p.t * Math.PI));

  const shiriti = (pika) => {
    const majtas = pika.map((p, k) => `${k === 0 ? "M" : "L"} ${(p.x - hw(p)).toFixed(2)} ${p.y.toFixed(2)}`);
    const djathtas = [...pika]
      .reverse()
      .map((p) => `L ${(p.x + hw(p)).toFixed(2)} ${p.y.toFixed(2)}`);
    return `${majtas.join(" ")} ${djathtas.join(" ")} Z`;
  };

  /** Vija e qendrës, si shteg i hapur — mbi të vizatohet korsia. */
  const vija = (pika) =>
    pika.map((p, k) => `${k === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

  const tegjitha = qendra(stops.length - 1);
  const lastDone = stops.reduce((last, stop, i) => (stop.state === STOP.DONE ? i : last), -1);
  const ekaluara = lastDone >= 1 ? qendra(lastDone) : null;

  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      {/* buza — e njëjta formë, pak më e gjerë, pak më e errët */}
      <path d={shiriti(tegjitha)} fill="#DFDFE8" transform="scale(1)" />
      <path d={shiriti(tegjitha)} fill={T.bgSkeleton} transform={`translate(0 1.5)`} />
      {ekaluara && <path d={shiriti(ekaluara)} fill={`${colors[1]}4D`} />}
      <path
        d={vija(tegjitha)}
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeDasharray="14 16"
      />
    </svg>
  );
}

/**
 * Një ndalesë: rrethi mbi rrugë dhe poshtë tij dita me emrin e meditimit.
 *
 * Butoni vendoset me `left` në përqindje dhe `translateX(-50%)`, që qendra e
 * tij të bjerë saktësisht mbi pikën ku kalon rruga — e njëjta përqindje që
 * përdor SVG-ja.
 */
function StopRow({ stop, index, colors, onStart }) {
  const done = stop.state === STOP.DONE;
  const current = stop.state === STOP.CURRENT;
  const waiting = stop.state === STOP.WAITING;

  return (
    <button
      onClick={onStart}
      disabled={!current}
      aria-label={`Dita ${stop.day}${stop.meditation ? ` — ${stop.meditation.title}` : ""}${
        waiting ? " — hapet nesër" : ""
      }`}
      className={current ? "ag-press" : undefined}
      style={{
        position: "absolute",
        top: index * ROW_H,
        left: `${xAt(index)}%`,
        transform: "translateX(-50%)",
        width: 104,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        padding: 0,
        cursor: current ? "pointer" : "default",
      }}
    >
      <Marker done={done} current={current} waiting={waiting} colors={colors} />

      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{ color: current ? T.ink : T.sub, fontSize: 12, fontWeight: 700 }}>
          Dita {stop.day}
        </div>
        <div
          style={{
            color: T.faint,
            fontSize: 10.5,
            marginTop: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.3,
          }}
        >
          {waiting ? "Hapet nesër" : (stop.meditation?.title ?? "—")}
        </div>
      </div>
    </button>
  );
}

/**
 * Rrethi i ndalesës — ari kur është kryer, violet me shkëlqim kur është e
 * radhës, gri me dry kur është e kyçur.
 *
 * Përmasa mbetet 56px për të tria gjendjet: po të ndryshonte, qendra do të
 * zhvendosej dhe rruga nuk do t'i binte më në mes.
 */
function Marker({ done, current, waiting, colors }) {
  /*
   * ⚠️  Vetëm ndalesa e TANISHME është më e vogël: ajo ka unazë të bardhë dhe
   *     shkëlqim rreth e rrotull, që e bëjnë të duket më e madhe se ç'është.
   *     Të kryerat dhe të kyçurat rrinë të njëjta mes tyre — përndryshe
   *     rrugëtimi do të dukej i bërë me rrathë të përmasave të ndryshme.
   *
   * ⚠️  Rrethi rri brenda një kutie me lartësi FIKSE `MARKER` dhe centrohet në
   *     të. Kështu qendra e tij nuk lëviz kur përmasa ndryshon — dhe rruga,
   *     që llogaritet me `MARKER / 2`, vazhdon t'i bjerë saktësisht në mes.
   */
  const size = current ? MARKER : MARKER + 12;

  return (
    <div style={{ height: MARKER, ...sx.center, flexShrink: 0 }}>
    <div
      className={current ? "ag-pulse" : undefined}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        ...sx.center,
        /* E kryera dhe e tanishmja ndajnë NJË ngjyrë — atë të programit. Ari
           i mëparshëm fuste një ngjyrë të dytë që nuk thoshte asgjë më shumë:
           dallimi shihet nga shenja (kontroll kundrejt trekëndësh) dhe nga
           halo-ja e ndalesës së radhës. */
        background: done || current ? tile(colors) : T.bgSkeleton,
        /* Unaza e bardhë e shkëput rrethin nga rruga poshtë tij. */
        border: `4px solid ${T.bg}`,
        boxShadow: current
          ? `0 0 0 7px ${T.accent}2E, ${shadows.card}`
          : done
            ? `0 2px 10px ${colors[1]}55`
            : "none",
        transition: "all .3s",
      }}
    >
      {done ? (
        <Check size={26} color="#fff" strokeWidth={3} />
      ) : current ? (
        <Play size={22} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
      ) : waiting ? (
        <Clock size={22} color={T.faint} />
      ) : (
        <Lock size={21} color={T.faint} />
      )}
    </div>
    </div>
  );
}
