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
import { api, hasToken } from "../services/api.js";

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

/**
 * Lexon rrugëtimet nga serveri dhe i kthen në formën lokale.
 *
 * Serveri jep dy lista të sheshta — `progress` (cilat programe janë nisur) dhe
 * `completions` (cilat ditë janë kryer). Aplikacioni pret
 * `{ programId: { day: "2026-08-31" } }`, sepse rregulli "një ndalesë në ditë"
 * krahason data.
 */
async function fetchJourney() {
  const data = await api.get("/me/journey");
  const progress = {};

  /* Një program i nisur pa asnjë ditë të kryer duhet të mbetet i nisur. */
  for (const row of data?.progress ?? []) progress[row.program_id] ??= {};

  for (const row of data?.completions ?? []) {
    /* `completed_at` vjen si "2026-08-31 10:22:33"; mban rëndësi vetëm data. */
    (progress[row.program_id] ??= {})[row.day_number] = String(row.completed_at).slice(0, 10);
  }

  /* Kur pajisja s'ka zgjedhur ende, hapet ai që u nis i pari. */
  const firstStarted = (data?.progress ?? [])[0]?.program_id ?? null;
  return { progress, firstStarted };
}

export function JourneyProvider({ children }) {
  const [state, setState] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      /* Gjendja lokale shfaqet e para — ekrani nuk pret rrjetin. */
      const saved = await storage.get(STORAGE_KEYS.journey, EMPTY);
      if (cancelled) return;
      setState({ ...EMPTY, ...(saved ?? {}) });
      setReady(true);

      if (!hasToken()) return;

      /*
       * Ditët e kryera vijnë nga serveri; `activeId` mbetet lokal.
       *
       * ⚠️  Serveri nuk e ruan cili rrugëtim është "aktiv" — dhe nuk duhet ta
       *     ruajë: ajo është zgjedhje pamore e pajisjes, jo fakt i progresit.
       *     Progresi është ai që duhet të ndiqet mes pajisjeve.
       */
      try {
        const remote = await fetchJourney();
        if (cancelled) return;
        setState((prev) => {
          const next = { activeId: prev.activeId ?? remote.firstStarted, progress: remote.progress };
          storage.set(STORAGE_KEYS.journey, next);
          return next;
        });
      } catch {
        /* Pa rrjet mbetet gjendja lokale — shih shënimin te `services/userData.js`. */
      }
    })();

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
    (programId) => {
      commit({
        activeId: programId,
        progress: {
          ...state.progress,
          [programId]: normalizeCompletions(state.progress[programId]),
        },
      });
      if (hasToken()) {
        api.post(`/me/journey/${encodeURIComponent(programId)}/start`).catch(() => {});
      }
    },
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

      /*
       * Serveri e zbaton po ashtu rregullin "një ndalesë në ditë" dhe kthen
       * `409`. Kjo nuk është dyfishim i kotë: kontrolli te aplikacioni ruan
       * përvojën, ai te serveri ruan të dhënat — një kërkesë e ndërtuar me dorë
       * do ta mbaronte programin 7-ditor brenda një minute.
       */
      if (hasToken()) {
        api
          .post(`/me/journey/${encodeURIComponent(programId)}/complete/${day}`)
          .catch((err) => console.warn("[artegogo] ndalesa nuk u ruajt:", err?.message));
      }
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
