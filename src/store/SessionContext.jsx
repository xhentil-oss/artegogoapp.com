import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage, STORAGE_KEYS } from "../services/storage.js";
import { defaultReminders } from "../data/reminders.js";
import { describeSubscription, effectiveNow, startSubscription } from "../domain/subscription.js";

/**
 * Sesioni i përdoruesit: identiteti, kujtesat, abonimi, të drejtat.
 *
 * `isPremium` NUK është më një çelës i thjeshtë — rrjedh nga gjendja e
 * abonimit (provë / aktiv / anuluar / skaduar), e cila ruhet dhe mbijeton
 * rifreskimin. Kështu rrjedha e abonimit shihet ashtu siç do ta shohë
 * përdoruesi i vërtetë.
 */
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      storage.get(STORAGE_KEYS.onboarding, null),
      storage.get(STORAGE_KEYS.subscription, null),
    ]).then(([savedProfile, savedSubscription]) => {
      if (cancelled) return;
      if (savedProfile?.name) setProfile(savedProfile);
      if (savedSubscription) setSubscription(savedSubscription);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Shkruan abonimin njëherësh në gjendje dhe në ruajtje. */
  const persistSubscription = useCallback((next) => {
    setSubscription(next);
    if (next) storage.set(STORAGE_KEYS.subscription, next);
    else storage.remove(STORAGE_KEYS.subscription);
  }, []);

  const completeOnboarding = useCallback(({ name, reminders }) => {
    const record = {
      name: name.trim(),
      reminders: reminders ?? defaultReminders(),
      createdAt: new Date().toISOString(),
    };
    setProfile(record);
    storage.set(STORAGE_KEYS.onboarding, record);
  }, []);

  const updateReminders = useCallback((reminders) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, reminders };
      storage.set(STORAGE_KEYS.onboarding, next);
      return next;
    });
  }, []);

  /* ---------- abonimi ---------- */

  /** Nis provën falas me planin e zgjedhur. */
  const subscribe = useCallback(
    (planId = "year") => persistSubscription(startSubscription(planId)),
    [persistSubscription]
  );

  /**
   * Anulon rinovimin — aksesi vazhdon deri në fund të periudhës.
   * `cancelledAt` ruhet sepse pa të nuk dihet deri kur vlen aksesi.
   */
  const cancelSubscription = useCallback(() => {
    if (!subscription) return;
    const at = effectiveNow(subscription);
    persistSubscription({ ...subscription, cancelled: true, cancelledAt: at.toISOString() });
  }, [persistSubscription, subscription]);

  /** Rikthen rinovimin para se periudha të mbarojë. */
  const resumeSubscription = useCallback(() => {
    if (!subscription) return;
    const { cancelledAt: _removed, ...rest } = subscription;
    persistSubscription({ ...rest, cancelled: false });
  }, [persistSubscription, subscription]);

  /**
   * VETËM PËR DEMONSTRIM: zhvendos "orën" përpara, që kalimet provë → aktiv
   * → skaduar të shihen pa pritur ditë të vërteta.
   */
  const shiftDemoClock = useCallback(
    (days) =>
      persistSubscription(
        subscription ? { ...subscription, offsetDays: Math.max(0, (subscription.offsetDays ?? 0) + days) } : null
      ),
    [persistSubscription, subscription]
  );

  const resetDemoClock = useCallback(
    () => persistSubscription(subscription ? { ...subscription, offsetDays: 0 } : null),
    [persistSubscription, subscription]
  );

  /**
   * VETËM PËR DEMONSTRIM: hiq abonimin krejt dhe kthehu te llogaria falas.
   *
   * Ndryshe nga anulimi, që e ruan aksesin deri në fund të periudhës së paguar,
   * kjo e fshin regjistrimin. Nevojitet sepse pa të nuk kishte asnjë rrugë nga
   * brenda aplikacionit për ta parë sërish pamjen e një përdoruesi falas —
   * dhe pikërisht ajo pamje duhet parë kur shqyrtohet çfarë është e kyçur.
   */
  const resetToFreeDemo = useCallback(() => persistSubscription(null), [persistSubscription]);

  const logout = useCallback(() => {
    setProfile(null);
    persistSubscription(null);
    setIsAdmin(false);
    storage.remove(STORAGE_KEYS.onboarding);
  }, [persistSubscription]);

  /* Gjendja rillogaritet nga regjistrimi — asnjë kopje e dyfishtë. */
  const status = useMemo(() => describeSubscription(subscription), [subscription]);

  const value = useMemo(
    () => ({
      profile,
      ready,
      name: profile?.name ?? "",
      reminders: profile?.reminders ?? defaultReminders(),
      isAuthenticated: profile !== null,

      subscription,
      subscriptionStatus: status,
      isPremium: status.isPremium,

      subscribe,
      cancelSubscription,
      resumeSubscription,
      shiftDemoClock,
      resetDemoClock,
      resetToFreeDemo,

      isAdmin,
      setIsAdmin,
      completeOnboarding,
      updateReminders,
      logout,
    }),
    [
      profile,
      ready,
      subscription,
      status,
      subscribe,
      cancelSubscription,
      resumeSubscription,
      shiftDemoClock,
      resetDemoClock,
      resetToFreeDemo,
      isAdmin,
      completeOnboarding,
      updateReminders,
      logout,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession duhet të përdoret brenda <SessionProvider>");
  return ctx;
}
