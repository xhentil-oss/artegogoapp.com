import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage, STORAGE_KEYS } from "../services/storage.js";
import * as auth from "../services/auth.js";
import * as billing from "../services/billing.js";
import { defaultReminders } from "../data/reminders.js";
import { describeSubscription, fromServer } from "../domain/subscription.js";
import { hasToken } from "../services/api.js";

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
  /**
   * Dy gjëra të ndryshme, dhe ngatërrimi i tyre ishte defekt i vërtetë.
   *
   * `canAdmin`  — E DREJTA, nga serveri (`users.is_admin`). Nuk ndryshohet dot
   *               nga aplikacioni.
   * `adminView` — PAMJA: a shfaqen mjetet e admin-it tani. Ka kuptim vetëm për
   *               atë që e ka të drejtën.
   *
   * ⚠️  Më parë ekzistonte vetëm një flamur, dhe një ndërprerës te profili e
   *     vendoste drejtpërdrejt. Pra çdo përdorues mund ta ndezte dhe të shihte
   *     kutinë "Shkruaj një postim" — shkrimi dështonte me 403, por ftesa
   *     ishte aty, dhe kërkesa e seksionit 6.6 është "VETËM admini poston".
   */
  const [adminView, setAdminView] = useState(false);


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
        /* E drejta e admin-it vjen bashkë me llogarinë, nga serveri. */
        setAdminView(Boolean(savedAccount.isAdmin));
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
    /* Pamja hapet vetëm për atë që e ka të drejtën. Çdo shkrim kalon gjithsesi
       nga `requireAdmin` te serveri. */
    setAdminView(Boolean(next?.isAdmin));

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
   * Rivendosja e fjalëkalimit me token-in nga email-i.
   *
   * Kalon nga i njëjti `adoptAccount` si hyrja: përdoruesi sapo provoi
   * identitetin përmes email-it, ndaj hyn menjëherë. Një ekran hyrjeje pas
   * kësaj do të ishte hap i kotë.
   */
  const completeReset = useCallback(
    async ({ token, password }) => {
      const result = await auth.resetPassword({ token, password });
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
    setAdminView(false);
  }, []);

  /** Shkruan abonimin njëherësh në gjendje dhe në ruajtje. */
  const persistSubscription = useCallback((next) => {
    setSubscription(next);
    if (next) storage.set(STORAGE_KEYS.subscription, next);
    else storage.remove(STORAGE_KEYS.subscription);
  }, []);

  /**
   * Abonimi lexohet nga serveri.
   *
   * ⚠️  Gjendja lokale shfaqet e para që ekrani të mos presë rrjetin, por
   *     SERVERI ËSHTË I VËRTETI dhe e mbishkruan. Pa këtë, abonimi mbetej te
   *     `localStorage`: kushdo që hapte DevTools bëhej premium, dhe një
   *     abonent që ndërronte telefon e humbte aksesin që kishte paguar.
   *
   *     `null` do të thotë "kjo llogari s'ka pasur kurrë abonim", ndaj çdo
   *     gjendje e mbetur te pajisja hiqet.
   */
  useEffect(() => {
    if (!ready || !hasToken()) return undefined;

    let cancelled = false;
    billing.current().then((state) => {
      if (!cancelled) persistSubscription(fromServer(state));
    });
    return () => {
      cancelled = true;
    };
  }, [ready, account, persistSubscription]);

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
      /*
       * Butoni i paywall-it është "Fillo provën 3-ditore falas" — pra veprimi
       * është nisja e provës, jo një blerje. Datat i llogarit serveri, dhe ai
       * refuzon rinisjen sepse mban `trial_used_at`.
       */
      const result = await billing.startTrial(planId);
      if (result.ok) persistSubscription(fromServer(result.state));
      /* Nëse prova është konsumuar, rruga e vetme mbetet dyqani. */
      else if (result.used) persistSubscription(fromServer(await billing.current()));
      return result;
    },
    [persistSubscription]
  );

  /**
   * Blerje e vërtetë përmes App Store / Google Play.
   *
   * E ndarë nga `subscribe` me qëllim: e para jep një provë që e vendos vetë
   * serveri, e dyta kërkon një faturë të verifikuar. Ngatërrimi i tyre do të
   * thoshte që një dështim pagese të hapte gjithsesi aksesin.
   */
  const purchasePlan = useCallback(
    async (planId = "year") => {
      const result = await billing.purchase(planId);
      if (result.ok) persistSubscription(fromServer(result.state));
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
    /* Tani funksionon vërtet: abonimi rri te llogaria në databazë, ndaj pyetja
       i drejtohet serverit dhe përgjigjja vlen te çdo pajisje. */
    const result = await billing.restore();
    if (result.ok) persistSubscription(fromServer(result.state));
    return result;
  }, [persistSubscription]);

  /**
   * Anulon rinovimin — aksesi vazhdon deri në fund të periudhës.
   * `cancelledAt` ruhet sepse pa të nuk dihet deri kur vlen aksesi.
   */
  const cancelSubscription = useCallback(async () => {
    if (!subscription) return { ok: false };
    const result = await billing.cancel();
    if (result.ok) persistSubscription(fromServer(result.state));
    return result;
  }, [persistSubscription, subscription]);

  /** Rikthen rinovimin para se periudha të mbarojë. */
  const resumeSubscription = useCallback(async () => {
    if (!subscription) return { ok: false };
    const result = await billing.resume();
    if (result.ok) persistSubscription(fromServer(result.state));
    return result;
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
    setAdminView(false);
    storage.remove(STORAGE_KEYS.onboarding);
  }, [persistSubscription]);

  /** E drejta vjen nga llogaria, pra nga serveri. */
  const canAdmin = Boolean(account?.isAdmin);

  /**
   * Ndërprerësi i pamjes.
   *
   * ⚠️  Kapet te `canAdmin`: një kërkesë për ta ndezur pa të drejtë shpërfillet
   *     në heshtje. Kjo është pika që mungonte — më parë ai e vendoste flamurin
   *     drejtpërdrejt, dhe kushdo shihte kutinë e shkrimit te komuniteti.
   */
  const setAdminSafely = useCallback(
    (next) => setAdminView(canAdmin ? Boolean(next) : false),
    [canAdmin]
  );

  /**
   * Gjendja rillogaritet nga regjistrimi — asnjë kopje e dyfishtë.
   *
   * ⚠️  Kur regjistrimi vjen nga serveri, VENDIMI I TIJ për aksesin fiton mbi
   *     llogaritjen lokale. Të dyja duhet të japin të njëjtën gjë; nëse jo,
   *     e vërteta është ajo e serverit — ai e ka orën e vet dhe të dhënat e
   *     vërteta, ndërsa ora e pajisjes mund të jetë zhvendosur me dorë.
   *
   *     Ora demo (`offsetDays`) mbetet përjashtim i qëllimshëm: ajo ekziston
   *     pikërisht për të parë kalimet provë → aktiv → skaduar pa pritur ditë,
   *     ndaj kur është ndezur, llogaritja lokale mbetet ajo që shfaqet.
   */
  const status = useMemo(() => {
    const local = describeSubscription(subscription);
    const demoClock = (subscription?.offsetDays ?? 0) !== 0;

    if (demoClock || typeof subscription?.serverIsPremium !== "boolean") return local;
    return { ...local, isPremium: subscription.serverIsPremium };
  }, [subscription]);

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
      completeReset,
      signOut,

      subscription,
      subscriptionStatus: status,
      isPremium: status.isPremium,

      subscribe,
      purchasePlan,
      restorePurchases,
      cancelSubscription,
      resumeSubscription,
      shiftDemoClock,
      resetDemoClock,
      resetToFreeDemo,

      /** A e ka llogaria të drejtën e admin-it (nga serveri). */
      canAdmin,
      /**
       * A shfaqen mjetet e admin-it.
       *
       * ⚠️  Gjithmonë `false` për një llogari pa të drejtë, sado herë të
       *     shtypet ndërprerësi.
       */
      isAdmin: canAdmin && adminView,
      setIsAdmin: setAdminSafely,
      completeOnboarding,
      updateReminders,
      logout,
    }),
    [
      canAdmin,
      adminView,
      setAdminSafely,
      account,
      profile,
      ready,
      signIn,
      signUp,
      completeReset,
      signOut,
      subscription,
      status,
      subscribe,
      purchasePlan,
      restorePurchases,
      cancelSubscription,
      resumeSubscription,
      shiftDemoClock,
      resetDemoClock,
      resetToFreeDemo,
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
