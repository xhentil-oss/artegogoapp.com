/**
 * ═══════════════════════════════════════════════════════════════
 *  IDENTIFIKUESI I PAJISJES
 * ═══════════════════════════════════════════════════════════════
 *
 * Një varg i rastësishëm, i krijuar një herë te kjo pajisje dhe i mbajtur
 * përgjithmonë. Nuk përmban asgjë për njeriun: as emër, as email, as model
 * telefoni — vetëm një UUID që do të thotë "ky instalim".
 *
 * Përdoret për një gjë të vetme: që prova 3-ditore të mos rinisë me çdo email
 * të ri te i njëjti telefon. Shih `mysql/119_prova_njehere_per_pajisje.sql`.
 *
 * ⚠️  NUK RUHET ME PREFIKSIN `artegogo:` DHE KJO ËSHTË ME QËLLIM.
 *
 *     `storage.clearAll()` fshin çdo çelës me atë prefiks, dhe thirret te
 *     fshirja e llogarisë. Po ta ndante prefiksin, "fshi llogarinë → hap një
 *     tjetër" do ta rikthente provën — pra pikërisht vrima që po mbyllim.
 *
 * ⚠️  KJO ËSHTË PENGESË, JO MUR.
 *
 *     Çinstalimi i aplikacionit ose pastrimi i të dhënave të shfletuesit e
 *     fshin. Ndalon rastin e zakonshëm — i njëjti telefon, pesë adresa — jo
 *     dikë që di ç'bën. Muri i vërtetë është gjurma e kartës, dhe ajo kërkon
 *     një shërbim pagese; serveri e pret tashmë te `kind='card'`.
 */

/** Jashtë prefiksit të aplikacionit — shih shënimin më lart. */
const KEY = "ndiej:pajisja";

/** UUID i vërtetë kur shfletuesi e ka; përndryshe një i barasvlershëm. */
function uuid() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    /* `getRandomValues` ekziston edhe te shfletuesit pa `randomUUID`. */
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    /* bie te rruga e fundit */
  }
  /* Rruga e fundit: koha + rastësia e thjeshtë. Më e dobët, por asnjëherë bosh. */
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

/* Kujtesa e brendshme: leximi nga `localStorage` ndodh një herë për seancë. */
let cached = null;

/**
 * Identifikuesi i kësaj pajisjeje. E krijon nëse nuk ekziston.
 *
 * @returns {string|null} `null` kur ruajtja nuk lexohet fare (modalitet
 *   privat i bllokuar) — dhe atëherë serveri thjesht nuk e kontrollon
 *   pajisjen. Një provë e dhënë është më pak e keqe se një përdorues i vërtetë
 *   i mbyllur jashtë pa shkak.
 */
export function deviceId() {
  if (cached) return cached;
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) {
      cached = saved;
      return cached;
    }
    const fresh = uuid();
    window.localStorage.setItem(KEY, fresh);
    cached = fresh;
    return cached;
  } catch {
    return null;
  }
}
