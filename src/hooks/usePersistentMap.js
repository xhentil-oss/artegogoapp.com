import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { storage } from "../services/storage.js";
import { remoteFor } from "../services/userData.js";

/**
 * Objekt që ngarkohet në montim dhe shkruhet në çdo ndryshim.
 *
 * Forma është `{ "2026-08-24": … }` ose `{ id: … }`, sipas çelësit.
 *
 * ⚠️  KU SHKRUHET: te serveri, nëse çelësi ka barasvlerës aty dhe përdoruesi
 *     ka hyrë (`services/userData.js`). Përndryshe vetëm te `localStorage`.
 *     `localStorage` shkruhet GJITHMONË — si kujtesë e ndërmjetme, që
 *     aplikacioni të hapet edhe pa internet dhe të mos dukët bosh.
 *
 * @param {string} storageKey çelësi në `services/storage`
 * @returns {{ data: object, ready: boolean, syncing: boolean, error: string|null,
 *             update: (fn: (prev: object) => object) => void }}
 */
export function usePersistentMap(storageKey) {
  const [data, setData] = useState({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Gjendja mbahet edhe te një ref.
   *
   * ⚠️  Përndryshe shkrimi do të duhej të ndodhte brenda prodhuesit të
   *     `setState` — dhe React-i nën `StrictMode` e thërret atë DY HERË. Për
   *     `localStorage` kjo ishte e padëmshme, sepse shkrimi i dytë ishte i
   *     njëjtë. Për serverin nuk është: `POST /me/sessions` do të regjistronte
   *     dy seanca për një të vetme, dhe streak-u do të fryhej pa asnjë shenjë.
   */
  const ref = useRef({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      /* Kujtesa lokale shfaqet e para — ekrani nuk pret rrjetin. */
      const cached = (await storage.get(storageKey, {})) ?? {};
      if (!cancelled) {
        ref.current = cached;
        setData(cached);
        setReady(true);
      }

      const remote = remoteFor(storageKey);
      if (!remote || cancelled) return;

      try {
        const fresh = await remote.load();
        if (cancelled) return;
        /* Serveri fiton: shih shënimin te `services/userData.js`. */
        ref.current = fresh;
        setData(fresh);
        setError(null);
        storage.set(storageKey, fresh);
      } catch (err) {
        if (!cancelled) setError(err?.message ?? "Nuk u lexuan të dhënat.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const update = useCallback(
    (producer) => {
      const prev = ref.current;
      const next = producer(prev);
      if (next === prev) return;

      ref.current = next;
      setData(next);
      storage.set(storageKey, next);

      const remote = remoteFor(storageKey);
      if (!remote) return;

      remote.write(prev, next).then(
        () => setError(null),
        (err) => {
          /*
           * Dështimi NUK e kthen ndryshimin mbrapsht.
           *
           * Përdoruesi sapo shënoi një zakon; ta zhbëje nën gishtin e tij do
           * të ishte më keq se ta mbaje. Ndryshimi rri te `localStorage` dhe
           * shfaqet; te serveri do të shkojë kur `load()` të bëhet dydrejtimësh.
           * Deri atëherë kjo mbetet mangësi e ditur, jo e fshehur.
           */
          setError(err?.message ?? "Ndryshimi nuk u ruajt te serveri.");
          console.warn(`[artegogo] ${storageKey} nuk u sinkronizua:`, err?.message);
        }
      );
    },
    [storageKey]
  );

  /* identitet i stabilizuar — përndryshe çdo konsumator do të rikrijonte
     callback-et e vet në çdo render */
  return useMemo(() => ({ data, ready, error, update }), [data, ready, error, update]);
}
