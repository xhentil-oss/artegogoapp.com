import { useCallback, useMemo } from "react";
import { STORAGE_KEYS } from "../../services/storage.js";
import { blocksByIds } from "../../services/contentRepository.js";
import { usePersistentMap } from "../../hooks/usePersistentMap.js";

/**
 * Seancat e ndërtuara nga përdoruesi, të ruajtura me emër.
 *
 * Ruhen vetëm ID-të e blloqeve, jo kopje të tyre: kur një meditim ndryshon
 * titull ose kohëzgjatje, seancat e ruajtura e marrin ndryshimin vetë, në
 * vend që të mbeten me të dhëna të vjetruara.
 *
 * Deri sa të vijë backend-i, jetojnë vetëm në këtë pajisje.
 */
export function useSavedSessions() {
  const { data, update } = usePersistentMap(STORAGE_KEYS.customSessions);

  /** Më e reja e para, me blloqet e zgjidhura dhe boshet e hequra. */
  const sessions = useMemo(
    () =>
      Object.values(data)
        .map((session) => ({ ...session, blocks: blocksByIds(session.blockIds) }))
        .filter((session) => session.blocks.length > 0)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data]
  );

  const save = useCallback(
    (name, blocks) => {
      const trimmed = name.trim();
      if (!trimmed || blocks.length === 0) return null;

      const id = `s${Date.now()}`;
      update((prev) => ({
        ...prev,
        [id]: {
          id,
          name: trimmed,
          blockIds: blocks.map((b) => b.id),
          createdAt: new Date().toISOString(),
        },
      }));
      return id;
    },
    [update]
  );

  const remove = useCallback(
    (id) =>
      update((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [update]
  );

  return { sessions, save, remove };
}
