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
 * ⚠️  Statusi premium që kthehet këtu është i besueshëm vetëm sa vetë pajisja.
 *     Në prodhim, e vërteta është te backend-i pas verifikimit të faturës;
 *     kjo shtresë vetëm e nis blerjen dhe i dorëzon faturën atij.
 */

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
 * Nis blerjen te dyqani.
 *
 * @param {string} planId
 * @returns {Promise<{ ok: boolean, planId: string, store: string, receipt: string }>}
 */
export async function purchase(planId) {
  const store = detectStore();

  /* PROD: këtu thirret StoreKit / Play Billing, pastaj fatura i dërgohet
     backend-it për verifikim përpara se aksesi të hapet. */
  return {
    ok: true,
    planId,
    store,
    receipt: `demo-${planId}`,
  };
}

/**
 * Rikthen një abonim ekzistues.
 *
 * Apple e kërkon si buton më vete në çdo paywall: një përdorues që ndërron
 * telefon duhet ta rifitojë aksesin pa paguar dy herë.
 */
export async function restore() {
  /* PROD: StoreKit `restorePurchases` / Play Billing `queryPurchases`. */
  return { ok: false, reason: "Nuk u gjet asnjë abonim aktiv për këtë llogari." };
}
