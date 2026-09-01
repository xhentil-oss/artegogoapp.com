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
 * @returns {Promise<{ ok: boolean, state?: object, error?: string, used?: boolean }>}
 */
export async function startTrial(planId = "year") {
  try {
    const state = await api.post("/me/subscription/trial", { planId });
    return { ok: true, state, planId, store: detectStore() };
  } catch (err) {
    /* 409 = prova është përdorur më parë. Nuk është gabim, është fakt. */
    if (err instanceof ApiError && err.status === 409) {
      return { ok: false, used: true, error: err.message };
    }
    return { ok: false, error: err?.message ?? "Nuk u nis dot prova." };
  }
}

/**
 * Blerje e vërtetë përmes dyqanit.
 *
 * Rendi është ai që kërkon seksioni 8: dyqani jep faturën, serveri e verifikon,
 * dhe VETËM pastaj hapet aksesi. Aplikacioni nuk e shkruan kurrë vetë.
 *
 * ⚠️  Sot serveri kthen `501 not_configured`, sepse kredencialet e Apple/Google
 *     nuk janë vendosur ende — dhe `src/storeVerify.js` dështon i mbyllur me
 *     qëllim. Prova falas mbetet rruga e vetme drejt aksesit deri atëherë.
 *
 * @returns {Promise<{ ok: boolean, state?: object, error?: string, notConfigured?: boolean }>}
 */
export async function purchase(planId) {
  const store = detectStore();

  /* PROD: këtu thirret StoreKit / Play Billing dhe merret fatura e vërtetë. */
  const receipt = null;

  if (!receipt) {
    return {
      ok: false,
      notConfigured: true,
      store,
      error: "Pagesat kalojnë përmes App Store / Google Play — jo te versioni web.",
    };
  }

  try {
    const state = await api.post("/me/subscription/verify", { store, receipt, planId });
    return { ok: true, state, planId, store };
  } catch (err) {
    if (err instanceof ApiError && err.status === 501) {
      return { ok: false, notConfigured: true, store, error: err.message };
    }
    return { ok: false, store, error: err?.message ?? "Blerja nuk u verifikua." };
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
