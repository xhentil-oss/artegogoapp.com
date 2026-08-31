import { DAILY_RHYTHM_STEPS } from "../data/greetings.js";

/**
 * RITMI DITOR — tre hapa në ditë (mëngjes, mesditë, mbrëmje).
 *
 * ⚠️  Ruhen te `habits`, me prefiks — jo te një çelës i vetin.
 *
 *     Arsyeja është praktike: tabela `habits` te databaza është e përgjithshme
 *     (`habit_type VARCHAR(60)`), me çelës unik mbi (user_id, date, habit_type),
 *     dhe `PUT /me/habits/:type` e llogarit DATËN te serveri. Pra ritmi merr
 *     falas pikërisht atë që i duhet: një rresht për ditë e për hap, dhe
 *     pamundësinë për të plotësuar ditë të shkuara — kërkesë e seksionit 10.
 *
 *     Një tabelë e re do të kërkonte migrim, endpoint-e dhe të njëjtat rregulla
 *     të rishkruara.
 *
 * Prefiksi i ndan nga gjashtë zakonet e përditshme (ujë, lëvizje…), që numri
 * te rrjeta e zakoneve të mos fryhet nga hapat e ritmit.
 */
const PREFIX = "ritual:";

export const rhythmKey = (stepId) => `${PREFIX}${stepId}`;

/** A i përket ky çelës ritmit ditor? */
export const isRhythmKey = (key) => typeof key === "string" && key.startsWith(PREFIX);

export const STEP_COUNT = DAILY_RHYTHM_STEPS.length;

/** Hapat e kryer për një ditë: `{ morning: true, … }`. */
export function stepsOn(habitsData = {}, dayKey) {
  const day = habitsData[dayKey] ?? {};
  return DAILY_RHYTHM_STEPS.reduce((done, step) => {
    if (day[rhythmKey(step.id)]) done[step.id] = true;
    return done;
  }, {});
}

/** Sa hapa janë kryer atë ditë. */
export const countOn = (habitsData, dayKey) => Object.keys(stepsOn(habitsData, dayKey)).length;

/**
 * Ditët ku janë kryer TË TRE hapat.
 *
 * Vetëm një ditë e plotë numërohet si arritje — kjo është ajo që premton
 * teksti "Plotësoji të tri hapat".
 */
export function fullDays(habitsData = {}) {
  return Object.keys(habitsData)
    .filter((day) => countOn(habitsData, day) === STEP_COUNT)
    .sort();
}

/**
 * Numri i ditës që po jetohet.
 *
 * Ditët e plota të mbaruara + 1 për atë në vazhdim. Kështu një përdorues i ri
 * sheh "dita 1" — siç shihte edhe më parë — por tani numri rritet vërtet, në
 * vend që të mbetet 1 përgjithmonë.
 */
export const dayNumber = (habitsData, todayKey) =>
  fullDays(habitsData).filter((day) => day !== todayKey).length + 1;
