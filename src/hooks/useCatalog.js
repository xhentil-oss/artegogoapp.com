import { useSyncExternalStore } from "react";
import { catalogVersion, catalogResult, subscribeCatalog } from "../services/catalog.js";

/**
 * Abonim te ndryshimet e katalogut — i njëjti model si `useAdminVersion`.
 *
 * Snapshot-i është një numër versioni, jo vetë përmbajtja: kështu krahasimi
 * mbetet i lirë, dhe një varg që rikrijohet në çdo lexim nuk shkakton cikël.
 *
 * ⚠️  PA KËTË, një katalog që mbërrin PAS render-it të parë nuk shihet nga
 *     asnjë ekran. Përmbajtja shkon te vargje moduli që lexohen sinkron, ndaj
 *     biblioteka mbetej me përmbajtjen lokale — me më pak kategori — derisa
 *     faqja rifreskohej me dorë.
 */
export function useCatalogVersion() {
  return useSyncExternalStore(subscribeCatalog, catalogVersion, catalogVersion);
}

/** Rezultati i mbushjes së fundit, i rifreskuar sa herë ndryshon. */
export function useCatalogResult() {
  useCatalogVersion();
  return catalogResult();
}
