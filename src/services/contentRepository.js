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
import { feedFromServer, liveFromServer, programsFromServer } from "./catalog.js";
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

/**
 * Qëllimet që kanë vërtet përmbajtje sot.
 *
 * ⚠️  Të dhjetat ekzistojnë te taksonomia, por jo të dhjetat kanë meditime.
 *     Një kategori e shfaqur dhe e zbrazët është premtim i thyer: përdoruesi
 *     e hap dhe gjen asgjë. Kërkesë e klientes, 18 nëntor 2026.
 *
 * ⚠️  Kërkohet edhe kopertina, sepse ajo ndan katalogun e vërtetë nga
 *     vendmbajtësit. Nëse asnjë meditim nuk do të kishte kopertinë — p.sh.
 *     katalogu ende i pangarkuar — kushti zbutet, që lista të mos dalë bosh
 *     dhe aplikacioni të mos duket pa përmbajtje.
 *
 * ⚠️  NUK përdoret te paneli i admin-it: aty duhen të gjitha, përndryshe një
 *     kategori bosh nuk mbushet dot kurrë. Admin-i pyet `listIntentions`.
 */
export const activeIntentions = () => {
  const meKopertine = new Set(MEDITATIONS.filter((m) => m.cover).map((m) => m.intent));
  const meCfaredo = new Set(MEDITATIONS.map((m) => m.intent));
  const burimi = meKopertine.size > 0 ? meKopertine : meCfaredo;

  const gjetur = INTENTIONS.filter((i) => burimi.has(i.id));
  /* Katalogu i pangarkuar — më mirë të gjitha sesa asnjë. */
  return gjetur.length > 0 ? gjetur : INTENTIONS;
};

/* ---------- përshëndetja dhe citati ---------- */
export const greetingFor = (part) => GREETINGS[part] ?? GREETINGS[DAY_PARTS.MORNING];

/**
 * Dita e vitit (1–366), e llogaritur me pjesë LOKALE datash.
 *
 * ⚠️  Zbritja bëhet mes dy çastesh UTC të ndërtuara nga viti/muaji/dita
 *     lokale. Një zbritje e drejtpërdrejtë mes dy `Date`-ve lokale do të jepte
 *     23 ose 25 orë te ditët kur ndërron ora verore, dhe `Math.floor` do ta
 *     kthente numrin e ditës një ditë prapa — pikërisht dy herë në vit,
 *     pa asnjë shenjë.
 */
const dayOfYear = (date) => {
  const fillimi = Date.UTC(date.getFullYear(), 0, 1);
  const sot = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((sot - fillimi) / 86400000);
};

/**
 * Citati i ditës për një pjesë të ditës.
 *
 * Specifikimi e quan "të rastësishëm", por zgjedhja lidhet me datën, jo me
 * `Math.random()`: përndryshe citati do të ndryshonte në çdo rivizatim të
 * ekranit, dhe dy ekrane që e tregojnë të njëjtin çast do të shfaqnin dy
 * citate të ndryshme njëkohësisht.
 *
 * ⚠️  DITA E VITIT, jo dita e muajit. Me `getDate()` numri rinis nga 1 çdo
 *     muaj: me tri citate përsëritej çdo tri ditë, dhe me tridhjetë do të
 *     kërcente nga i 31-ti te i pari duke anashkaluar rrotullimin e njëtrajtshëm.
 *     Me ditën e vitit, lista rrotullohet pa ndërprerje nga 1 janari deri më 31
 *     dhjetor — pra një muaj i plotë pa përsëritje për çdo pjesë të ditës.
 */
export const quoteOfDay = (part, date = new Date()) => {
  const { quotes } = greetingFor(part);
  return quotes[dayOfYear(date) % quotes.length];
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

/**
 * Meditimi i ditës për një hap të ritmit ditor.
 *
 * ⚠️  NUK merret nga `BLOCKS`. Ritmi ditor lexonte prej tyre, dhe ata janë
 *     vendmbajtës: pa zë dhe pa kopertinë (shih `listBuilderLibrary`). Pra
 *     tre hapat e ditës hapnin tone demo mbi një kartë bosh, ndërsa katalogu
 *     ishte plot. Kërkesë e klientes, 18 nëntor 2026.
 *
 * ⚠️  NDRYSHON ME DITËN, me qëllim. Një "ritëm ditor" që jep të njëjtat tre
 *     meditime për 365 ditë nuk është ritëm, është listë. Dita e ciklit
 *     (`rhythmDay`) e zhvendos zgjedhjen me një hap — pra radha përsëritet
 *     vetëm kur të mbarojnë të gjitha meditimet e atij qëllimi.
 *
 * @param {string} intent qëllimi i hapit (`energy`, `calm`, `sleep`…)
 * @param {number} day dita e ritmit, duke nisur nga 1
 * @returns {object|null} meditimi, ose `null` kur nuk ka asgjë për atë qëllim
 */
export const rhythmPick = (intent, day = 1) => {
  const tePerQellimin = MEDITATIONS.filter((m) => m.intent === intent);

  /* Kopertina kërkohet, por nuk është kusht shkatërrues: po të mos kishte
     asnjë me foto, më mirë një meditim i vërtetë pa kopertinë sesa asgjë. */
  const meKopertine = tePerQellimin.filter((m) => m.cover);
  const burimi = meKopertine.length > 0 ? meKopertine : tePerQellimin;

  /* Katalogu ende i pangarkuar — rreshti kthehet te bllok, si më parë. */
  if (burimi.length === 0) return blocksByIntent(intent)[0] ?? null;

  /* `% length` dy herë: `day` vjen nga serveri dhe një vlerë e papritur
     negative do të jepte indeks jashtë listës. */
  const i = (((day - 1) % burimi.length) + burimi.length) % burimi.length;
  return burimi[i];
};

/**
 * Gjithçka e një qëllimi — për ekranin e kategorisë.
 *
 * Lexon TË GJITHË bibliotekën, jo vetëm 15 mini-blloqet. Më parë filtronte
 * `BLOCKS`, ndaj "Qetësim" jepte 3 meditime në vend të 22, dhe "Energji" 1
 * në vend të 41 — ekrani dukej bosh ndërsa katalogu ishte plot.
 *
 * Ndryshe nga `blocksByIntent`, që mbetet mbi blloqet sepse ushqen ritmin
 * ditor dhe të shkurtrat, ku duhet një njësi e shkurtër e luajtshme.
 */
export const blocksForCategory = (intent) => {
  /*
   * ⚠️  PA RËNIE TE `BLOCKS`. Më parë një kategori bosh mbushej me katër
   *     vendmbajtës — pa zë dhe pa kopertinë — vetëm që ekrani të mos dukej
   *     bosh. Tani kategoritë bosh nuk shfaqen fare (`activeIntentions`),
   *     ndaj kjo rrugë nuk arrihet; dhe po të arrihet, bosh është e vërteta.
   */
  return listBuilderLibrary().filter((item) => item.intent === intent);
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
 * ⚠️  VETËM KATALOGU. Mini-blloqet (`BLOCKS`) u hoqën nga ndërtuesi me kërkesë
 *     të klientes (16 nëntor 2026): ato janë vendmbajtës — asnjëri nuk ka as
 *     zë as kopertinë, ndaj një seancë e ndërtuar prej tyre luante tone demo
 *     dhe kartat dilnin pa foto. Rrinin të parat te lista, pra ishin pikërisht
 *     ajo që shihej e para.
 *
 *     Të 69 meditimet e katalogut, përkundrazi, i kanë të dyja — e provuar nga
 *     jashtë po atë ditë: 69 skedarë te `/meditime/` dhe 69 kopertina që
 *     hapen, një për secilin.
 *
 *     Blloqet NUK u fshinë: `BLOCKS` mbetet, sepse seancat e ruajtura më parë
 *     u referohen me id dhe `buildGuidedSequence` merr prej tyre hapjen e
 *     mbylljen. Kur të marrin zë e kopertinë, kthimi është ky rresht.
 *
 *     Vendmbajtësit e njëjtë dalin ende te rekomandimet e ditës
 *     (`blocksForDayPart`) — ajo rrugë nuk u prek këtu.
 */
export const listBuilderLibrary = () => [...MEDITATIONS];

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

/**
 * Meditimet e një serie, sipas titujve të shkruar te `data/catalog.js`.
 *
 * ⚠️  Krahasimi bëhet pa hapësira anash dhe pa dallim shkronje të madhe/vogël
 *     — njësoj si te `domain/journey.js`. Lista shkruhet me dorë, dhe një
 *     hapësirë e tepërt nuk duhet ta zbrazë seancën.
 *
 * ⚠️  Titujt që nuk gjenden thjesht hiqen. Para se katalogu të lexohet nga
 *     serveri, `MEDITATIONS` mban vetëm fallback-un lokal — i cili nuk i ka
 *     këta tituj — dhe kthehet listë bosh. Thirrësi e trajton atë rast; një
 *     `null` në mes të sekuencës do ta rrëzonte player-in.
 */
export const seriesTracks = (series) => {
  const titles = series?.titles ?? [];
  const byTitle = new Map(
    MEDITATIONS.map((m) => [(m.title ?? "").trim().toLowerCase(), m])
  );
  return titles
    .map((title) => byTitle.get(title.trim().toLowerCase()))
    .filter(Boolean);
};
export const listShorts = () => SHORTS;
export const listSoundscapes = () => SOUNDSCAPES;

/*
 * Përmbajtja e krijuar nga paneli i admin-it (seksioni 11) vjen PARA asaj
 * bazë: ajo që sapo u shtua duhet të duket menjëherë, pa u kërkuar.
 * Ekranet nuk e dinë ndryshimin — lexojnë të njëjtin funksion si më parë.
 */
/**
 * Programet.
 *
 * ⚠️  Rendi: admin-i i pari, pastaj serveri, dhe `PROGRAMS` lokale VETËM kur
 *     serveri nuk u lexua. Nëse do të bashkoheshin të gjitha, çdo program do
 *     të shfaqej dy herë — një herë me id të databazës dhe një herë me `p1`.
 *     Dublikatat do të ishin të padallueshme në ekran, por rrugëtimi do të
 *     ruante progres në dy vende.
 */
export const listPrograms = () => [
  ...adminState().programs,
  ...(programsFromServer() ?? PROGRAMS),
];
/**
 * Sesionet live.
 *
 * ⚠️  Serveri është burimi kur përgjigjet — edhe kur kthen listë bosh nuk ka
 *     rëndësi, sepse migrimi `16_live.sql` i mbjell të treja. `LIVE_SESSIONS`
 *     lokale mbeten fallback vetëm kur serveri nuk lexohet fare; përndryshe
 *     i njëjti sesion do të dukej dy herë — një herë me id të databazës dhe
 *     një herë me `l1`, njëri me link e tjetri pa të.
 */
export const listLiveSessions = () => {
  const server = liveFromServer();
  if (server && server.length > 0) return server;
  return [...adminState().live, ...LIVE_SESSIONS];
};

/* ---------- komunitet ---------- */
/**
 * Feed-i i komunitetit.
 *
 * ⚠️  Postimet lokale të panelit vijnë të parat vetëm sa nuk kanë mbërritur ende
 *     te serveri; sapo serveri përgjigjet, ai është lista. `FEED` mbetet
 *     fallback offline. Bashkimi i të treve do të tregonte të njëjtin postim dy
 *     herë — një herë me id lokale, një herë me atë të databazës.
 */
export const listFeed = () => {
  const server = feedFromServer();
  if (server) return [...adminState().posts.filter((p) => p.pending), ...server];
  return [...adminState().posts, ...FEED];
};
