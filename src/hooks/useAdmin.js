import { useSyncExternalStore } from "react";
import { adminState, adminVersion, subscribeAdmin } from "../services/adminStore.js";

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
