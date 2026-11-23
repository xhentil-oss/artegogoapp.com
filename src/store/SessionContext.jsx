import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { storage, STORAGE_KEYS } from "../services/storage.js";
import * as auth from "../services/auth.js";
import * as billing from "../services/billing.js";
import { defaultReminders } from "../data/reminders.js";
import { saveReminders, syncReminders } from "../services/reminders.js";
import { describeSubscription, fromServer } from "../domain/subscription.js";
import { hasToken, onSessionEnded, onTokenChange } from "../services/api.js";

/**
 * Të njëjtat çaste kujtese, por të gjitha të fikura.
 *
 * Përdoret kur profili rikthehet nga serveri: aty dihet emri, jo zgjedhja e
 * kujtesave. Një listë bosh do ta prishte formën që presin ekranet.
 */
const fikur = (reminders) =>
  Object.fromEntries(
    Object.entries(reminders).map(([id, slot]) => [id, { ...slot, enabled: false }])
  );

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

  /**
   * A i ka serveri çelësat e Stripe-it?
   *
   * Nis me `false`: derisa të përgjigjet serveri, ekrani nuk duhet të premtojë
   * një tarifim që nuk e di nëse ndodh. Gabimi në këtë drejtim është i
   * padëmshëm; i kundërti jo.
   */
  const [paymentsReady, setPaymentsReady] = useState(false);
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
  /**
   * Arsyeja e daljes së detyruar — shfaqet te ekrani i hyrjes.
   *
   * Pa të, përdoruesi do të gjendej papritur para formës së hyrjes pa ditur
   * pse: "a dola vetë? a u prish?" — dhe arsyeja është pikërisht ajo që e
   * bën rregullin të kuptueshëm.
   */
  const [sessionNotice, setSessionNotice] = useState(null);

  /**
   * A po ikën përdoruesi me vullnetin e vet (dalje ose fshirje llogarie)?
   *
   * `ref`, jo `state`: lexohet brenda një dëgjuesi që regjistrohet një herë
   * dhe nuk e sheh kurrë gjendjen e re.
   */
  const dalaVullnetare = useRef(false);


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
      } else if (savedProfile?.name && !savedProfile.email) {
        /*
         * Pajisje që e kishte aplikacionin PARA se të shtohej llogaria.
         *
         * Pa këtë, kushdo që kishte kaluar onboarding-un do të hidhej sërish
         * te ekrani i hyrjes, si përdorues i panjohur. Llogaria ndërtohet nga
         * profili dhe shënohet `migrated`, që të dallohet nga një hyrje e
         * vërtetë kur të vijë backend-i.
         *
         * ⚠️  VETËM kur profili NUK mban email (12 tetor 2026).
         *
         *     Profilet e krijuara pas llogarive e ruajnë email-in brenda tyre.
         *     Pa këtë kusht, sa herë që llogaria hiqej — p.sh. kur sesioni
         *     zhvendosej te një pajisje tjetër — hapja e radhës e ringjallte
         *     nga profili si një llogari fantazmë: pa email, pa token dhe **pa
         *     të drejtat e admin-it**. Ekrani tregonte emrin dhe statistikat e
         *     ruajtura, por kurora zhdukej dhe abonimi dukej i skaduar, sepse
         *     asgjë nuk vinte më nga serveri.
         *
         *     Me email-in te profili, e vetmja rrugë është hyrja e vërtetë —
         *     dhe ajo e kthen llogarinë me të drejtat e saj.
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

    if (saved?.name && saved.email && saved.email === next.email) {
      setProfile(saved);
      return;
    }

    /* Profil i huaj ose i munguar — nuk mbahet. */
    if (saved) await storage.remove(STORAGE_KEYS.onboarding);

    /*
     * Pajisja nuk e njeh këtë llogari, por SERVERI e njeh.
     *
     * ⚠️  Pa këtë, hyrja nga një telefon i dytë — ose nga i njëjti pas një
     *     rivendosjeje fjalëkalimi, kur shfletuesi ishte pastruar — nisej nga
     *     "Mirë se erdhe", sikur llogaria të ishte e re. Gjithçka tjetër
     *     (seancat, zakonet, medaljet, të preferuarat) rrinte te databaza dhe
     *     shfaqej menjëherë pas asaj porte; e vetmja gjë që mungonte ishte
     *     profili, dhe pikërisht ai e mbante portën mbyllur.
     *
     * ⚠️  Kujtesat nisen TË FIKURA, jo me parazgjedhjet. `syncReminders`
     *     menjëherë pas kësaj merr ato të serverit kur ekzistojnë; po t'i
     *     kisha nisur të ndezura, një përdorues që i kishte fikur të gjitha
     *     do t'i gjente të rikthyera.
     */
    if (next?.onboarded && next?.name) {
      const restored = {
        name: next.name,
        reminders: fikur(defaultReminders()),
        createdAt: next.createdAt ?? new Date().toISOString(),
        email: next.email ?? null,
      };
      setProfile(restored);
      await storage.set(STORAGE_KEYS.onboarding, restored);
      return;
    }

    setProfile(null);
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

  /**
   * Krijim llogarie.
   *
   * ⚠️  `result.account` MUND TË MOS JETË. Kur serveri kërkon verifikim
   *     email-i, regjistrimi kthen `{ ok: true, pending: true }` pa llogari —
   *     dhe `adoptAccount(undefined)` do ta linte sesionin në një gjendje të
   *     gjysmuar, me `account` bosh por të vendosur.
   */
  const signUp = useCallback(
    async (credentials) => {
      const result = await auth.signUp(credentials);
      if (result.ok && result.account) await adoptAccount(result.account);
      return result;
    },
    [adoptAccount]
  );

  /** Verifikimi i email-it me token-in nga link-u — hyn menjëherë, si `completeReset`. */
  const completeVerification = useCallback(
    async (token) => {
      const result = await auth.completeVerification(token);
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
    /* Shih `dalaVullnetare` te efekti poshtë: pa këtë flamur, `clearToken()`
       brenda `auth.signOut()` do të ngrinte njoftimin "Sesioni mbaroi" mbi
       një dalje që e kërkoi vetë përdoruesi. */
    dalaVullnetare.current = true;
    try {
      await auth.signOut();
      setAccount(null);
      setAdminView(false);
    } finally {
      dalaVullnetare.current = false;
    }
  }, []);

  /**
   * NJË LLOGARI — NJË PAJISJE.
   *
   * Serveri e refuzon token-in e vjetër sapo llogaria hapet diku tjetër
   * (`session_replaced`). Këtu ajo përgjigje kthehet në dalje të plotë: pa
   * këtë, aplikacioni do të mbetej i hapur në pamje, me çdo kërkesë që
   * dështon në heshtje — më keq se një dalje e qartë.
   */
  /**
   * TOKEN-I I HUMBUR ËSHTË DALJE, JO HESHTJE.
   *
   * ⚠️  Kjo ishte vrima që nxori "Mungon token-i i hyrjes." te paywall-i
   *     (18 nëntor 2026). `services/api` e heq token-in te ÇDO 401 — i
   *     skaduar, i pavlefshëm, llogari e fshirë — por vetëm njëri prej tyre,
   *     `session_replaced`, e njoftonte këtë ekran. Për të gjitha të tjerat
   *     token-i zhdukej dhe `account` mbetej te ruajtja.
   *
   *     Pasoja: `App.jsx` sheh `hasAccount === true`, nuk e tregon
   *     `AuthScreen`, dhe aplikacioni duket plotësisht i futur — ndërsa çdo
   *     kërkesë e mbrojtur shkon pa `Authorization` dhe kthen 401. Përdoruesi
   *     shtyp "Fillo provën 3-ditore falas" dhe merr një mesazh serveri që
   *     nuk i thotë asgjë, pa asnjë rrugë përpara.
   *
   *     Tani humbja e token-it e kthen ekranin te hyrja, me arsyen përpara
   *     syve. `session_replaced` mbetet veç: ai fiket pas këtij dhe e
   *     mbishkruan njoftimin e përgjithshëm me arsyen e vërtetë — rendi te
   *     `request()` është `clearToken()` para `announceSessionEnded()`.
   */
  useEffect(() => {
    return onTokenChange((value) => {
      if (value || dalaVullnetare.current) return;
      setSessionNotice("Sesioni mbaroi. Hyr sërish për të vazhduar.");
      setAccount(null);
      setAdminView(false);
      storage.remove(STORAGE_KEYS.account);
      setSubscription(null);
      storage.remove(STORAGE_KEYS.subscription);
    });
  }, []);

  useEffect(() => {
    return onSessionEnded((reason) => {
      setSessionNotice(reason ?? "Llogaria u hap në një pajisje tjetër.");
      setAccount(null);
      setAdminView(false);
      storage.remove(STORAGE_KEYS.account);
      /* Edhe abonimi: përndryshe gjendja e vjetër do të mbetej në ekran pa
         asnjë server që ta mbishkruajë. (`setSubscription` drejtpërdrejt —
         `persistSubscription` deklarohet më poshtë se ky efekt.) */
      setSubscription(null);
      storage.remove(STORAGE_KEYS.subscription);
    });
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
      if (cancelled) return;
      persistSubscription(fromServer(state));
      /*
       * ⚠️  LEXOHET VEÇMAS NGA `fromServer`, dhe duhet. Ajo kthen `null` për
       *     një llogari pa abonim — pikërisht llogaritë që e shohin paywall-in
       *     dhe që kanë më shumë nevojë ta dinë nëse pagesat punojnë. Po ta
       *     fusnim brenda regjistrimit të abonimit, flamuri do të humbiste
       *     saktësisht aty ku shfrytëzohet.
       */
      setPaymentsReady(Boolean(state?.paymentsReady));
    });
    return () => {
      cancelled = true;
    };
  }, [ready, account, persistSubscription]);

  /**
   * Kthimi nga Stripe, pasi pagesa mbaroi.
   *
   * ⚠️  RRJEDH VETËM NJË HERË, dhe kjo është e qëllimshme. `confirmReturn` e
   *     pastron adresën me `replaceState`, ndaj një rrjedhje e dytë nuk do të
   *     gjente asgjë — por do të ishte një kërkesë e kotë te çdo ndryshim
   *     llogarie. Lista bosh e varësive e mban te hapja e faqes, ku edhe duhet.
   *
   * ⚠️  NUK ËSHTË I VETMI VEND KU HAPET AKSESI, dhe nuk duhet të jetë. Njeriu
   *     mund ta mbyllë skedën para kthimit, ose rrjeti mund të bjerë pikërisht
   *     atëherë. Webhook-u i Stripe-it e shkruan gjendjen pavarësisht nga kjo;
   *     kjo rrugë thjesht e bën të dukshme menjëherë, që ekrani të mos i thotë
   *     "nuk ke abonim" dikujt që sapo pagoi.
   */
  useEffect(() => {
    let cancelled = false;

    billing.confirmReturn().then(({ state, outcome }) => {
      if (cancelled || !outcome) return;

      if (state) persistSubscription(fromServer(state));

      /*
       * `pending`: Stripe e pranoi pagesën, por konfirmimi ynë nuk mbërriti në
       * kohë. Lexohet sërish pas pak — pa këtë, njeriu do të shihte paywall-in
       * për disa sekonda menjëherë pas pagesës.
       */
      if (outcome === "pending") {
        setTimeout(() => {
          billing.current().then((fresh) => {
            if (!cancelled) persistSubscription(fromServer(fresh));
          });
        }, 4000);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const completeOnboarding = useCallback(
    ({ name, reminders }) => {
      const chosen = reminders ?? defaultReminders();
      const record = {
        name: name.trim(),
        reminders: chosen,
        createdAt: new Date().toISOString(),
        /* Email-i shkruhet bashkë me profilin, që në hyrjen e radhës të dihet
           nëse ky profil i takon vërtet asaj llogarie. */
        email: account?.email ?? null,
      };
      setProfile(record);
      storage.set(STORAGE_KEYS.onboarding, record);
      /* Trigger-i i regjistrimit i krijon të tria TË FIKURA; pa këtë shkrim,
         zgjedhja e onboarding-ut nuk do të mbërrinte kurrë te cron-i. */
      saveReminders(null, chosen);

      /*
       * Emri dhe flamuri shkojnë edhe te llogaria, jo vetëm te pajisja.
       *
       * ⚠️  Kjo është gjysma tjetër e rikthimit te `adoptAccount`: aty profili
       *     ndërtohet nga `account.onboarded`, dhe ai flamur nuk ekziston pa
       *     këtë shkrim. Pa të, hyrja e radhës nga një pajisje tjetër do të
       *     niste sërish nga "Mirë se erdhe".
       */
      auth.saveProfile({ name: record.name }).then((updated) => {
        if (updated) setAccount(updated);
      });
    },
    [account]
  );

  const updateReminders = useCallback((reminders) => {
    setProfile((prev) => {
      if (!prev) return prev;
      /* Serveri merr vetëm çastin që ndryshoi — shih `services/reminders`. */
      saveReminders(prev.reminders, reminders);
      const next = { ...prev, reminders };
      storage.set(STORAGE_KEYS.onboarding, next);
      return next;
    });
  }, []);

  /**
   * Pajtimi i kujtesave me serverin — një herë për llogari.
   *
   * ⚠️  Një herë, jo sa herë ndryshojnë: çdo ndryshim i përdoruesit shkruhet
   *     tashmë nga `updateReminders`. Pa këtë kufi, pajtimi do të rrjedhte
   *     sërish pas çdo shkrimi të vetin dhe do të bënte një cikël kërkesash.
   *
   * Është mbërthyer te email-i i llogarisë: dalja dhe hyrja me një llogari
   * tjetër duhet ta rinisë, përndryshe përdoruesi i dytë do të mbetej me
   * kujtesat e të parit.
   */
  const syncedFor = useRef(undefined);

  useEffect(() => {
    if (!ready || !account || !profile) return;
    if (syncedFor.current === account.email) return;
    syncedFor.current = account.email;

    let cancelled = false;
    syncReminders(profile.reminders).then((effective) => {
      if (cancelled || !effective) return;
      setProfile((prev) => {
        if (!prev || JSON.stringify(prev.reminders) === JSON.stringify(effective)) return prev;
        const next = { ...prev, reminders: effective };
        storage.set(STORAGE_KEYS.onboarding, next);
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [ready, account, profile]);

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
       * ⚠️  TE FAQJA, PROVA NIS ME KARTË — pra kalon nga e njëjta rrugë si
       *     pagesa (kërkesë e klientes, 19 nëntor 2026).
       *
       *     Stripe e hap abonimin me `trial_period_days: 3`: tri ditët janë
       *     falas, karta regjistrohet që në fillim dhe tarifohet ditën e
       *     katërt vetëm nëse nuk është anuluar. Serveri e shton provën vetëm
       *     kur `trial_used_at` është bosh, ndaj ky buton nuk ka si të japë dy
       *     prova.
       *
       *     Prova pa kartë (`/subscription/trial`) mbetet për ato ndërtime ku
       *     Stripe nuk lejohet të hyjë — sot vetëm Android-i i paketuar. Te
       *     iOS-i u hap me vendim të klientes (23 nëntor 2026); arsyet dhe
       *     rreziku janë shkruar te `services/billing.stripeLejohet`.
       */
      if (billing.stripeLejohet()) {
        const bought = await billing.purchase(planId, { skipTrial: false });

        /*
         * ⚠️  RËNIA TE PROVA PA KARTË KUR STRIPE ENDE NUK ËSHTË VENDOSUR.
         *
         *     Çelësat e Stripe-it vijnë pasi të regjistrohet kompania jashtë
         *     Shqipërisë — javë, jo ditë (19 nëntor 2026). Pa këtë rresht,
         *     ngarkimi i faqes do ta prishte provën falas për këdo që e përdor
         *     sot: butoni do të kthente "Pagesat nuk janë aktivizuar ende" në
         *     vend që të jepte tri ditët, siç bën tani.
         *
         *     `notConfigured` e jep serveri me `501`, jo ne — pra sapo çelësat
         *     të vendosen, kjo rrugë pushon vetvetiu dhe prova nis të kërkojë
         *     kartën, pa prekur asnjë rresht kodi.
         *
         *     ⚠️  HIQET kur Stripe të jetë i gjallë te prodhimi. Deri atëherë
         *         është e vetmja gjë që mban një paywall funksional.
         */
        if (!bought.notConfigured) {
          if (bought.ok && bought.state) persistSubscription(fromServer(bought.state));
          return bought;
        }
      }

      const result = await billing.startTrial(planId);
      if (result.ok) persistSubscription(fromServer(result.state));
      /* Nëse prova është konsumuar, rruga e vetme mbetet dyqani. */
      else if (result.used) persistSubscription(fromServer(await billing.current()));
      return result;
    },
    [persistSubscription]
  );

  /**
   * Shlyen një kod të muajit falas.
   *
   * E ndarë nga `subscribe` me qëllim: ajo nis provën 3-ditore dhe e shënon
   * atë si të përdorur. Kodi nuk e prek provën — janë dy dhurata të ndryshme,
   * dhe ngatërrimi do t'ia hiqte njërën pa e thënë kurrë.
   */
  const redeemPromo = useCallback(
    async (code) => {
      const result = await billing.redeemPromo(code);
      if (result.ok) persistSubscription(fromServer(result.state));
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
      /* ⚠️  `skipTrial` E DALLON NGA `subscribe`, dhe kjo është e gjithë pika.
             «Paguaj tani» do të thotë tarifim sot. Pa këtë, serveri e shihte
             si të njëjtën kërkesë me provën dhe jepte tri ditë falas — një
             klientes i doli «Rinovohet pas 3 ditë» në vend të një muaji. */
      const result = await billing.purchase(planId, { skipTrial: true });
      /* ⚠️  `result.state` KONTROLLOHET VEÇ. Me arkën brenda fletës, `ok` do
             të thotë "seanca u hap", jo "u pagua" — gjendja vjen më pas, nga
             `confirmCheckout`. Pa këtë kusht, `fromServer(undefined)` do të
             fshinte abonimin e dikujt që sapo shtypi butonin. */
      if (result.ok && result.state) persistSubscription(fromServer(result.state));
      return result;
    },
    [persistSubscription]
  );

  /**
   * Mbyllja e arkës: lexon gjendjen e re dhe e shkruan.
   *
   * ⚠️  NUK ËSHTË BURIMI I VËRTETË. Webhook-u i Stripe-it e shkruan abonimin
   *     edhe nëse kjo kërkesë dështon ose faqja mbyllet. Kjo vetëm e heq
   *     pritjen nga ekrani — pa të, njeriu që sapo pagoi do të shihte
   *     paywall-in edhe për disa sekonda.
   */
  const confirmCheckout = useCallback(
    async (sessionId) => {
      const { state, outcome } = await billing.confirmSession(sessionId);
      if (state) persistSubscription(fromServer(state));

      if (outcome === "pending") {
        setTimeout(() => {
          billing.current().then((fresh) => persistSubscription(fromServer(fresh)));
        }, 4000);
      }
      return outcome;
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

  /** Pastrim i plotë i pajisjes — llogaria, profili dhe abonimi. */
  const logout = useCallback(async () => {
    await auth.signOut();
    setAccount(null);
    setProfile(null);
    persistSubscription(null);
    setAdminView(false);
    storage.remove(STORAGE_KEYS.onboarding);
  }, [persistSubscription]);

  /**
   * Fshirje e llogarisë — e pakthyeshme.
   *
   * ⚠️  Gjendja e React-it riniset VETËM pasi serveri e ka kryer fshirjen.
   *     Nëse fjalëkalimi nuk përputhet, asgjë nuk preket dhe ekrani e tregon
   *     gabimin; përndryshe përdoruesi do të dilte nga llogaria pa e fshirë.
   */
  const deleteAccount = useCallback(
    async (password) => {
      dalaVullnetare.current = true;
      let result;
      try {
        result = await auth.deleteAccount(password);
      } finally {
        dalaVullnetare.current = false;
      }
      if (!result.ok) return result;

      setAccount(null);
      setProfile(null);
      persistSubscription(null);
      setAdminView(false);
      return result;
    },
    [persistSubscription]
  );

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
   * ⚠️  SERVERI FITON, EDHE TE EMRI I GJENDJES, jo vetëm te aksesi.
   *
   *     Më parë mbishkruhej vetëm `isPremium`, dhe `status` mbetej ai i
   *     llogaritur lokalisht. Por `describeSubscription` nuk e di kurrë se një
   *     abonim ka mbaruar: pa një anulim të shënuar, ai e quan "active" çdo
   *     regjistrim pasi prova mbaron — sepse supozon se faturimi vazhdon.
   *
   *     Pasoja u pa te prodhimi (8 tetor 2026): profili shkruante "Premium
   *     aktiv" për një llogari që serveri e kishte `expired` që prej 14
   *     shtatorit, dhe meditimi i parë që prekej kthente 402. Dy numra për të
   *     njëjtën gjë, dhe ai që lexohej ishte i gabuari.
   *
   *     Tani kur serveri ka folur, merret EDHE statusi i tij. Llogaritja
   *     lokale mbetet vetëm për pamjen (ditët e mbetura, data e rinovimit) dhe
   *     për rastin kur serveri nuk është arritur ende.
   */
  const status = useMemo(() => {
    const local = describeSubscription(subscription);
    if (typeof subscription?.serverIsPremium !== "boolean") return local;

    /*
     * ⚠️  FJALA E SERVERIT NUK VLEN MË GJATË SE DATA QË DHA VETË AI.
     *
     *     `serverIsPremium` është një `true` i ruajtur te pajisja, nga hera e
     *     fundit që serveri u arrit. Pa kufi kohor, ai `true` nuk skadon kurrë:
     *     mjaftonte të shkarkoheshin meditimet, të hiqej interneti, dhe
     *     abonimi i mbaruar vazhdonte të hapte gjithçka — sepse `billing.current()`
     *     dështon pa rrjet dhe vlera e vjetër mbetet ashtu siç ishte.
     *
     *     Kjo ishte vrima që kërkoi klientja të mbyllet (17 nëntor 2026): të
     *     shkarkuarat hapeshin pa internet edhe pasi abonimi kishte mbaruar.
     *
     *     Tani `endsAt` — data që e dërgoi po ai server — e pret vetë atë
     *     besim. Pa rrjet, aksesi mbaron saktësisht kur mbaron abonimi.
     *
     * ⚠️  DY DITË DUROHEN ME QËLLIM.
     *
     *     Një abonent që paguan dhe është pa internet ditën e rinovimit nuk
     *     duhet mbyllur jashtë për diçka që e ka blerë. Dy ditë i mjaftojnë
     *     çdo rilidhjeje të zakonshme, dhe nuk i mjaftojnë askujt si model
     *     përdorimi falas.
     */
    const DUROJ_MS = 2 * 24 * 60 * 60 * 1000;
    const fundi = subscription.endsAt ? new Date(subscription.endsAt).getTime() : NaN;
    const skaduar = Number.isFinite(fundi) && Date.now() > fundi + DUROJ_MS;

    return {
      ...local,
      isPremium: subscription.serverIsPremium && !skaduar,
      status: skaduar ? "expired" : subscription.serverStatus ?? local.status,
    };
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

      sessionNotice,
      signIn,
      signUp,
      completeVerification,
      completeReset,
      signOut,
      deleteAccount,

      subscription,
      paymentsReady,
      /* Gjendja e vërtetë e abonimit — e paprekur nga rregulli i admin-it më
         poshtë, që karta e abonimit të mos i thotë adminit se ka blerë diçka. */
      subscriptionStatus: status,
      /**
       * A është përmbajtja e hapur.
       *
       * ⚠️  Admini e ka gjithmonë të hapur, pa abonim. Ai e ndërton vetë
       *     përmbajtjen dhe duhet ta shohë ashtu siç e sheh përdoruesi me
       *     abonim; një paywall mbi punën e vet do të ishte i pakuptimtë.
       *
       * ⚠️  Kjo është VETËM pamje. Porta e vërtetë rri te serveri
       *     (`canAccessAudio` te `api/src/auth.js`), i cili lexon `is_admin`
       *     nga databaza. Pa atë ndryshim, ndërtuesi do të hapej këtu dhe
       *     dëgjimi do të dështonte me `402` — pra kyçja duhej hequr te të dyja
       *     anët, jo vetëm te kjo.
       */
      isPremium: status.isPremium || canAdmin,

      subscribe,
      redeemPromo,
      purchasePlan,
      confirmCheckout,
      restorePurchases,
      cancelSubscription,
      resumeSubscription,

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
      sessionNotice,
      signIn,
      signUp,
      completeVerification,
      completeReset,
      signOut,
      deleteAccount,
      subscription,
      paymentsReady,
      status,
      subscribe,
      redeemPromo,
      purchasePlan,
      confirmCheckout,
      restorePurchases,
      cancelSubscription,
      resumeSubscription,
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
