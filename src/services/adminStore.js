import { storage, STORAGE_KEYS } from "./storage.js";
import { applyClassificationOverrides } from "../domain/classification.js";
import { applyPoolOverrides } from "../domain/dailyPick.js";

/**
 * NDRYSHIMET E ADMIN-IT (seksioni 11).
 *
 * Paneli i admin-it nuk mban të dhëna të vetat: shkruan mbishkrime mbi
 * përmbajtjen bazë, dhe aplikacioni i lexon menjëherë. Kjo është e gjithë
 * poenta — një panel që ndryshon vetëm veten do të ishte teatër.
 *
 * Gjendja rri jashtë React-it, sepse e prekin edhe module që nuk janë
 * komponentë (`domain/classification`, `domain/dailyPick`). Komponentët
 * abonohen me `useSyncExternalStore` përmes `hooks/useAdmin.js`.
 *
 * ⚠️  Ruajtja është lokale, në pajisjen e admin-it. Në aplikacionin e vërtetë
 *     këto shkojnë te backend-i dhe i shohin të gjithë përdoruesit; ky skedar
 *     është pikërisht vendi që do të flasë me API-në e admin-it.
 */

const EMPTY = {
  /** Caktimi teknikë+kategori, sipas nën-grupit: { "col_med/Zemra": {…} } */
  classification: {},
  /** Pool-et e njoftimeve; null do të thotë "si te `data/slotPools.js`". */
  pools: null,
  /** Programe të krijuara nga admin-i. */
  programs: [],
  /** Postime komuniteti, me meditim të bashkangjitur. */
  posts: [],
  /** Transmetime Live të planifikuara. */
  live: [],
  /** Audio dhe kapakë të ngarkuar (metadata). */
  media: [],
};

let state = EMPTY;
let version = 0;
const listeners = new Set();

export const adminState = () => state;

/** Numër që rritet me çdo ndryshim — çelësi i `useSyncExternalStore`. */
export const adminVersion = () => version;

export function subscribeAdmin(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Shkruan gjendjen e re, rindërton të dhënat e prekura dhe njofton. */
function commit(next, persist = true) {
  state = next;
  applyClassificationOverrides(next.classification);
  applyPoolOverrides(next.pools);
  version += 1;
  listeners.forEach((listener) => listener());
  if (persist) storage.set(STORAGE_KEYS.admin, next);
}

/** Lexon ndryshimet e ruajtura. Thirret një herë, në nisje të aplikacionit. */
export async function loadAdminState() {
  const saved = await storage.get(STORAGE_KEYS.admin, null);
  commit({ ...EMPTY, ...(saved ?? {}) }, false);
}

/** Ndryshon një pjesë të gjendjes. `patch` mund të jetë objekt ose funksion. */
export const updateAdmin = (patch) =>
  commit({ ...state, ...(typeof patch === "function" ? patch(state) : patch) });

/** Kthen gjithçka në gjendjen fillestare — të dhënat bazë mbeten të paprekura. */
export const resetAdmin = () => commit(EMPTY);

/* ---------- veprime të emërtuara ---------- */

/** Cakton teknikën dhe/ose kategorinë e një nën-grupi. */
export const setClassification = (key, patch) =>
  updateAdmin((prev) => ({
    classification: { ...prev.classification, [key]: { ...prev.classification[key], ...patch } },
  }));

/** Shton ose heq një nën-grup nga pool-i i një çasti të ditës. */
export const togglePoolEntry = (slotId, key, defaults) =>
  updateAdmin((prev) => {
    const pools = prev.pools ?? defaults;
    const current = pools[slotId] ?? [];
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    return { pools: { ...pools, [slotId]: next } };
  });

/** Shton një element në një listë (programe, postime, live, media). */
export const addTo = (listName, item) =>
  updateAdmin((prev) => ({ [listName]: [item, ...prev[listName]] }));

export const removeFrom = (listName, id) =>
  updateAdmin((prev) => ({ [listName]: prev[listName].filter((entry) => entry.id !== id) }));

export const replaceIn = (listName, id, patch) =>
  updateAdmin((prev) => ({
    [listName]: prev[listName].map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
  }));
