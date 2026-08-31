import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
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
   * Çfarë duhet shënuar KUR seanca të mbarojë.
   *
   * Dy forma, të dyja opsionale:
   *   `{ programId, day }` — një ndalesë rrugëtimi
   *   `{ ritualStep }`     — një hap i ritmit ditor
   *
   * Pa këtë, përfundimi nuk do ta dinte çfarë të shënojë — dhe as rrugëtimi
   * as ritmi nuk do të përparonin kurrë nga dëgjimi.
   */
  const [marker, setMarker] = useState(null);

  /*
   * Sekuenca aktive mbahet edhe te një ref — shih shënimin te `complete()`.
   */
  const activeRef = useRef(null);

  const { goToTab } = useNavigation();
  const { recordSession, tagLastSession, completeRhythmStep } = useProgress();
  const { completeDay } = useJourney();

  /** Nis një sekuencë të re (e vesh me uid `domain/sequence`). */
  const play = useCallback((sequence, from = "catalog", onFinish = null) => {
    if (!sequence?.length) return;
    setMinimized(null);
    setSource(from);
    setMarker(onFinish);
    activeRef.current = sequence;
    setActive(sequence);
  }, []);

  /** Fsheh player-in, por mban sekuencën në mini-player. */
  const minimize = useCallback(() => {
    const current = activeRef.current;
    if (!current) return;
    activeRef.current = null;
    setMinimized(current);
    setActive(null);
  }, []);

  const resume = useCallback(() => {
    setMinimized((current) => {
      if (current) {
        activeRef.current = current;
        setActive(current);
      }
      return null;
    });
  }, []);

  const dismissMinimized = useCallback(() => setMinimized(null), []);

  /**
   * Seanca mbaroi: regjistroje dhe hap ekranin e përmbylljes.
   *
   * ⚠️  Shkrimi NUK bëhet brenda prodhuesit të `setActive`, siç ishte më parë.
   *     React nën `StrictMode` e thërret atë prodhues DY HERË — e padëmshme sa
   *     kohë shkrimi shkonte te `localStorage`, sepse i dyti ishte i njëjtë.
   *     Sapo seancat filluan të shkojnë te databaza, kjo u bë e rrezikshme: dy
   *     `POST /me/sessions` për një seancë të vetme, dhe një streak i fryrë pa
   *     asnjë shenjë se ku ndodhi.
   */
  const complete = useCallback(() => {
    const current = activeRef.current;
    if (!current) return;

    activeRef.current = null;
    setActive(null);
    setMinimized(null);
    setMarker(null);

    recordSession(current);
    setCompleted(current);
    setCompletedSource(source);

    /* Shënimi bëhet KËTU, jo te ekrani i përmbylljes: përdoruesi mund ta
       mbyllë atë ekran, dhe puna e bërë duhet të mbetet e regjistruar. */
    if (marker?.programId) completeDay(marker.programId, marker.day);
    if (marker?.ritualStep) completeRhythmStep(marker.ritualStep);
  }, [recordSession, source, marker, completeDay, completeRhythmStep]);

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
