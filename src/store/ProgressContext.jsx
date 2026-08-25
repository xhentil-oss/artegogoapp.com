import { createContext, useCallback, useContext, useMemo } from "react";
import { HABITS, SEED_HISTORY } from "../data/tracking.js";
import { STORAGE_KEYS } from "../services/storage.js";
import { usePersistentMap } from "../hooks/usePersistentMap.js";
import { dayKey } from "../lib/time.js";
import { totalMinutes } from "../domain/sequence.js";
import { bestStreak, currentStreak, medalCounts } from "../domain/medals.js";

/**
 * Progresi i përdoruesit: historiku i seancave, zakonet, gjendja emocionale.
 *
 * Të treja ruhen lokalisht përmes `services/storage`. Kur backend-i të vijë,
 * ky provider bëhet i vetmi vend që duhet të flasë me `/me/progress`.
 */
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const habits = usePersistentMap(STORAGE_KEYS.habits);
  const moods = usePersistentMap(STORAGE_KEYS.moods);
  const sessions = usePersistentMap(STORAGE_KEYS.history);

  const today = dayKey();

  /** Historiku = demo-ja fillestare + seancat e ruajtura, sipas radhës. */
  const history = useMemo(() => {
    const stored = Object.values(sessions.data).flat();
    return [...SEED_HISTORY, ...stored];
  }, [sessions.data]);

  /** Regjistron një seancë të përfunduar. */
  const recordSession = useCallback(
    (sequence) => {
      if (!sequence?.length) return;
      const entry = {
        date: "Sot",
        min: totalMinutes(sequence),
        intent: sequence[0]?.intent ?? "calm",
      };
      sessions.update((prev) => ({ ...prev, [today]: [...(prev[today] ?? []), entry] }));
    },
    [sessions, today]
  );

  /** Shënon etiketën emocionale mbi seancën e fundit të ditës. */
  const tagLastSession = useCallback(
    (mood) => {
      if (!mood) return;
      sessions.update((prev) => {
        const dayEntries = prev[today];
        if (!dayEntries?.length) return prev;
        const updated = dayEntries.map((entry, i) =>
          i === dayEntries.length - 1 ? { ...entry, mood } : entry
        );
        return { ...prev, [today]: updated };
      });
    },
    [sessions, today]
  );

  /*
   * Zakonet dhe gjendja shkruhen VETËM te dita e sotme.
   *
   * Specifikimi (seksioni 10) e kërkon shprehimisht: "mbushen me kalimin e
   * ditëve reale — nuk mund të plotësohen ditët e kaluara". Ndaj `today` nuk
   * merret si parametër: pa datë hyrëse, asnjë ekran nuk ka si të shkruajë
   * prapa në kohë, edhe nëse dikush e kërkon më vonë.
   */
  const toggleHabit = useCallback(
    (habitId) => {
      habits.update((prev) => {
        const day = prev[today] ?? {};
        return { ...prev, [today]: { ...day, [habitId]: !day[habitId] } };
      });
    },
    [habits, today]
  );

  const setMood = useCallback(
    (value) => moods.update((prev) => ({ ...prev, [today]: value })),
    [moods, today]
  );

  /** Numri i zakoneve të plotësuara në një ditë të dhënë. */
  const habitScore = useCallback(
    (key) => Object.values(habits.data[key] ?? {}).filter(Boolean).length,
    [habits.data]
  );

  /**
   * Ditët me të paktën një meditim — baza e streak-ut dhe e medaljeve.
   *
   * `SEED_HISTORY` nuk hyn këtu: ajo mban etiketa demo ("8 Qer"), jo çelësa
   * datash, ndaj nuk përfaqëson ditë të vërteta. Streak-u duhet të matet mbi
   * atë që përdoruesi ka bërë vërtet.
   */
  const meditationDays = useMemo(
    () => Object.keys(sessions.data).filter((key) => sessions.data[key]?.length > 0),
    [sessions.data]
  );

  const streak = useMemo(() => currentStreak(meditationDays, today), [meditationDays, today]);
  const record = useMemo(() => bestStreak(meditationDays), [meditationDays]);
  const medals = useMemo(() => medalCounts(meditationDays), [meditationDays]);

  /**
   * DEMO — mbush historikun me `days` ditë rresht që mbyllen sot.
   *
   * Ekziston që klienti t'i shohë medaljet pa pritur tri javë. Shkruan te i
   * njëjti çelës si seancat e vërteta me qëllim: një burim i dytë të dhënash
   * do të mund të shpërputhej me atë që tregon historiku.
   */
  const seedStreakDemo = useCallback(
    (days) => {
      const seeded = {};
      for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        seeded[dayKey(date)] = [{ date: "Demo", min: 10, intent: "calm" }];
      }
      sessions.update(() => seeded);
    },
    [sessions]
  );

  /** DEMO — pastron historikun e seancave (bashkë me streak-un dhe medaljet). */
  const clearHistoryDemo = useCallback(() => sessions.update(() => ({})), [sessions]);

  const value = useMemo(
    () => ({
      history,
      recordSession,
      tagLastSession,

      /* shpërblimi: ditët rresht dhe medaljet e mbledhura */
      meditationDays,
      streak,
      record,
      medals,
      seedStreakDemo,
      clearHistoryDemo,

      habits: habits.data,
      habitsToday: habits.data[today] ?? {},
      habitCount: HABITS.length,
      habitScore,
      toggleHabit,

      moods: moods.data,
      moodToday: moods.data[today],
      setMood,
    }),
    [
      history, recordSession, tagLastSession,
      meditationDays, streak, record, medals, seedStreakDemo, clearHistoryDemo,
      habits.data, today, habitScore, toggleHabit, moods.data, setMood,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress duhet të përdoret brenda <ProgressProvider>");
  return ctx;
}
