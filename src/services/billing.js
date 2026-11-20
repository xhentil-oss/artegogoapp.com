/**
 * PAGESAT — kufiri me dyqanet e aplikacioneve.
 *
 * Kutia "Zbatimi teknik i pagesave" e seksionit 8 është e prerë:
 *   · abonimi duhet të kalojë përmes In-App Purchase të Apple (StoreKit) dhe
 *     Google Play Billing — të dy dyqanet e kërkojnë për përmbajtje dixhitale;
 *   · anulimi bëhet nga cilësimet e sistemit të telefonit, JO brenda
 *     aplikacionit — ky është standard i Apple/Google;
 *   · backend-i duhet të verifikojë faturat (receipt validation) dhe të mbajë
 *     statusin premium të përdoruesit.
 *
 * Ky prototip është web: StoreKit dhe Play Billing nuk ekzistojnë këtu, ndaj
 * blerja simulohet. Por çdo blerje kalon nga kjo pikë e vetme. Kur aplikacioni
 * të paketohet (Capacitor ose React Native), ndryshon vetëm brendia e
 * `purchase()` dhe `restore()` — asnjë ekran.
 *
 * ⚠️  E VËRTETA ËSHTË TE DATABAZA, JO TE PAJISJA.
 *     Çdo funksion këtu pyet ose shkruan te serveri. Më parë abonimi ruhej te
 *     `localStorage`, ndaj kushdo që hapte DevTools bëhej premium — dhe aksesi
 *     humbte sapo ndërrohej pajisja.
 */

import { api, ApiError } from "./api.js";
import { deviceId } from "./device.js";

export const STORES = {
  APPLE: "appstore",
  GOOGLE: "googleplay",
};

export const STORE_LABEL = {
  [STORES.APPLE]: "App Store",
  [STORES.GOOGLE]: "Google Play",
};

/**
 * Cili dyqan i takon kësaj pajisjeje.
 *
 * Teksti i anulimit duhet të përmendë dyqanin e saktë — një udhëzim për
 * App Store-in te një telefon Android e dërgon përdoruesin në vend të gabuar.
 * iPad-at e rinj raportohen si "Macintosh" me prekje, ndaj kontrollohet edhe
 * numri i pikave të prekjes.
 */
export function detectStore() {
  if (typeof navigator === "undefined") return STORES.APPLE;

  const ua = navigator.userAgent ?? "";
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = /Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1;

  return iOS || iPadOS ? STORES.APPLE : STORES.GOOGLE;
}

/** Rruga ku përdoruesi e anulon vërtet abonimin, sipas pajisjes. */
export function cancelPath(store = detectStore()) {
  return `Cilësimet → Abonimet në ${STORE_LABEL[store]}`;
}

/**
 * Nis provën 3-ditore falas.
 *
 * ⚠️  Datat i llogarit SERVERI (`POST /me/subscription/trial`), jo aplikacioni.
 *     Një `endsAt` i dërguar nga klienti do të thoshte provë e përjetshme me
 *     një kërkesë të vetme — dhe serveri e refuzon rinisjen, sepse mban
 *     `trial_used_at`.
 *
 * ⚠️  Dërgohet edhe identifikuesi i pajisjes, sepse `trial_used_at` rri mbi
 *     LLOGARINË — dhe një llogari e re është falas. Pa të, tri ditët merreshin
 *     sa herë të doje, me një adresë të re. Serveri e hash-on dhe mban vetëm
 *     hash-in; shih `services/device.js`.
 *
 * @returns {Promise<{ ok: boolean, state?: object, error?: string, used?: boolean }>}
 */
export async function startTrial(planId = "year") {
  try {
    const state = await api.post("/me/subscription/trial", {
      planId,
      deviceId: deviceId(),
    });
    return { ok: true, state, planId, store: detectStore() };
  } catch (err) {
    /* 409 = prova është përdorur më parë. Nuk është gabim, është fakt.
       `device` e dallon "kjo llogari e ka marrë" nga "kjo pajisje e ka marrë":
       e para zgjidhet me abonim, e dyta edhe me hyrje te llogaria e parë. */
    if (err instanceof ApiError && err.status === 409) {
      return {
        ok: false,
        used: true,
        device: err.code === "trial_device_used",
        error: err.message,
      };
    }
    return { ok: false, error: err?.message ?? "Nuk u nis dot prova." };
  }
}

/**
 * Shlyen një kod të muajit falas (5 dhjetor 2026 – 5 janar 2027).
 *
 * ⚠️  Kodi NUK kontrollohet këtu, as lista e tij nuk ekziston te aplikacioni.
 *     Treqind kode të shkruara brenda paketës do të ishin treqind kode publike:
 *     çdo shfletues e sheh kodin burimor. Të vetmit që i dinë janë serveri dhe
 *     njerëzit që i kanë marrë.
 *
 * @returns {Promise<{ ok: boolean, state?: object, error?: string }>}
 */
export async function redeemPromo(code) {
  const pastruar = String(code ?? "").trim().toUpperCase();
  if (!pastruar) return { ok: false, error: "Shkruaj kodin." };

  try {
    const state = await api.post("/me/subscription/promo", { code: pastruar });
    return { ok: true, state };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Kodi nuk u pranua." };
  }
}

/**
 * A po ekzekutohemi brenda aplikacionit të paketuar (Capacitor)?
 *
 * ⚠️  NDAN DY BOTË PAGESASH, JO DY PAMJE.
 *
 *     Google Play dhe App Store e kërkojnë që abonimet dixhitale të
 *     konsumuara brenda aplikacionit të kalojnë nga faturimi i tyre. Një
 *     aplikacion që hap Stripe-in brenda vetes hiqet nga dyqani. Pra Stripe
 *     vlen për faqen, dhe vetëm për të.
 */
export const isNative = () =>
  typeof window !== "undefined" && Boolean(window.Capacitor?.isNativePlatform?.());

/**
 * Hap seancën e pagesës.
 *
 * Dy rrugë, sipas vendit ku ndodhemi:
 *
 *   · FAQJA  → Stripe Checkout, i vizatuar BRENDA fletës — shih `mountCheckout`.
 *   · APP-I  → StoreKit / Play Billing. Ende e pakonfiguruar, dhe butoni e
 *              thotë në vend që të dështojë në heshtje.
 *
 * ⚠️  ASNJË SHIFËR KARTE NUK E PREK KODIN TONË, DHE KJO ËSHTË E QËLLIMSHME.
 *     Fushat duken brenda aplikacionit, por janë një kornizë e mbyllur e
 *     Stripe-it, nën domenin e tij; JavaScript-i ynë nuk i lexon dot. Po t'i
 *     mblidhnim vetë — qoftë edhe vetëm për t'ia dërguar atij — do të hynim nën
 *     detyrimet e plota PCI-DSS, me auditim vjetor dhe përgjegjësi ligjore për
 *     çdo rrjedhje.
 *
 * ⚠️  AKSESI NUK HAPET KËTU. Kthehet vetëm një `client_secret` me të cilin
 *     vizatohet arka. Gjendja vjen nga serveri pas konfirmimit — shih
 *     `confirmSession` dhe webhook-un.
 *
 * ⚠️  `skipTrial` NUK ËSHTË ZBUKURIM. Serveri nuk e di dot nga gjendja cilin
 *     buton shtypi njeriu: «Fillo provën» dhe «Paguaj tani» kanë saktësisht
 *     të njëjtën gjendje para shtypjes. Pa këtë, «Paguaj tani» jepte tri ditë
 *     falas dhe nuk tarifonte asgjë (20 nëntor 2026).
 *
 * @param {string} planId
 * @param {{ skipTrial?: boolean }} [opsionet] `skipTrial` = paguaj menjëherë
 * @returns {Promise<{ ok: boolean, clientSecret?: string, sessionId?: string,
 *                     publishableKey?: string, skipTrial?: boolean,
 *                     error?: string, notConfigured?: boolean }>}
 */
export async function purchase(planId = "year", { skipTrial = false } = {}) {
  const store = detectStore();

  if (isNative()) {
    /* PROD: këtu thirret StoreKit / Play Billing dhe merret fatura e vërtetë,
       e cila pastaj shkon te `POST /me/subscription/verify`. */
    return {
      ok: false,
      notConfigured: true,
      store,
      error: `Pagesat te aplikacioni kalojnë përmes ${STORE_LABEL[store]}.`,
    };
  }

  try {
    const seanca = await api.post("/me/subscription/checkout", { planId, skipTrial });
    if (!seanca?.clientSecret || !seanca?.publishableKey) {
      return { ok: false, error: "Stripe nuk ktheu seancën e pagesës." };
    }
    return {
      ok: true,
      planId,
      skipTrial,
      clientSecret: seanca.clientSecret,
      sessionId: seanca.sessionId,
      publishableKey: seanca.publishableKey,
      testMode: Boolean(seanca.testMode),
    };
  } catch (err) {
    /*
     * ⚠️  `404` TRAJTOHET SI `501`, ME QËLLIM.
     *
     *     `501` do të thotë "serveri e njeh pagesën, por çelësat mungojnë".
     *     `404` do të thotë "ky server ende nuk e njeh fare këtë rrugë" — pra
     *     API-ja te cPanel-i nuk është ringarkuar. Për përdoruesin të dyja
     *     janë e njëjta gjë: pagesat nuk punojnë ende. Dhe duke i barazuar,
     *     faqja mund të ngarkohet para serverit pa e prishur provën falas.
     */
    if (err instanceof ApiError && (err.status === 501 || err.status === 404)) {
      return { ok: false, notConfigured: true, error: err.message };
    }
    return { ok: false, error: err?.message ?? "Pagesa nuk u hap." };
  }
}

/* ─────────────── arka brenda fletës ─────────────── */

/**
 * Sjell `stripe.js` dhe e mban të sjellë.
 *
 * ⚠️  NGARKOHET KUR DUHET, JO TE `index.html`.
 *
 *     Skripti i Stripe-it është mbi 100 KB dhe hap lidhje me domenin e tij.
 *     Shumica e njerëzve që hapin NDIEJ-in nuk e shohin kurrë paywall-in;
 *     t'ua ngarkonim të gjithëve do të thoshte të ngadalësonim nisjen e
 *     meditimit për hir të një ekrani që nuk vjen.
 *
 * ⚠️  DOMENI I STRIPE-IT, JO KOPJE E JONA. Skripti duhet marrë çdo herë nga
 *     `js.stripe.com`; një kopje e vetë-strehuar e nxjerr arkën jashtë
 *     mbulimit PCI të Stripe-it dhe nuk merr arnimet e sigurisë.
 */
let stripeJsPremtim = null;

export function loadStripeJs() {
  if (typeof window === "undefined") return Promise.reject(new Error("Pa shfletues."));
  if (window.Stripe) return Promise.resolve(window.Stripe);
  if (stripeJsPremtim) return stripeJsPremtim;

  stripeJsPremtim = new Promise((resolve, reject) => {
    const skript = document.createElement("script");
    skript.src = "https://js.stripe.com/v3/";
    skript.async = true;
    skript.onload = () =>
      window.Stripe
        ? resolve(window.Stripe)
        : reject(new Error("Stripe u ngarkua por nuk u nis."));
    skript.onerror = () => {
      /* Harrohet, që një rrjet i rënë të mos e bllokojë provën e dytë. */
      stripeJsPremtim = null;
      skript.remove();
      reject(new Error("Stripe nuk u ngarkua. Kontrollo lidhjen."));
    };
    document.head.appendChild(skript);
  });

  return stripeJsPremtim;
}

/**
 * Vizaton arkën brenda një elementi të faqes.
 *
 * @param {HTMLElement} node ku të vendoset korniza
 * @param {{ clientSecret: string, publishableKey: string, onComplete?: () => void }} opsionet
 * @returns {Promise<{ destroy: () => void }>} thirre `destroy` kur mbyllet fleta
 */
export async function mountCheckout(node, { clientSecret, publishableKey, onComplete }) {
  const Stripe = await loadStripeJs();
  const stripe = Stripe(publishableKey);
  const arka = await stripe.initEmbeddedCheckout({ clientSecret, onComplete });
  arka.mount(node);
  return arka;
}

/**
 * Konfirmon seancën sapo Stripe e mbyll arkën.
 *
 * ⚠️  NUK E ZËVENDËSON WEBHOOK-UN. Nëse kjo kërkesë bie — rrjeti, faqja e
 *     mbyllur — abonimi hapet gjithsesi, sepse Stripe ia dërgon serverit të
 *     njëjtën ngjarje. Kjo vetëm e shkurton pritjen te ekrani.
 *
 * @returns {Promise<{ state: object|null, outcome: "sukses"|"pending" }>}
 */
export async function confirmSession(sessionId) {
  if (!sessionId) return { state: null, outcome: "pending" };
  try {
    const state = await api.post("/me/subscription/checkout/confirm", { sessionId });
    return { state, outcome: state?.pending ? "pending" : "sukses" };
  } catch {
    return { state: null, outcome: "pending" };
  }
}

/* ─────────────── kthimi nga Stripe ─────────────── */

/** Emrat e parametrave që vendos vetë serveri te `success_url`. */
const KTHIMI = { flag: "pagesa", session: "seanca" };

/**
 * Pas pagesës: lexon adresën, konfirmon te serveri dhe e pastron adresën.
 *
 * ⚠️  NUK I BESON ADRESËS. `?pagesa=sukses` e shkruan dot kushdo te shiriti i
 *     adresës; ajo është vetëm shenjë se ia vlen të pyesim serverin. Aksesin e
 *     jep serveri pasi e lexon seancën te Stripe dhe sheh se i përket
 *     pikërisht kësaj llogarie.
 *
 * ⚠️  ADRESA PASTROHET GJITHMONË, edhe kur konfirmimi dështon. Përndryshe
 *     identifikuesi i seancës mbetet te shiriti, kopjohet bashkë me lidhjen
 *     dhe ndonjëherë përfundon te historiku i përbashkët i shfletuesit.
 *
 * @returns {Promise<{ state: object|null, outcome: "sukses"|"anuluar"|"pending"|null }>}
 */
export async function confirmReturn() {
  if (typeof window === "undefined") return { state: null, outcome: null };

  const params = new URLSearchParams(window.location.search);
  const flag = params.get(KTHIMI.flag);
  if (!flag) return { state: null, outcome: null };

  const sessionId = params.get(KTHIMI.session);

  /* Pastrimi bëhet para kërkesës: një rifreskim gjatë pritjes nuk duhet ta
     nisë konfirmimin për të dytën herë. */
  params.delete(KTHIMI.flag);
  params.delete(KTHIMI.session);
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
  );

  if (flag !== "sukses" || !sessionId) {
    return { state: null, outcome: flag === "anuluar" ? "anuluar" : null };
  }

  try {
    const state = await api.post("/me/subscription/checkout/confirm", { sessionId });
    /* `202` do të thotë se Stripe ende nuk e ka mbyllur; webhook-u do ta
       mbarojë punën vetë brenda pak sekondash. */
    return { state, outcome: state?.pending ? "pending" : "sukses" };
  } catch {
    /* Dështimi këtu nuk është humbje: webhook-u e shkruan gjendjen gjithsesi. */
    return { state: null, outcome: "pending" };
  }
}

/**
 * Hap panelin e faturimit të Stripe-it — kartë e re, fatura, anulim.
 *
 * Anulimi bëhet edhe brenda aplikacionit (`cancel`), siç kërkoi klientja. Ky
 * panel mbulon atë që ne nuk e bëjmë dot: ndërrimin e një karte të skaduar dhe
 * shkarkimin e faturave, që ligji ia njeh blerësit.
 */
export async function openPortal() {
  try {
    const { url } = await api.post("/me/subscription/portal");
    if (!url) return { ok: false, error: "Paneli nuk u hap." };
    window.location.assign(url);
    return { ok: true, redirecting: true };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Paneli nuk u hap." };
  }
}

/**
 * Rikthen një abonim ekzistues.
 *
 * Apple e kërkon si buton më vete në çdo paywall: një përdorues që ndërron
 * telefon duhet ta rifitojë aksesin pa paguar dy herë.
 *
 * Këtu kjo funksionon vërtet — abonimi rri te llogaria në databazë, jo te
 * pajisja. Pyetja "a ka kjo llogari abonim?" i drejtohet serverit, dhe
 * përgjigjja vlen te çdo telefon ku hyn i njëjti email.
 */
export async function restore() {
  try {
    const state = await api.get("/me/subscription");
    if (state?.isPremium) return { ok: true, state, planId: state.planId };
    return { ok: false, reason: "Nuk u gjet asnjë abonim aktiv për këtë llogari." };
  } catch (err) {
    return { ok: false, reason: err?.message ?? "Nuk u lidhëm me serverin." };
  }
}

/** Anulon rinovimin. Aksesi vazhdon deri në fund të periudhës së paguar. */
export async function cancel() {
  try {
    return { ok: true, state: await api.post("/me/subscription/cancel") };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Anulimi nuk u ruajt." };
  }
}

/** Rikthen rinovimin para se periudha të mbarojë. */
export async function resume() {
  try {
    return { ok: true, state: await api.post("/me/subscription/resume") };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Rikthimi nuk u ruajt." };
  }
}

/** Gjendja e tanishme, sipas databazës. */
export async function current() {
  try {
    return await api.get("/me/subscription");
  } catch {
    return null;
  }
}
