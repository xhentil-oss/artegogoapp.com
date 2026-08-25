import { BLOCKS, DAY_PART_INTENTS, PHASES } from "../data/blocks.js";
import { COLLECTIONS } from "../data/collections.js";
import { INTENTIONS } from "../data/intentions.js";
import { FEED } from "../data/feed.js";
import { SERIES, PROGRAMS, SHORTS, SOUNDSCAPES, LIVE_SESSIONS } from "../data/catalog.js";
import { PRACTICES } from "../data/practices.js";
import { LIFE_AREAS, ALL_AREAS } from "../data/lifeAreas.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  KUFIRI ME BACKEND-IN
 * ═══════════════════════════════════════════════════════════════
 *
 * Çdo ekran lexon përmbajtje VETËM përmes këtij skedari — nuk importon
 * kurrë `data/*` drejtpërdrejt. Kur vjen API-ja, ndryshohen vetëm trupat
 * e funksioneve poshtë (dhe shtohet `await`); komponentët mbeten të njëjtë.
 *
 * Kalimi në async, kur të vijë momenti:
 *   1. kthe `Promise` nga funksionet këtu
 *   2. shto `hooks/useResource.js` që mban { data, loading, error }
 *   3. ekranet kalojnë nga `listBlocks()` në `useResource(listBlocks)`
 */

/* ---------- qëllime ---------- */
export const listIntentions = () => INTENTIONS;

/* ---------- mini-meditime ---------- */
export const listBlocks = () => BLOCKS;

export const blockById = (id) => BLOCKS.find((b) => b.id === id);

/** Zgjidh një listë id-sh në blloqe; id-të e panjohura hiqen. */
export const blocksByIds = (ids = []) => ids.map(blockById).filter(Boolean);

export const blocksByIntent = (intent) => BLOCKS.filter((b) => b.intent === intent);

/** Blloqet e një qëllimi, me fallback që lista të mos jetë kurrë boshe. */
export const blocksForCategory = (intent) => {
  const matches = blocksByIntent(intent);
  return matches.length > 0 ? matches : BLOCKS.slice(0, 4);
};

/** Rekomandimet sipas pjesës së ditës (`lib/time.js` → `dayPart()`). */
export const blocksForDayPart = (part) => {
  const intents = DAY_PART_INTENTS[part] ?? [];
  const matches = BLOCKS.filter((b) => intents.includes(b.intent));
  return matches.length >= 3 ? matches : BLOCKS.slice(0, 4);
};

export const popularBlocks = (limit = 6) => BLOCKS.filter((b) => b.premium).slice(0, limit);

/** Blloqet hyrëse të një programi — deri në `limit` hapa. */
export const blocksForProgram = (program, limit = 3) =>
  blocksByIntent(program.intent).slice(0, limit);

export const coreBlocksByIntent = (intent) =>
  BLOCKS.filter((b) => b.intent === intent && b.phase === PHASES.CORE);

/* ---------- koleksione (foldera) ---------- */
export const listCollections = () => COLLECTIONS;

export const collectionById = (id) => COLLECTIONS.find((c) => c.id === id);

/** Të gjitha meditimet e një koleksioni, të rrafshuara nga nën-grupet. */
export const collectionItems = (collection) => collection.groups.flatMap((g) => g.items);

export const collectionSize = (collection) => collectionItems(collection).length;

/** Numri i të gjitha meditimeve në bibliotekë — i llogaritur, jo i shkruar. */
export const totalMeditations = () =>
  COLLECTIONS.reduce((sum, collection) => sum + collectionSize(collection), 0);

/* ---------- praktikat (modalitetet) ---------- */

/**
 * Tetë modalitetet e praktikës, secili me koleksionin dhe numrin e vet.
 * Praktikat pa koleksion përkatës hiqen — lista nuk mund të prodhojë
 * një kartelë që nuk hapet.
 */
export const listPractices = () =>
  PRACTICES.map((practice) => {
    const collection = collectionById(practice.collectionId);
    return collection ? { ...practice, collection, count: collectionSize(collection) } : null;
  }).filter(Boolean);

/* ---------- fushat e jetës ---------- */
export const listLifeAreas = () => LIFE_AREAS;

/** Programet e një fushe jete; `ALL_AREAS` i kthen të gjitha. */
export const programsByLifeArea = (areaId) => {
  if (!areaId || areaId === ALL_AREAS) return PROGRAMS;
  const area = LIFE_AREAS.find((a) => a.id === areaId);
  if (!area) return PROGRAMS;
  return PROGRAMS.filter((program) => area.intents.includes(program.intent));
};

/* ---------- vitrina ---------- */
export const listSeries = () => SERIES;
export const listPrograms = () => PROGRAMS;
export const listShorts = () => SHORTS;
export const listSoundscapes = () => SOUNDSCAPES;
export const listLiveSessions = () => LIVE_SESSIONS;

/* ---------- komunitet ---------- */
export const listFeed = () => FEED;
