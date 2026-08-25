import { MEDITATIONS } from "./classification.js";
import { SLOT_POOLS } from "../data/slotPools.js";
import { subKey } from "../data/classification.js";

/**
 * MEDITIMI I DITËS PËR ÇDO ÇAST (seksioni 9).
 *
 * Specifikimi kërkon dy gjëra që duken kundërshtuese:
 *   · meditimi të jetë RASTËSOR dhe i RI çdo ditë;
 *   · të jetë I QËNDRUESHËM brenda së njëjtës ditë.
 *
 * `Math.random()` i plotëson vetëm gjysmën: njoftimi do të tregonte një
 * meditim, dhe hapja e aplikacionit një tjetër. Ndaj zgjedhja këtu është
 * *funksion i pastër i ditës* — e njëjta ditë jep gjithmonë të njëjtin
 * meditim, në telefon, në njoftim dhe më vonë te serveri, pa u ruajtur gjë.
 *
 * Nuk zgjidhet me `hash % gjatësi`, sepse ajo lejon të njëjtin meditim dy
 * ditë rresht dhe lë të tjerë pa dalë me muaj. Në vend të saj pool-i
 * përzihet një herë për çdo cikël dhe kalohet i tëri: brenda një cikli çdo
 * meditim del saktësisht një herë, pastaj cikli i ri përzihet ndryshe.
 */

/**
 * Pool-et e materializuara.
 *
 * Rindërtohen kur admin-i i ndryshon (seksioni 11). Pa këtë, një pool i
 * redaktuar do të prekte vetëm panelin, ndërsa njoftimi do të vazhdonte të
 * nxirrte meditime nga lista e vjetër.
 */
let POOLS = {};

/** @param {Record<string, string[]>|null} overrides null = pool-et e parazgjedhur */
export function applyPoolOverrides(overrides) {
  const source = overrides ?? SLOT_POOLS;
  POOLS = Object.fromEntries(
    Object.keys(SLOT_POOLS).map((slotId) => {
      const wanted = new Set(source[slotId] ?? []);
      return [slotId, MEDITATIONS.filter((m) => wanted.has(subKey(m.collectionId, m.subTheme)))];
    })
  );
}

applyPoolOverrides(null);

const DAY_MS = 86400000;
const dayNumber = (key) => Math.floor(Date.parse(`${key}T00:00:00Z`) / DAY_MS);

/** Hash i qëndrueshëm i një vargu — FNV-1a, 32-bitësh. */
function hash(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Gjenerues numrash pseudo-rastësorë me farë — mulberry32. */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates me farë: e njëjta farë jep gjithmonë të njëjtën radhë. */
function shuffled(items, seed) {
  const out = [...items];
  const next = rng(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Radha e një cikli.
 *
 * Nëse i pari i këtij cikli është po ai që mbylli ciklin e kaluar, radha
 * rrotullohet me një — përndryshe i njëjti meditim do të vinte dy ditë
 * rresht pikërisht në kufirin e cikleve.
 */
function cycleOrder(pool, slotId, cycle) {
  const order = shuffled(pool, hash(`${slotId}:${cycle}`));
  if (cycle > 0 && pool.length > 1) {
    const previous = shuffled(pool, hash(`${slotId}:${cycle - 1}`));
    if (order[0].id === previous[previous.length - 1].id) order.push(order.shift());
  }
  return order;
}

/** Meditimet që i përkasin një çasti të ditës. */
export const poolFor = (slotId) => POOLS[slotId] ?? [];

/**
 * Meditimi i kësaj dite për këtë çast.
 *
 * @param {string} slotId "morning" | "noon" | "evening"
 * @param {string} dayKey "2026-08-25"
 * @returns {object|null} null vetëm nëse pool-i është bosh
 */
export function pickForSlot(slotId, dayKey) {
  const pool = poolFor(slotId);
  if (pool.length === 0) return null;

  const days = dayNumber(dayKey);
  if (!Number.isFinite(days)) return null;

  /* Modulo në JS kthen negative për data para epokës — normalizohet. */
  const position = ((days % pool.length) + pool.length) % pool.length;
  const cycle = Math.floor(days / pool.length);

  return cycleOrder(pool, slotId, cycle)[position];
}

/** Të tre meditimet e ditës, sipas radhës së çasteve. */
export const picksForDay = (dayKey, slotIds = Object.keys(SLOT_POOLS)) =>
  slotIds.map((slotId) => ({ slotId, meditation: pickForSlot(slotId, dayKey) }));
