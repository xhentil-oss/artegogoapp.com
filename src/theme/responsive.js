/**
 * PËRSHTATJA NË EKRANE
 *
 * Aplikacioni është mobile-first: një kolonë e vetme që rritet deri në
 * `layout.frameWidth` dhe pastaj centrohet (shih `.ag-frame` në global.css).
 *
 * ⚠️  PËRQINDJE, JO `vw`.
 * Përmasat janë relative ndaj ENËS, jo ndaj ekranit. Me `vw` një kartelë
 * "82vw" bëhet 459px kur dritarja është 560px — më e gjerë se hapësira e
 * brendshme e kornizës (444px) — dhe kartelat ngjiten pas buzës. Përqindja
 * matet ndaj kutisë së përmbajtjes së prindit, që tashmë përjashton `gutter`-in,
 * ndaj punon njësoj në telefon 320px dhe në desktop 1920px.
 */

/**
 * Gjerësi kartele që tkurret në enë të vogla.
 *
 * `min(300px, 92%)` — brenda kornizës (444px të brendshme) kartela ndalon në
 * 300px të projektuar; në telefon 320px bie në 92% dhe lë të dukshme buzën e
 * kartelës tjetër, sinjali që rreshti rrëshqet.
 */
export const fluidWidth = (maxPx, percent) => `min(${maxPx}px, ${percent}%)`;

/** Gjerësitë e kartelave, të mbledhura që rreshtat të mbeten koherentë. */
export const CARD_WIDTH = {
  /** Programe dhe seri të kuruara — kartela më e madhe horizontale. */
  hero: fluidWidth(300, 92),
  /** Meditim me kapak 1:1. */
  square: fluidWidth(200, 62),
  /** Meditim me kapak të shtypur. */
  wide: fluidWidth(220, 69),
  /** Kartelë e ngushtë brenda folderave dhe të shkurtrave. */
  compact: fluidWidth(150, 47),
  /** Rreth peizazhi tingullor. */
  sound: fluidWidth(170, 52),
  /** Kartelë programi në trend. */
  trending: fluidWidth(240, 76),
  /** Pllakë praktike — 8 në rresht, ndaj më e vogël se kartelat e tjera. */
  practice: fluidWidth(118, 34),
};

/**
 * Përmasa të elementeve të mëdha që duhet të tkurren bashkë me enën.
 *
 * Disku i player-it matet ndaj fletës; unaza dhe bërthama ndaj prindit të
 * drejtpërdrejtë — kështu të treja shkallëzohen bashkë, pa llogaritje.
 */
export const FLUID = {
  /** Disku i player-it, ndaj hapësirës së brendshme të fletës. */
  playerDisc: fluidWidth(240, 74),
  /** Unaza rrotulluese — 62.5% e diskut (150/240 e projektimit). */
  playerRing: "62.5%",
  /** Bërthama — 80% e unazës (120/150 e projektimit). */
  playerCore: "80%",
  /** Unaza festive e ekranit të përmbylljes. */
  completionRing: fluidWidth(130, 42),
};

/**
 * Zonat e sigurta (notch, shiriti i gjesteve).
 * `env()` kthen 0px kur nuk aplikohet, ndaj është e sigurt gjithkund.
 */
export const SAFE = {
  top: "env(safe-area-inset-top, 0px)",
  bottom: "env(safe-area-inset-bottom, 0px)",
};

/** Padding që respekton zonën e sigurt lart. */
export const padTop = (px) => `calc(${px}px + ${SAFE.top})`;

/** Padding që respekton shiritin e gjesteve poshtë. */
export const padBottom = (px) => `calc(${px}px + ${SAFE.bottom})`;

/**
 * Grid që shton kolona vetë sipas hapësirës.
 * `min` është zgjedhur që telefoni i ngushtë të mbajë numrin e kolonave
 * të projektuar, dhe korniza e plotë të fitojë kolona shtesë pa u zbrazur.
 */
export const autoGrid = (minPx, gap = 14) => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, minmax(${minPx}px, 1fr))`,
  gap,
});
