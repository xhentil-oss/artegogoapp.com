import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage, STORAGE_KEYS } from "../services/storage.js";
import * as auth from "../services/auth.js";
import * as billing from "../services/billing.js";
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
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      storage.get(STORAGE_KEYS.account, null),
      storage.get(STORAGE_KEYS.onboarding, null),
      storage.get(STORAGE_KEYS.subscription, null),
    ]).then(([savedAccount, savedProfile, savedSubscription]) => {
      if (cancelled) return;

      if (savedAccount) {
        setAccount(savedAccount);
      } else if (savedProfile?.name) {
        /*
         * Pajisje që e kishte aplikacionin PARA se të shtohej llogaria.
         *
         * Pa këtë, kushdo që kishte kaluar onboarding-un do të hidhej sërish
         * te ekrani i hyrjes, si përdorues i panjohur. Llogaria ndërtohet nga
         * profili dhe shënohet `migrated`, që të dallohet nga një hyrje e
         * vërtetë kur të vijë backend-i.
         */
        const migrated = {
          email: null,
          migrated: true,
          createdAt: savedProfile.createdAt ?? new Date().toISOString(),
        };
        setAccount(migrated);
        storage.set(STORAGE_KEYS.account, migrated);
      }

      if (savedProfile?.name) setProfile(savedProfile);
      if (savedSubscription) setSubscription(savedSubscription);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- llogaria ---------- */

  /**
   * Pranon një llogari dhe vendos nëse profili i ruajtur i takon asaj.
   *
   * Një email tjetër është person tjetër: pa këtë kontroll, kushdo që hynte
   * pas dikujt tjetër do të gjente emrin dhe oraret e tij, dhe onboarding-u
   * nuk do të shfaqej kurrë më. Profilet e migruara nuk kanë email — pra nuk
   * dihet e kujt ishin — ndaj trajtohen si të huaja.
   *
   * ⚠️  Kjo prek vetëm emrin dhe oraret. Zakonet, medaljet dhe të preferuarat
   *     ruhen pa ndarje sipas llogarie; ndarja e vërtetë e të dhënave për
   *     përdorues kërkon backend.
   */
  const adoptAccount = useCallback(async (next) => {
    setAccount(next);

    const saved = await storage.get(STORAGE_KEYS.onboarding, null);
    if (!saved?.name) return;

    if (saved.email && saved.email === next.email) {
      setProfile(saved);
    } else {
      await storage.remove(STORAGE_KEYS.onboarding);
      setProfile(null);
    }
  }, []);

  /** Hyrje; kthen rezultatin, që ekrani të shfaqë gabimin. */
  const signIn = useCallback(
    async (credentials) => {
      const result = await auth.signIn(credentials);
      if (result.ok) await adoptAccount(result.account);
      return result;
    },
    [adoptAccount]
  );

  const signUp = useCallback(
    async (credentials) => {
      const result = await auth.signUp(credentials);
      if (result.ok) await adoptAccount(result.account);
      return result;
    },
    [adoptAccount]
  );

  /**
   * Shkëputje.
   *
   * Progresi RUHET në pajisje — zakonet, medaljet, të preferuarat. Kur
   * përdoruesi rikthehet, i gjen ku i lëshoi; një shkëputje nuk duhet të
   * fshijë punën e javëve.
   */
  const signOut = useCallback(async () => {
    await auth.signOut();
    setAccount(null);
    setIsAdmin(false);
  }, []);

  /** Shkruan abonimin njëherësh në gjendje dhe në ruajtje. */
  const persistSubscription = useCallback((next) => {
    setSubscription(next);
    if (next) storage.set(STORAGE_KEYS.subscription, next);
    else storage.remove(STORAGE_KEYS.subscription);
  }, []);

  const completeOnboarding = useCallback(
    ({ name, reminders }) => {
      const record = {
        name: name.trim(),
        reminders: reminders ?? defaultReminders(),
        createdAt: new Date().toISOString(),
        /* Email-i shkruhet bashkë me profilin, që në hyrjen e radhës të dihet
           nëse ky profil i takon vërtet asaj llogarie. */
        email: account?.email ?? null,
      };
      setProfile(record);
      storage.set(STORAGE_KEYS.onboarding, record);
    },
    [account]
  );

  const updateReminders = useCallback((reminders) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, reminders };
      storage.set(STORAGE_KEYS.onboarding, next);
      return next;
    });
  }, []);

  /* ---------- abonimi ---------- */

  /**
   * Nis provën falas me planin e zgjedhur.
   *
   * Kalon nga `services/billing`, jo drejt te ruajtja. Në prototip ajo pikë
   * thjesht e pranon blerjen, por rendi ka rëndësi: kur të vijë StoreKit ose
   * Play Billing, abonimi do të shkruhet VETËM pasi dyqani të ketë konfirmuar.
   * Po të shkruante ekrani vetë, aplikacioni do ta hapte premium-in edhe kur
   * pagesa dështon.
   */
  const subscribe = useCallback(
    async (planId = "year") => {
      const result = await billing.purchase(planId);
      if (!result.ok) return result;

      persistSubscription(startSubscription(planId));
      return result;
    },
    [persistSubscription]
  );

  /**
   * Rikthen një abonim ekzistues.
   *
   * Apple e kërkon si veprim më vete në çdo paywall: një përdorues që ndërron
   * telefon duhet ta rifitojë aksesin pa paguar dy herë.
   */
  const restorePurchases = useCallback(async () => {
    const result = await billing.restore();
    if (result.ok && result.planId) persistSubscription(startSubscription(result.planId));
    return result;
  }, [persistSubscription]);

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

  /** Pastrim i plotë i pajisjes — llogaria, profili dhe abonimi. */
  const logout = useCallback(async () => {
    await auth.signOut();
    setAccount(null);
    setProfile(null);
    persistSubscription(null);
    setIsAdmin(false);
    storage.remove(STORAGE_KEYS.onboarding);
  }, [persistSubscription]);

  /* Gjendja rillogaritet nga regjistrimi — asnjë kopje e dyfishtë. */
  const status = useMemo(() => describeSubscription(subscription), [subscription]);

  const value = useMemo(
    () => ({
      account,
      profile,
      ready,
      name: profile?.name ?? "",
      email: account?.email ?? "",
      reminders: profile?.reminders ?? defaultReminders(),

      /* Dy porta të ndara: llogaria hapet e para, onboarding-u pas saj. */
      hasAccount: account !== null,
      isOnboarded: profile !== null,

      signIn,
      signUp,
      signOut,

      subscription,
      subscriptionStatus: status,
      isPremium: status.isPremium,

      subscribe,
      restorePurchases,
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
      account,
      profile,
      ready,
      signIn,
      signUp,
      signOut,
      subscription,
      status,
      subscribe,
      restorePurchases,
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
