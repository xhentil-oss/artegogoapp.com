import { BLOCKS, PHASES } from "../data/blocks.js";

/**
 * SEKUENCA = lista e mini-meditimeve që luan player-i.
 *
 * Çdo element mban një `uid` unik brenda sesionit, i nevojshëm si React key
 * dhe për të hequr një element nga ndërtuesi kur i njëjti bllok është shtuar
 * dy herë. Numëratori është më i sigurt se `Date.now()`, që përsërisej kur
 * shtoheshin shumë elemente në të njëjtin milisekondë.
 */
let counter = 0;
const nextUid = () => `u${++counter}`;

/** Vesh një bllok me `uid`. */
export const withUid = (block) => ({ ...block, uid: nextUid() });

/** Kthen një bllok ose listë blloqesh në sekuencë të luajtshme. */
export const toSequence = (blockOrList) =>
  (Array.isArray(blockOrList) ? blockOrList : [blockOrList]).map(withUid);

export const totalMinutes = (sequence) => sequence.reduce((sum, b) => sum + b.dur, 0);
export const totalSeconds = (sequence) => totalMinutes(sequence) * 60;

/** Sekondat e kaluara përpara bllokut me indeksin `index`. */
export const secondsBefore = (sequence, index) => totalSeconds(sequence.slice(0, index));

/**
 * Monton një seancë koherente: Hapje → Korpi(qëllimi) → Mbyllje,
 * e prerë sa të hyjë brenda `maxMinutes` (me një tolerancë 5-minutëshe).
 *
 * @param {{ intent: string, maxMinutes: number }} options
 * @returns {object[]} blloqe pa `uid` — kaloji nga `toSequence()`.
 */
export function buildGuidedSequence({ intent, maxMinutes }) {
  const opening = BLOCKS.find((b) => b.phase === PHASES.OPENING);
  const closing = BLOCKS.find((b) => b.phase === PHASES.CLOSING);
  const core = BLOCKS.filter((b) => b.intent === intent && b.phase === PHASES.CORE);

  const full = [opening, ...core, closing].filter(Boolean);

  let elapsed = 0;
  const trimmed = full.filter((b) => {
    elapsed += b.dur;
    return elapsed <= maxMinutes + 5;
  });

  /* Nën 2 hapa seanca nuk ka kuptim — kthe një minimum të përdorshëm. */
  return trimmed.length >= 2 ? trimmed : full.slice(0, 3);
}

/** Zhvendos një element brenda sekuencës (drag & drop në ndërtues). */
export function reorder(sequence, from, to) {
  if (from === to || from == null || to == null) return sequence;
  const next = [...sequence];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
