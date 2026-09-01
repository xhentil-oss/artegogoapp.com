/**
 * ═══════════════════════════════════════════════════════════════
 *  VERIFIKIMI I FATURAVE — Apple StoreKit dhe Google Play Billing
 * ═══════════════════════════════════════════════════════════════
 *
 * Seksioni 8 e kërkon shprehimisht: "Backend-i duhet të verifikojë faturat
 * (receipt validation) dhe të mbajë statusin premium të përdoruesit."
 *
 * ⚠️  KY MODUL DËSHTON I MBYLLUR, DHE KJO ËSHTË E QËLLIMSHME.
 *
 *     Pa kredencialet e dyqaneve, asnjë faturë nuk verifikohet dot. Zgjidhja
 *     "besoji klientit derisa të vijnë kredencialet" do të thoshte që kushdo
 *     mund të dërgonte një varg të shpikur dhe të merrte një vit falas — dhe
 *     ajo rrugë, sapo hapet, mbetet e hapur edhe pas vendosjes së çelësave,
 *     sepse askush nuk e kujton ta mbyllë.
 *
 *     Ndaj deri sa `APPLE_SHARED_SECRET` ose `GOOGLE_SERVICE_ACCOUNT` të
 *     vendosen, `verifyReceipt` kthen `not_configured` dhe abonimi NUK jepet.
 *     Prova 3-ditore mbetet rruga e vetme drejt aksesit — dhe atë e jep vetë
 *     serveri, pa u besuar askujt.
 *
 * KUR TË VENDOSEN KREDENCIALET, ndryshon vetëm ky skedar:
 *   Apple  → POST https://buy.itunes.apple.com/verifyReceipt  (me rënie te
 *            sandbox-i kur kthen statusin 21007 — Apple e kërkon këtë hap)
 *   Google → androidpublisher.purchases.subscriptions.get
 */

const RESULT = {
  NOT_CONFIGURED: "not_configured",
  INVALID: "invalid",
  EXPIRED: "expired",
  OK: "ok",
};

const STORES = { APPLE: "appstore", GOOGLE: "googleplay" };

/** A janë vendosur kredencialet për këtë dyqan? */
function configured(store) {
  if (store === STORES.APPLE) return Boolean(process.env.APPLE_SHARED_SECRET);
  if (store === STORES.GOOGLE) return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT);
  return false;
}

/**
 * Verifikon një faturë te dyqani.
 *
 * @param {{ store: string, receipt: string, productId?: string }} input
 * @returns {Promise<{ result: string, expiresAt?: Date, transactionId?: string, plan?: string }>}
 */
async function verifyReceipt({ store, receipt }) {
  if (!Object.values(STORES).includes(store)) return { result: RESULT.INVALID };
  if (!receipt || typeof receipt !== "string") return { result: RESULT.INVALID };

  if (!configured(store)) {
    /*
     * E vetmja rrugë kur nuk ka kredenciale. Nuk regjistrohet si gabim
     * serveri — nuk është defekt, është konfigurim që mungon.
     */
    return { result: RESULT.NOT_CONFIGURED };
  }

  /* Këtu hyn thirrja e vërtetë te dyqani. Deri atëherë, refuzim. */
  return { result: RESULT.INVALID };
}

module.exports = { verifyReceipt, RESULT, STORES, configured };
