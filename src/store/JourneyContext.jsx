import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage, STORAGE_KEYS } from "../services/storage.js";
import {
  journeyProgress,
  journeyStops,
  lightPoints,
  normalizeCompletions,
} from "../domain/journey.js";
import { localDayKey } from "../lib/time.js";
import { listPrograms } from "../services/contentRepository.js";

/**
 * RRUGËTIMI AKTIV DHE PROGRESI I PROGRAMEVE (seksioni 6.5)
 *
 * Ruhen dy gjëra:
 *   · `activeId`  — cili program është rrugëtimi i tanishëm
 *   · `progress`  — ditët e kryera, VEÇMAS për çdo program
 *
 * Ndarja për program është kërkesë e specifikimit dhe ka kuptim praktik: kush
 * nis "Mistik Zemër" dhe pastaj "Transformim" nuk duhet ta humbë të parin.
 * Butoni "Ndrysho" thjesht ndërron `activeId`; asnjë progres nuk fshihet.
 */
const JourneyContext = createContext(null);

const EMPTY = { activeId: null, progress: {} };

export function JourneyProvider({ children }) {
  const [state, setState] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    storage.get(STORAGE_KEYS.journey, EMPTY).then((saved) => {
      if (cancelled) return;
      setState({ ...EMPTY, ...(saved ?? {}) });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback((next) => {
    setState(next);
    storage.set(STORAGE_KEYS.journey, next);
  }, []);

  /** Nis një program ose e bën atë rrugëtimin aktiv. Progresi i vjetër mbetet. */
  const startProgram = useCallback(
    (programId) =>
      commit({
        activeId: programId,
        progress: {
          ...state.progress,
          [programId]: normalizeCompletions(state.progress[programId]),
        },
      }),
    [commit, state.progress]
  );

  /**
   * Shënon një ditë si të kryer, bashkë me DATËN.
   *
   * Data ruhet sepse rregulli "një ndalesë në ditë" nuk mund të zbatohet pa
   * të: pa datë nuk dihet nëse ndalesa e fundit u krye sot apo javën e kaluar.
   *
   * Ndalesa e kryer nuk rishkruhet: përfundimi i së njëjtës ditë dy herë nuk
   * duhet të japë 30 pikë Dritë, as ta zhvendosë datën përpara.
   */
  const completeDay = useCallback(
    (programId, day) => {
      if (!programId || !day) return;

      const current = normalizeCompletions(state.progress[programId]);
      if (current[day] !== undefined) return;

      commit({
        activeId: state.activeId ?? programId,
        progress: {
          ...state.progress,
          [programId]: { ...current, [day]: localDayKey() },
        },
      });
    },
    [commit, state.activeId, state.progress]
  );

  /** VETËM PËR DEMONSTRIM: pastron rrugëtimet. */
  const resetJourneys = useCallback(() => commit(EMPTY), [commit]);

  const programs = listPrograms();
  const active = programs.find((p) => p.id === state.activeId) ?? null;

  const value = useMemo(() => {
    /* Brenda `useMemo`: një varg i rikrijuar jashtë tij do ta bënte këtë
       memo të pavlefshme në çdo render. */
    const activeDays = state.progress[state.activeId] ?? {};
    /* Dita lokale llogaritet një herë për render — të gjitha ndalesat duhet
       ta krahasojnë veten me të njëjtin "sot". */
    const today = localDayKey();

    return {
      ready,
      activeId: state.activeId,
      activeProgram: active,
      progress: state.progress,

      /** Ndalesat e rrugëtimit aktiv, me gjendjet done/current/locked. */
      stops: active ? journeyStops(active, activeDays, today) : [],
      summary: active ? journeyProgress(active, activeDays) : { done: 0, total: 0, percent: 0 },

      /** Progresi i një programi çfarëdo — për kartelat te lista. */
      progressFor: (programId) => {
        const program = programs.find((p) => p.id === programId);
        return program ? journeyProgress(program, state.progress[programId]) : null;
      },
      hasStarted: (programId) => state.progress[programId] !== undefined,

      light: lightPoints(state.progress),

      startProgram,
      completeDay,
      resetJourneys,
    };
  }, [ready, state.activeId, state.progress, active, programs, startProgram, completeDay, resetJourneys]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney duhet të përdoret brenda <JourneyProvider>");
  return ctx;
}
