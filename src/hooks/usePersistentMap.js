import { useCallback, useEffect, useMemo, useState } from "react";
import { storage } from "../services/storage.js";

/**
 * Objekt që ngarkohet nga ruajtja në montim dhe shkruhet në çdo ndryshim.
 *
 * Përdoret nga trackerat (zakone, gjendje emocionale), ku forma e të dhënave
 * është `{ "2026-08-24": … }`.
 *
 * @param {string} storageKey çelësi në `services/storage`
 * @returns {{ data: object, ready: boolean, update: (fn: (prev: object) => object) => void }}
 */
export function usePersistentMap(storageKey) {
  const [data, setData] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    storage.get(storageKey, {}).then((stored) => {
      if (cancelled) return;
      setData(stored ?? {});
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const update = useCallback(
    (producer) => {
      setData((prev) => {
        const next = producer(prev);
        storage.set(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  /* identitet i stabilizuar — përndryshe çdo konsumator do të rikrijonte
     callback-et e vet në çdo render */
  return useMemo(() => ({ data, ready, update }), [data, ready, update]);
}
