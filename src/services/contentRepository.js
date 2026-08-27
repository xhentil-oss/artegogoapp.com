import { BLOCKS, DAY_PART_INTENTS, PHASES } from "../data/blocks.js";
import { COLLECTIONS } from "../data/collections.js";
import { INTENTIONS } from "../data/intentions.js";
import { FEED, POST_TYPES } from "../data/feed.js";
import { TECHNIQUES } from "../data/techniques.js";
import { CATEGORIES } from "../data/categories.js";
import { REMINDER_SLOTS } from "../data/reminders.js";
import { GREETINGS } from "../data/greetings.js";
import { DAY_PARTS } from "../lib/time.js";
import { SLOT_POOLS } from "../data/slotPools.js";
import { SERIES, PROGRAMS, SHORTS, SOUNDSCAPES, LIVE_SESSIONS } from "../data/catalog.js";
import { LIFE_AREAS, ALL_AREAS } from "../data/lifeAreas.js";
import { adminState } from "./adminStore.js";
import {
  MEDITATIONS,
  listTechniques,
  listCategories,
  emptyCategories,
  techniqueFolder,
  categoryFolder,
  unclassified,
  listSubGroups,
} from "../domain/classification.js";

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

/* ---------- përshëndetja dhe citati ---------- */
export const greetingFor = (part) => GREETINGS[part] ?? GREETINGS[DAY_PARTS.MORNING];

/**
 * Citati i ditës për një pjesë të ditës.
 *
 * Specifikimi e quan "të rastësishëm", por zgjedhja lidhet me datën, jo me
 * `Math.random()`: përndryshe citati do të ndryshonte në çdo rivizatim të
 * ekranit, dhe dy ekrane që e tregojnë të njëjtin çast do të shfaqnin dy
 * citate të ndryshme njëkohësisht.
 */
export const quoteOfDay = (part, date = new Date()) => {
  const { quotes } = greetingFor(part);
  return quotes[date.getDate() % quotes.length];
};

/* ---------- mini-meditime ---------- */
export const listBlocks = () => BLOCKS;

export const blockById = (id) => BLOCKS.find((b) => b.id === id);

/**
 * Gjen një meditim nga ID, kudo qoftë: mes 15 mini-meditimeve të ndërtuesit
 * ose mes 244 meditimeve të katalogut. Listat e përdoruesit (të preferuarat,
 * të shkarkuarat) ruajnë vetëm ID, ndaj u duhet ky kërkim i përbashkët.
 */
export const findMeditation = (id) =>
  BLOCKS.find((b) => b.id === id) ?? MEDITATIONS.find((m) => m.id === id) ?? null;

/** Zgjidh një listë ID-sh; ato që nuk gjenden hiqen në heshtje. */
export const findMeditations = (ids = []) => ids.map(findMeditation).filter(Boolean);

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

/**
 * Rreshti "Popullore".
 *
 * Më parë filtronte `b.premium` — flamur që nuk ekziston më (seksioni 8 e
 * zhvendosi rregullin te `domain/access`), ndaj rreshti kishte mbetur bosh.
 * Popullariteti i vërtetë do të vijë nga numri i dëgjimeve te backend-i;
 * deri atëherë merren blloqet kryesore, që rreshti të mos gënjejë me radhë
 * të shpikur.
 */
export const popularBlocks = (limit = 6) =>
  BLOCKS.filter((b) => b.phase === PHASES.CORE).slice(0, limit);

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
export const totalMeditations = () => MEDITATIONS.length;

/* ---------- klasifikimi i dyfishtë ---------- */

/**
 * Dy pamjet mbi TË NJËJTAT meditime — teknika (si bëhet) dhe kategoria
 * (për çfarë qëllimi). Asgjë nuk kopjohet; ndryshon vetëm grupimi.
 * Shih `domain/classification.js`.
 */
export {
  listTechniques,
  listCategories,
  techniqueFolder,
  categoryFolder,
  emptyCategories,
  unclassified,
  listSubGroups,
};

/** Të gjitha meditimet e klasifikuara, si listë e rrafshët. */
export const listMeditations = () => MEDITATIONS;

/**
 * Gjithçka që mund të hyjë në një seancë të ndërtuar me dorë.
 *
 * Ndërtuesi më parë ofronte vetëm 15 mini-blloqet, ndërsa katalogu ka 244
 * meditime të tjera — dhe fusha e kërkimit premtonte "të gjithë katalogun".
 * Të dyja bashkë japin 259 zgjedhje.
 *
 * Blloqet vijnë TË PARAT dhe kjo renditje mban peshë: vetëm ato kanë faza
 * hyrjeje dhe mbylljeje, ndërsa 244 meditimet e katalogut janë të gjitha
 * `Korpi`. Të vendosura në krye, të katër blloqet strukturore mbeten të
 * dukshme pa u dashur asnjë filtër më shumë.
 */
export const listBuilderLibrary = () => [...BLOCKS, ...MEDITATIONS];

/*
 * Listat e plota për panelin e admin-it.
 *
 * Ndryshe nga `listTechniques`/`listCategories`, këtu NUK filtrohen ato pa
 * meditime: admin-i duhet të mund t'i caktojë pikërisht kategoritë bosh —
 * përndryshe një kategori e re nuk do të mbushej dot kurrë.
 */
export const allTechniques = () => TECHNIQUES;
export const allCategories = () => CATEGORIES;

/* ---------- njoftimet ---------- */
export const listReminderSlots = () => REMINDER_SLOTS;
export const defaultPools = () => SLOT_POOLS;

/* ---------- komuniteti ---------- */
export const listPostTypes = () => POST_TYPES;

/* ---------- fushat e jetës ---------- */
export const listLifeAreas = () => LIFE_AREAS;

/** Programet e një fushe jete; `ALL_AREAS` i kthen të gjitha. */
export const programsByLifeArea = (areaId) => {
  const all = listPrograms();
  if (!areaId || areaId === ALL_AREAS) return all;
  const area = LIFE_AREAS.find((a) => a.id === areaId);
  if (!area) return all;
  return all.filter((program) => area.intents.includes(program.intent));
};

/* ---------- vitrina ---------- */
export const listSeries = () => SERIES;
export const listShorts = () => SHORTS;
export const listSoundscapes = () => SOUNDSCAPES;

/*
 * Përmbajtja e krijuar nga paneli i admin-it (seksioni 11) vjen PARA asaj
 * bazë: ajo që sapo u shtua duhet të duket menjëherë, pa u kërkuar.
 * Ekranet nuk e dinë ndryshimin — lexojnë të njëjtin funksion si më parë.
 */
export const listPrograms = () => [...adminState().programs, ...PROGRAMS];
export const listLiveSessions = () => [...adminState().live, ...LIVE_SESSIONS];

/* ---------- komunitet ---------- */
export const listFeed = () => [...adminState().posts, ...FEED];
