/**
 * ⚠️  VEND-MBAJTËS — të fshihen kur vjen backend-i.
 *
 * Vlerësimet, autorët dhe sekondat "shtesë" në kartela janë të trilluara
 * nga indeksi, thjesht që UI-ja të dukej e plotë në demo. Të gjitha janë
 * mbledhur këtu që t'i zhdukësh me një kërkim të vetëm: kur `Meditation`
 * të vijë nga API me `rating`, `instructor` dhe `durationSeconds` reale,
 * fshiji këto funksione dhe lexo fushat e vërteta.
 */

export const INSTRUCTORS = ["Marvin", "Arte Gogo", "Hëna e Brendshme"];

/** Autor i rrotulluar sipas pozicionit në listë. */
export const authorFor = (index = 0) => INSTRUCTORS[index % INSTRUCTORS.length];

/** Vlerësim i trilluar: 4.6 – 4.8. */
export const ratingFor = (index = 0) => `4.${6 + (index % 3)}`;

/** Sekonda dekorative pas minutave në kartela. */
export const extraSecondsFor = (index = 0, step = 7) => (index * step) % 60;
