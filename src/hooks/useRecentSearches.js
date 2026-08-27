import { useCallback, useEffect, useState } from "react";
import { storage, STORAGE_KEYS } from "../services/storage.js";

/** Sa kërkime mbahen. Mbi këtë, lista bëhet mur teksti. */
const MAX_RECENT = 6;

/**
 * KËRKIMET E FUNDIT
 *
 * Më parë ishin një listë e ngurtësuar — `["Hapje Zemre", "Theta", "Gjumë"]` —
 * që nuk ndryshonte kurrë dhe rilindte në çdo hapje. Përdoruesi shihte një
 * histori që nuk ishte e tija, ndërsa kërkimet e veta zhdukeshin.
 *
 * Tani ruhen vërtet, dhe mbijetojnë rifreskimin.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let cancelled = false;
    storage.get(STORAGE_KEYS.recentSearches, []).then((saved) => {
      if (!cancelled && Array.isArray(saved)) setRecent(saved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const remember = useCallback((rawTerm) => {
    const term = rawTerm.trim();
    if (term.length < 2) return;

    setRecent((prev) => {
      /* Kërkimi i përsëritur ngjitet lart, nuk dyfishohet. Krahasimi pa
         dallim shkronjash: "gjumë" dhe "Gjumë" janë i njëjti kërkim. */
      const without = prev.filter((t) => t.toLowerCase() !== term.toLowerCase());
      const next = [term, ...without].slice(0, MAX_RECENT);
      storage.set(STORAGE_KEYS.recentSearches, next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    storage.remove(STORAGE_KEYS.recentSearches);
  }, []);

  return { recent, remember, clear };
}
