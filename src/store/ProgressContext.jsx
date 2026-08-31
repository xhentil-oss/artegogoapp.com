import { createContext, useCallback, useContext, useMemo } from "react";
import { HABITS } from "../data/tracking.js";
import { STORAGE_KEYS } from "../services/storage.js";
import { usePersistentMap } from "../hooks/usePersistentMap.js";
import { dayKey } from "../lib/time.js";
import { totalMinutes } from "../domain/sequence.js";
import { bestStreak, currentStreak, medalCounts } from "../domain/medals.js";
import { isDatabaseId } from "../lib/ids.js";
import { countOn, dayNumber, fullDays, isRhythmKey, rhythmKey, stepsOn } from "../domain/rhythm.js";

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

  /**
   * Historiku — VETËM seancat e vërteta.
   *
   * ⚠️  `SEED_HISTORY` u hoq nga kjo rrugë. Sa kohë historiku ishte lokal, ajo
   *     shërbente që grafiku të mos dukej bosh gjatë demonstrimeve. Tani
   *     seancat vijnë nga databaza, dhe një llogari e sapokrijuar tregonte
   *     "130 minuta · 6 seanca" — numra të shpikur, të padallueshëm nga ata të
   *     vërtetët, te i njëjti ekran ku përdoruesi mat përparimin e vet.
   *
   *     Për demonstrim ekziston `seedStreakDemo` te paneli i admin-it, që
   *     shkruan seanca të vërteta dhe shihet qartë se janë vendosur me dorë.
   */
  const history = useMemo(() => Object.values(sessions.data).flat(), [sessions.data]);

  /**
   * Regjistron një seancë të përfunduar.
   *
   * `meditationId` dërgohet vetëm kur është një id e databazës: mini-blloqet
   * lokale (`b1`, `b2`…) nuk ekzistojnë atje, dhe çelësi i huaj do ta refuzonte
   * gjithë seancën — pra do të humbiste edhe minutat, edhe streak-u.
   */
  const recordSession = useCallback(
    (sequence) => {
      if (!sequence?.length) return;
      const first = sequence[0];
      const entry = {
        date: "Sot",
        min: totalMinutes(sequence),
        intent: first?.intent ?? "calm",
        meditationId: isDatabaseId(first?.id) ? first.id : null,
        title: first?.title ?? null,
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

  /**
   * Numri i zakoneve të plotësuara në një ditë të dhënë.
   *
   * ⚠️  Hapat e ritmit ditor përjashtohen. Ata ruhen te i njëjti çelës — shih
   *     `domain/rhythm.js` — dhe pa këtë filtër një ditë me tre hapa ritmi do
   *     të tregonte "3 nga 6 zakone" pa u prekur asnjë zakon.
   */
  const habitScore = useCallback(
    (key) =>
      Object.entries(habits.data[key] ?? {}).filter(([id, value]) => value && !isRhythmKey(id)).length,
    [habits.data]
  );

  /**
   * RITMI DITOR (tre hapat te profili).
   *
   * Më parë përparimi rrinte te `useState` brenda komponentit: zhdukej sa herë
   * ndërrohej skeda, dhe "dita 1" ishte e shkruar fiks. Tani shkruhet te
   * `habits`, pra shkon te databaza dhe kthehet edhe te një pajisje tjetër.
   */
  const rhythmToday = useMemo(() => stepsOn(habits.data, today), [habits.data, today]);

  const completeRhythmStep = useCallback(
    (stepId) => {
      const key = rhythmKey(stepId);
      /* I kryer nuk rishkruhet: shtypja e dytë nuk duhet ta prishë ditën. */
      if (habits.data[today]?.[key]) return;
      habits.update((prev) => ({
        ...prev,
        [today]: { ...(prev[today] ?? {}), [key]: true },
      }));
    },
    [habits, today]
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

      /* ritmi ditor */
      rhythmToday,
      rhythmCount: countOn(habits.data, today),
      rhythmDay: dayNumber(habits.data, today),
      rhythmAchievements: fullDays(habits.data).length,
      completeRhythmStep,
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
      rhythmToday, completeRhythmStep,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress duhet të përdoret brenda <ProgressProvider>");
  return ctx;
}
