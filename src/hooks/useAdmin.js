import { useSyncExternalStore } from "react";
import { adminState, adminVersion, subscribeAdmin, adminSync } from "../services/adminStore.js";

/**
 * Abonim te ndryshimet e admin-it.
 *
 * `useSyncExternalStore` përdoret sepse gjendja jeton jashtë React-it — e
 * prekin edhe module që nuk janë komponentë. Snapshot-i është një numër
 * versioni, jo vetë objekti: kështu krahasimi mbetet i lirë dhe nuk ka rrezik
 * cikli nga një objekt që rikrijohet në çdo lexim.
 */
export function useAdminVersion() {
  return useSyncExternalStore(subscribeAdmin, adminVersion, adminVersion);
}

/** Gjendja e admin-it, e rifreskuar sa herë ndryshon. */
export function useAdminState() {
  useAdminVersion();
  return adminState();
}

/**
 * Gjendja e ruajtjes te databaza.
 *
 * ⚠️  Ndahet nga `useAdminState` sepse ndryshon me ritëm tjetër: gjendja e
 *     panelit ndryshon me çdo klikim, ndërsa kjo vetëm kur mbërrin përgjigjja e
 *     serverit. Pa të, një shkrim i dështuar mbetet i padukshëm — dhe klientja
 *     do të mendonte se biblioteka u riorganizua kur asgjë nuk u ruajt.
 */
export function useAdminSync() {
  useAdminVersion();
  return adminSync();
}
