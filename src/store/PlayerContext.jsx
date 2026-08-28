import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { TABS } from "../config/navigation.js";
import { useNavigation } from "./NavigationContext.jsx";
import { useProgress } from "./ProgressContext.jsx";
import { useJourney } from "./JourneyContext.jsx";

/**
 * Cikli i luajtjes: sekuenca aktive, mini-player-i, ekrani i përmbylljes.
 *
 * Vetëm një sekuencë është aktive njëherësh. Kalimet:
 *   play → (minimize ⇄ resume) → complete → dismissCompletion
 */
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [active, setActive] = useState(null);
  const [minimized, setMinimized] = useState(null);
  const [completed, setCompleted] = useState(null);
  /**
   * Nga erdhi seanca: "builder" ose "catalog".
   * Ekrani i përmbylljes e përdor për të vendosur nëse shfaq kutinë
   * "Ruaje këtë meditim?" — ajo ka kuptim vetëm për seanca të ndërtuara.
   */
  const [source, setSource] = useState("catalog");
  const [completedSource, setCompletedSource] = useState("catalog");

  /**
   * Ndalesa e rrugëtimit që po luhet, nëse seanca nisi nga një program:
   * `{ programId, day }`. Pa këtë, përfundimi nuk do ta dinte cilën ditë të
   * shënojë, dhe rrugëtimi nuk do të përparonte kurrë.
   */
  const [stop, setStop] = useState(null);

  const { goToTab } = useNavigation();
  const { recordSession, tagLastSession } = useProgress();
  const { completeDay } = useJourney();

  /** Nis një sekuencë të re (e vesh me uid `domain/sequence`). */
  const play = useCallback((sequence, from = "catalog", journeyStop = null) => {
    if (!sequence?.length) return;
    setMinimized(null);
    setSource(from);
    setStop(journeyStop);
    setActive(sequence);
  }, []);

  /** Fsheh player-in, por mban sekuencën në mini-player. */
  const minimize = useCallback(() => {
    setActive((current) => {
      if (current) setMinimized(current);
      return null;
    });
  }, []);

  const resume = useCallback(() => {
    setMinimized((current) => {
      if (current) setActive(current);
      return null;
    });
  }, []);

  const dismissMinimized = useCallback(() => setMinimized(null), []);

  /** Seanca mbaroi: regjistroje dhe hap ekranin e përmbylljes. */
  const complete = useCallback(() => {
    setActive((current) => {
      if (current) {
        recordSession(current);
        setCompleted(current);
        setCompletedSource(source);
        /* Ndalesa e rrugëtimit shënohet KËTU, jo te ekrani i përmbylljes:
           përdoruesi mund ta mbyllë atë ekran, dhe dita duhet të mbetet e
           kryer gjithsesi. */
        if (stop) completeDay(stop.programId, stop.day);
      }
      setMinimized(null);
      setStop(null);
      return null;
    });
  }, [recordSession, source, stop, completeDay]);

  /**
   * Mbyll përmbylljen, duke ruajtur etiketën emocionale nëse u zgjodh.
   * Çon te Profili — aty jetojnë statistikat dhe progresi që sapo u shtua.
   */
  const dismissCompletion = useCallback(
    (mood) => {
      tagLastSession(mood);
      setCompleted(null);
      goToTab(TABS.PROFILE);
    },
    [tagLastSession, goToTab]
  );

  const value = useMemo(
    () => ({
      active,
      minimized,
      completed,
      completedSource,
      play,
      minimize,
      resume,
      dismissMinimized,
      complete,
      dismissCompletion,
    }),
    [active, minimized, completed, completedSource, play, minimize, resume, dismissMinimized, complete, dismissCompletion]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer duhet të përdoret brenda <PlayerProvider>");
  return ctx;
}
