import { useEffect, useRef, useState } from "react";
import { sx } from "../../theme/styles.js";
import { radii } from "../../theme/tokens.js";
import { breathStateAt, totalSeconds } from "../../domain/breathing.js";

/**
 * UDHËZUESI PAMOR I FRYMËMARRJES — katrori që ndjek zërin.
 *
 * Një pikë udhëton përgjatë një brinje për çdo fazë: lart kur merr frymë,
 * djathtas kur e mban, poshtë kur e nxjerr, majtas kur rri bosh. Çdo brinjë ka
 * ngjyrën e vet, të njëjtën me numrin e rreshtit përkatës poshtë figurës.
 *
 * ⚠️  FORMA E MBAN KUPTIMIN, JO TEKSTI. Emrat e fazave ndërrohen me gjuhën;
 *     katrori jo. Kush e sheh një herë e kupton nga pozicioni i pikës se ku
 *     ndodhet — edhe me ekranin larg syrit, edhe me sy gjysmë të mbyllur, që
 *     është pikërisht gjendja në të cilën përdoret.
 */

/**
 * Sa larg buzës rri katrori, në përqindje të anës.
 *
 * ⚠️  24 është kompromis i matur: etiketat ("MBAJE") rrinë JASHTË katrorit
 *     dhe horizontalisht, si te pamja e klientes, ndaj breshti anësor duhet
 *     të nxërë një fjalë të tërë. Me 28 fjala hynte por katrori dilte aq i
 *     vogël sa qendra e hante — pika nuk kishte ku të udhëtonte. Me 20 fjala
 *     prehej te telefonat e ngushtë.
 */
const INSET = 24;
const SPAN = 100 - INSET * 2;
const FAR = INSET + SPAN;

/** Qendra e pikës për një brinjë dhe një përparim 0→1. */
function dotAt(side, progress) {
  if (side === "top") return { left: INSET + SPAN * progress, top: INSET };
  if (side === "right") return { left: FAR, top: INSET + SPAN * progress };
  if (side === "bottom") return { left: FAR - SPAN * progress, top: FAR };
  return { left: INSET, top: FAR - SPAN * progress };
}

/** Vendi i secilës brinjë — vizatohet si shirit i hollë me ngjyrën e fazës. */
const EDGE = {
  top: { left: `${INSET}%`, top: `${INSET}%`, width: `${SPAN}%`, height: 3 },
  right: { left: `${FAR}%`, top: `${INSET}%`, width: 3, height: `${SPAN}%` },
  bottom: { left: `${INSET}%`, top: `${FAR}%`, width: `${SPAN}%`, height: 3 },
  left: { left: `${INSET}%`, top: `${INSET}%`, width: 3, height: `${SPAN}%` },
};

/** Etiketat rreth katrorit — horizontale, si te pamja e klientes. */
const LABELS = [
  { side: "top", style: { left: "50%", top: `${INSET - 10}%` } },
  { side: "right", style: { left: `${FAR + 12}%`, top: "50%" } },
  { side: "bottom", style: { left: "50%", top: `${FAR + 10}%` } },
  { side: "left", style: { left: `${INSET - 12}%`, top: "50%" } },
];

/**
 * Koha e zbutur — 60 herë në sekondë, e ankoruar te audioja.
 *
 * ⚠️  Shfletuesi e njofton pozicionin e audios rreth katër herë në sekondë.
 *     Pika e lëvizur drejtpërdrejt nga ajo vlerë kërcen: katër hapa për
 *     sekondë, dhe syri i numëron. Këtu vlera e fundit e audios mbahet si
 *     ANKORË, dhe mes dy njoftimeve koha vazhdon vetë me orën e ekranit.
 *
 * ⚠️  Me kufi: kurrë më shumë se një sekondë përtej ankorës. Nëse audioja
 *     ngec (buffering, humbje rrjeti), njoftimet pushojnë — dhe pa këtë kufi
 *     pika do të vazhdonte të rrotullohej mbi një zë që ka heshtur. Më mirë
 *     ndalet bashkë me të.
 */
function useSmoothElapsed(elapsed, playing) {
  const [smooth, setSmooth] = useState(elapsed);
  const anchor = useRef({ at: 0, value: elapsed });

  useEffect(() => {
    anchor.current = { at: performance.now(), value: elapsed };
  }, [elapsed]);

  useEffect(() => {
    if (!playing) return undefined;

    let frame = 0;
    const tick = () => {
      const { at, value } = anchor.current;
      const shtuar = (performance.now() - at) / 1000;
      setSmooth(value + Math.min(shtuar, 1));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  /* Në pauzë vlen pozicioni i vërtetë: pa këtë, pika do të mbetej aty ku e
     la interpolimi, pak përpara zërit. */
  return playing ? smooth : elapsed;
}

export function BreathBox({ pattern, elapsed, playing }) {
  const koha = useSmoothElapsed(elapsed, playing);
  const { phase, progress, remaining, round, done } = breathStateAt(pattern, koha);
  const dot = dotAt(phase.side, progress);

  /** Faza që i takon kësaj brinje — nga ajo merret ngjyra dhe etiketa. */
  const phaseOf = (side) => pattern.phases.find((p) => p.side === side);

  return (
    <div style={{ ...sx.absoluteFill, ...sx.center }}>
      {/* Shtresa e butë nën katror — i jep thellësi pa tërhequr vëmendje. */}
      <div
        style={{
          position: "absolute",
          left: `${INSET - 5}%`,
          top: `${INSET - 5}%`,
          width: `${SPAN + 10}%`,
          height: `${SPAN + 10}%`,
          borderRadius: 24,
          background: "rgba(255,255,255,0.05)",
        }}
      />

      {/* Katër brinjët, secila me ngjyrën e fazës së vet. */}
      {Object.entries(EDGE).map(([side, box]) => {
        const p = phaseOf(side);
        const active = side === phase.side;
        return (
          <div
            key={side}
            style={{
              position: "absolute",
              ...box,
              borderRadius: 3,
              background: p?.color ?? "#fff",
              opacity: done ? 0.35 : active ? 1 : 0.5,
              boxShadow: active && !done ? `0 0 12px ${p?.color}` : "none",
              transition: "opacity .3s ease, box-shadow .3s ease",
            }}
          />
        );
      })}

      {LABELS.map((label) => {
        const p = phaseOf(label.side);
        const active = label.side === phase.side;
        return (
          <span
            key={label.side}
            style={{
              position: "absolute",
              ...label.style,
              transform: "translate(-50%, -50%)",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2.4,
              whiteSpace: "nowrap",
              color: active ? "#fff" : "rgba(255,255,255,0.42)",
              transition: "color .3s ease",
            }}
          >
            {p?.corner ?? ""}
          </span>
        );
      })}

      {/*
        Pika që udhëton. PA `transition` me qëllim: pozicioni rifreskohet 60
        herë në sekondë nga interpolimi, ndaj lëvizja është tashmë e
        vazhdueshme — dhe një kalim i butë mbi të do ta linte gjithmonë pak
        prapa vendit ku duhet të jetë.
      */}
      <div
        style={{
          position: "absolute",
          left: `${dot.left}%`,
          top: `${dot.top}%`,
          width: 13,
          height: 13,
          marginLeft: -6.5,
          marginTop: -6.5,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: `0 0 14px ${phase.color}, 0 0 4px #fff`,
          opacity: done ? 0 : 1,
        }}
      />

      {/* Qendra: sekondat që zbresin dhe emri i fazës. */}
      <div
        style={{
          width: `${SPAN - 16}%`,
          aspectRatio: "1 / 1",
          borderRadius: radii.lg,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          ...sx.center,
          flexDirection: "column",
          gap: 2,
        }}
      >
        {done ? (
          <>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }}>✓</div>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2, color: "#fff" }}>
              U KRYE
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "clamp(36px, 14vw, 50px)",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {remaining}
            </div>
            {/*
              Emri i shkurtër ("MERR"), jo i gjati ("MERR FRYMË").

              ⚠️  Kutia e qendrës është katror dhe ndjek gjerësinë e ekranit;
                  dy fjalë aty prehen në dy rreshta te telefonat e vegjël dhe
                  shtyjnë numrin lart. Fjalia e plotë lexohet te rreshti i
                  ndezur poshtë figurës, ku ka vend sa të duash.
            */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                whiteSpace: "nowrap",
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
              }}
            >
              {phase.corner}
            </div>
          </>
        )}
      </div>

      {/* Raundi — poshtë fare, i qetë. */}
      <span
        style={{
          position: "absolute",
          bottom: "2%",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1.4,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        {done ? "MBARUAR" : `RAUNDI ${round} NGA ${pattern.rounds}`}
      </span>
    </div>
  );
}

/**
 * Katër hapat e ushtrimit, nën figurë — i njëjti rend dhe të njëjtat ngjyra.
 *
 * ⚠️  Lista nuk është zbukurim: figura thotë SA, lista thotë ÇFARË. Numri te
 *     qendra pa fjalë nuk e mëson askënd si merret fryma; fjala pa numër nuk
 *     e mban ritmin. Të dyja bashkë e bëjnë ushtrimin të ndjekshëm edhe pa zë.
 */
export function BreathSteps({ pattern, activeIndex }) {
  const minuta = Math.round(totalSeconds(pattern) / 60);

  return (
    <div style={{ width: "100%", maxWidth: 380, margin: "18px 0 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pattern.phases.map((phase, i) => {
          const active = i === activeIndex;
          return (
            <div
              key={phase.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: radii.pill,
                background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${active ? phase.color : "transparent"}`,
                transition: "background .3s ease, border-color .3s ease",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: phase.color,
                  color: "#0E0E12",
                  fontSize: 12.5,
                  fontWeight: 800,
                  ...sx.center,
                  opacity: active ? 1 : 0.75,
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.75)",
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 500,
                  lineHeight: 1.4,
                }}
              >
                {phase.text}
              </span>
            </div>
          );
        })}
      </div>

      <p
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 12,
          textAlign: "center",
          margin: "14px 0 0",
        }}
      >
        Përsërite {pattern.rounds} herë (≈{minuta} minutë) dhe vëre ndryshimin
      </p>
    </div>
  );
}
