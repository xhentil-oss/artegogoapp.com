import { useEffect, useRef } from "react";

/**
 * `setInterval` që respekton ciklin e jetës së React-it.
 *
 * Kalo `delay = null` për të ndalur. Callback-u i freskët përdoret gjithmonë,
 * pa e rinisur timer-in — kështu numëruesi i player-it nuk kërcen kur
 * ndryshon gjendja përreth.
 */
export function useInterval(callback, delay) {
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || delay === undefined) return undefined;
    const id = setInterval(() => latest.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
