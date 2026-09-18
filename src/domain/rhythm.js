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
 * Ditët që numërohen për ritmin: ato me TË PAKTËN NJË hap të kryer.
 *
 * ⚠️  Më parë kërkoheshin të TRE hapat. Rregulli u ndryshua me kërkesë të
 *     klientes (18 shtator 2026): mëngjesi, dreka OSE darka — një i vetëm —
 *     e bën ditën të vlefshme.
 *
 *     Ndryshimi qëndron edhe në vetvete. Me rregullin e vjetër, kush meditonte
 *     çdo mëngjes për një muaj rrinte përgjithmonë te "dita 1": i vetmi numër
 *     që e mat ritmin nuk lëvizte kurrë, ndërsa praktika ishte e përditshme.
 *     Tre hapat mbeten ideali i ditës, jo pragu i saj.
 *
 * Pamja nuk ndryshon: unaza vazhdon të tregojë "hapi N nga 3", sepse dita me
 * të tre hapat mbetet e mundshme dhe e dukshme — thjesht nuk kërkohet më.
 */
export function practiceDays(habitsData = {}) {
  return Object.keys(habitsData)
    .filter((day) => countOn(habitsData, day) > 0)
    .sort();
}

/**
 * Numri i ditës që po jetohet.
 *
 * Ditët e praktikuara të mbaruara + 1 për atë në vazhdim. Kështu një përdorues
 * i ri sheh "dita 1", dhe dita e nesërme bëhet "dita 2" nëse sot u krye qoftë
 * edhe një hap i vetëm.
 *
 * ⚠️  E sotmja PËRJASHTOHET nga numërimi me qëllim: ajo është dita që po
 *     jetohet, jo një e mbaruar. Pa këtë, unaza do të kërcente nga 1 në 2
 *     sapo të mbaronte meditimi i mëngjesit — pra dita do të ndërrohej nën sy
 *     ndërsa ti je ende brenda saj.
 */
export const dayNumber = (habitsData, todayKey) =>
  practiceDays(habitsData).filter((day) => day !== todayKey).length + 1;
