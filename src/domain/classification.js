import { COLLECTIONS } from "../data/collections.js";
import { TECHNIQUES } from "../data/techniques.js";
import { CATEGORIES } from "../data/categories.js";
import { SUB2TECH, SUB2CAT, subKey } from "../data/classification.js";

/**
 * KLASIFIKIMI I DYFISHTË
 *
 * Rregulli qendror i specifikimit: çdo meditim ka NJË teknikë dhe NJË
 * kategori, dhe shfaqet në të dyja pamjet — **nuk kopjohet, thjesht
 * filtrohet ndryshe**.
 *
 * Prandaj ekziston vetëm një listë e rrafshët; të dyja pamjet ndërtohen mbi
 * të. Nëse meditimet do të mbaheshin dy herë, numrat do të dilnin nga
 * sinkroni sapo të ndryshonte njëra kopje.
 */

const techniqueById = new Map(TECHNIQUES.map((t) => [t.id, t]));
const categoryById = new Map(CATEGORIES.map((c) => [c.id, c]));

/** Meditimet pa etiketa — baza që nuk ndryshon kurrë. */
const BASE = COLLECTIONS.flatMap((collection) =>
  collection.groups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      /* nën-tema ruhet: është burimi i caktimit dhe ndihmon kur klienti
         të japë caktimin përfundimtar */
      subTheme: group.name,
      collectionId: collection.id,
    }))
  )
);

/**
 * Lista e vetme e vërtetë: çdo meditim një herë, me të dyja etiketat.
 *
 * Përmbajtja rishkruhet nga `applyClassificationOverrides` kur admin-i
 * ndryshon caktimin. Vetë vargu mbetet i njëjti objekt me qëllim: kështu
 * asnjë modul nuk ka nevojë ta rimarrë referencën, dhe `contentRepository`
 * mbetet i vetmi kufi që ekranet njohin.
 */
export const MEDITATIONS = [...BASE];

/** Meditimet pa etiketë — shenjë se hartat kanë mbetur pas të dhënave. */
export const unclassified = () =>
  MEDITATIONS.filter((m) => !m.techniqueId || !m.categoryId);

const countBy = (key) =>
  MEDITATIONS.reduce((tally, m) => {
    const id = m[key];
    if (id) tally.set(id, (tally.get(id) ?? 0) + 1);
    return tally;
  }, new Map());

let techniqueCounts = new Map();
let categoryCounts = new Map();

/**
 * Rindërton etiketat, duke i dhënë përparësi caktimit të admin-it.
 *
 * `data/classification.js` mban caktimin automatik të prototipit; paneli i
 * admin-it (seksioni 11) e mbishkruan atë nën-grup për nën-grup. Numëruesit
 * rillogariten këtu, sepse ndryshimi i një teknike zhvendos edhe numrat e
 * folderave — po të mos rillogariteshin, folderi do të tregonte "9 meditime"
 * dhe brenda do të kishte 8.
 *
 * @param {Record<string, {techniqueId?: string, categoryId?: string}>} overrides
 */
export function applyClassificationOverrides(overrides = {}) {
  BASE.forEach((item, i) => {
    const key = subKey(item.collectionId, item.subTheme);
    const override = overrides[key];
    MEDITATIONS[i] = {
      ...item,
      techniqueId: override?.techniqueId ?? SUB2TECH[key],
      categoryId: override?.categoryId ?? SUB2CAT[key],
    };
  });

  techniqueCounts = countBy("techniqueId");
  categoryCounts = countBy("categoryId");
}

/* Ndërtimi fillestar — pa mbishkrime, pra caktimi i prototipit. */
applyClassificationOverrides();

/** Çelësat e nën-grupeve, për panelin e admin-it. */
export const listSubGroups = () => {
  const seen = new Map();
  MEDITATIONS.forEach((m) => {
    const key = subKey(m.collectionId, m.subTheme);
    if (!seen.has(key)) {
      seen.set(key, {
        key,
        collectionId: m.collectionId,
        subTheme: m.subTheme,
        techniqueId: m.techniqueId,
        categoryId: m.categoryId,
        count: 0,
      });
    }
    seen.get(key).count += 1;
  });
  return [...seen.values()];
};

/** Teknikat me numrin e meditimeve. Ato bosh nuk shfaqen. */
export const listTechniques = () =>
  TECHNIQUES.map((t) => ({ ...t, count: techniqueCounts.get(t.id) ?? 0 })).filter((t) => t.count > 0);

/**
 * Kategoritë me numrin e meditimeve.
 * Specifikimi e kërkon shprehimisht: "Kategoritë bosh NUK shfaqen."
 */
export const listCategories = () =>
  CATEGORIES.map((c) => ({ ...c, count: categoryCounts.get(c.id) ?? 0 })).filter((c) => c.count > 0);

/** Kategoritë pa meditime — të dobishme për raportim, jo për UI. */
export const emptyCategories = () =>
  CATEGORIES.filter((c) => (categoryCounts.get(c.id) ?? 0) === 0);

/** Grupon meditimet sipas një etikete, duke ruajtur rendin e specifikimit. */
function groupBy(items, key, order) {
  const buckets = new Map();
  items.forEach((item) => {
    const id = item[key];
    if (!buckets.has(id)) buckets.set(id, []);
    buckets.get(id).push(item);
  });

  return order
    .filter((entry) => buckets.has(entry.id))
    .map((entry) => ({ name: entry.label, items: buckets.get(entry.id) }));
}

/**
 * PAMJA 1 — hap një teknikë, meditimet brenda grupohen SIPAS KATEGORISË.
 * Kthen të njëjtën formë si një koleksion, që fleta e folderit ta shfaqë
 * pa asnjë ndryshim.
 */
export function techniqueFolder(techniqueId) {
  const technique = techniqueById.get(techniqueId);
  if (!technique) return null;

  const items = MEDITATIONS.filter((m) => m.techniqueId === techniqueId);
  return {
    id: technique.id,
    label: technique.label,
    intent: technique.intent,
    desc: "sipas kategorive",
    groups: groupBy(items, "categoryId", CATEGORIES),
  };
}

/**
 * PAMJA 2 — hap një kategori, meditimet brenda grupohen SIPAS TEKNIKËS.
 */
export function categoryFolder(categoryId) {
  const category = categoryById.get(categoryId);
  if (!category) return null;

  const items = MEDITATIONS.filter((m) => m.categoryId === categoryId);
  return {
    id: category.id,
    label: category.label,
    intent: category.intent,
    desc: "sipas teknikave",
    groups: groupBy(items, "techniqueId", TECHNIQUES),
  };
}
