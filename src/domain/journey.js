import { MEDITATIONS } from "./classification.js";
import { BLOCKS } from "../data/blocks.js";

/**
 * RRUGËTIMI I NJË PROGRAMI (seksioni 6.5)
 *
 * Një program është një radhë ndalesash — një për çdo ditë, secila me një
 * meditim. Këtu llogaritet vetëm gjendja; vizatimi i "autostradës" bëhet te
 * `features/programs/JourneyMap.jsx`.
 *
 * Tri gjendjet vijnë nga specifikimi:
 *   · `done`    — e përfunduar (ari, +15 Dritë)
 *   · `current` — e tanishme (violet, pulson)
 *   · `locked`  — e kyçur (gri)
 */

/** Pikët "Dritë" për çdo ndalesë të përfunduar. */
export const LIGHT_PER_STOP = 15;

/**
 * Gjendjet e një ndalese.
 *
 * `WAITING` nuk figuron te specifikimi, por e kërkon rregulli i një ndalese
 * në ditë: pa të, ndalesa e radhës do të dukej e kyçur si të gjitha të tjerat
 * dhe përdoruesi nuk do ta kuptonte pse nuk hapet — as se hapet nesër.
 */
export const STOP = {
  DONE: "done",
  CURRENT: "current",
  WAITING: "waiting",
  LOCKED: "locked",
};

/**
 * Ditët e kryera, në formën `{ dita: "2026-08-28" }`.
 *
 * Pranon edhe formën e vjetër — thjesht një varg ditësh — që rrugëtimet e
 * nisura para këtij ndryshimi të mos humbin. Ato marrin datë `null`, pra
 * trajtohen si të kryera "dikur" dhe nuk e bllokojnë ditën e sotme.
 */
export function normalizeCompletions(value) {
  if (Array.isArray(value)) return Object.fromEntries(value.map((day) => [day, null]));
  return value && typeof value === "object" ? value : {};
}

/** Numrat e ditëve të kryera. */
export const completedDays = (completions) =>
  Object.keys(normalizeCompletions(completions)).map(Number);

/**
 * Meditimet e çdo dite të një programi.
 *
 * Programet e krijuara nga admin-i mbajnë vetë ditët (`program.days`), me
 * ID-të e meditimeve. Ato bazë nuk i kanë ende, ndaj ditët nxirren nga
 * katalogu sipas qëllimit — në mënyrë të QËNDRUESHME, jo rastësore: një
 * rrugëtim që ndryshon meditimet sa herë hapet nuk do të ishte rrugëtim.
 *
 * @returns {{ day: number, meditation: object|null }[]}
 */
export function programStops(program) {
  if (!program) return [];
  const total = Math.max(1, program.lessons ?? program.total_days ?? 1);

  /* Programet e admin-it: ditët janë të shkruara. */
  if (Array.isArray(program.days) && program.days.length > 0) {
    return program.days.slice(0, total).map((ids, i) => ({
      day: i + 1,
      meditation: findById(ids?.[0]) ?? null,
    }));
  }

  /* Programet bazë: ndalesat merren me radhë nga meditimet e atij qëllimi. */
  const pool = MEDITATIONS.filter((m) => m.intent === program.intent);
  const source = pool.length > 0 ? pool : MEDITATIONS;

  return Array.from({ length: total }, (_, i) => ({
    day: i + 1,
    /* Modulo: nëse ditët janë më shumë se meditimet, cikli rinis — më mirë se
       ndalesa boshe. */
    meditation: source.length > 0 ? source[i % source.length] : null,
  }));
}

const findById = (id) =>
  id ? BLOCKS.find((b) => b.id === id) ?? MEDITATIONS.find((m) => m.id === id) ?? null : null;

/**
 * Gjendja e çdo ndalese.
 *
 * Dy rregulla bashkë:
 *   1. Radha — e tanishmja është ndalesa e parë e papërfunduar; ato pas saj
 *      mbeten të kyçura, përndryshe rrugëtimi do të ishte thjesht një listë.
 *   2. NJË NDALESË NË DITË — nëse sot është kryer një ndalesë, e radhës nuk
 *      hapet deri nesër. Kjo është vetë kuptimi i një programi 7-ditor: pa të,
 *      ai mbaron brenda një mbrëmjeje dhe ritmi i përditshëm zhduket.
 *
 * @param {Record<number,string>|number[]} completions ditët e kryera me datat
 * @param {string} today çelësi lokal i ditës, p.sh. "2026-08-28"
 */
export function journeyStops(program, completions = {}, today = null) {
  const map = normalizeCompletions(completions);
  const done = new Set(Object.keys(map).map(Number));
  const usedToday = today !== null && Object.values(map).some((date) => date === today);

  const stops = programStops(program);
  const next = stops.find((s) => !done.has(s.day))?.day ?? null;

  return stops.map((stop) => {
    if (done.has(stop.day)) return { ...stop, state: STOP.DONE, completedOn: map[stop.day] ?? null };
    if (stop.day !== next) return { ...stop, state: STOP.LOCKED };
    return { ...stop, state: usedToday ? STOP.WAITING : STOP.CURRENT };
  });
}

/** Sa ndalesa janë kryer nga sa gjithsej. */
export function journeyProgress(program, completions = {}) {
  const total = programStops(program).length;
  const done = completedDays(completions).filter((d) => d >= 1 && d <= total).length;
  return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

/**
 * Pikët "Dritë" nga i gjithë progresi.
 *
 * Numërohen nga ditët e ruajtura, jo nga një total i mbajtur veçmas: një
 * numërues i dytë do të shpërputhej me rrugëtimin sapo ndryshonte njëri.
 *
 * @param {Record<string, number[]>} progress
 */
export const lightPoints = (progress = {}) =>
  Object.values(progress).reduce((sum, entry) => sum + completedDays(entry).length, 0) *
  LIGHT_PER_STOP;
