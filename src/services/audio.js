import { api, ApiError, hasToken } from "./api.js";
import { isDatabaseId } from "../lib/ids.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  AUDIO — lidhja e nënshkruar dhe shkarkimi
 * ═══════════════════════════════════════════════════════════════
 *
 * `audio_url` nuk kthehet nga asnjë rrugë e përmbajtjes. Skedari jepet vetëm
 * nga `GET /audio/:id`, pasi serveri kontrollon abonimin, si lidhje e
 * nënshkruar që skadon pas një ore dhe që përmban edhe `userId` — një lidhje e
 * kopjuar nuk vlen për llogari tjetër.
 *
 * ⚠️  SKEDARËT AUDIO ENDË NUK EKZISTOJNË.
 *     Meditimet janë futur me një rrugë të planifikuar
 *     (`meditime/<teknika>/<titulli>.mp3`), ndaj serveri e nënshkruan lidhjen
 *     me dëshirë, por marrja e saj kthen 404. Kjo dallohet dhe raportohet si
 *     `missing` — jo si "gabim i panjohur", që do ta linte përdoruesin të
 *     mendonte se aplikacioni është i prishur.
 */

/** Arsyet e dështimit, që thirrësi të zgjedhë mesazhin e duhur. */
export const REASON = {
  AUTH: "auth",
  PREMIUM: "premium",
  MISSING: "missing",
  LOCAL: "local",
  OFFLINE: "offline",
};

export const REASON_TEXT = {
  [REASON.AUTH]: "Hyr në llogari për të shkarkuar.",
  [REASON.PREMIUM]: "Ky meditim kërkon abonim.",
  [REASON.MISSING]: "Audio ende nuk është ngarkuar.",
  [REASON.LOCAL]: "Ky meditim nuk është ende te serveri.",
  [REASON.OFFLINE]: "Nuk u lidhëm me serverin.",
};

/**
 * Kërkon lidhjen e nënshkruar për një meditim.
 *
 * @returns {Promise<{ ok: true, url: string } | { ok: false, reason: string }>}
 */
export async function fetchAudioUrl(meditationId) {
  if (!isDatabaseId(meditationId)) return { ok: false, reason: REASON.LOCAL };
  if (!hasToken()) return { ok: false, reason: REASON.AUTH };

  try {
    const data = await api.get(`/audio/${encodeURIComponent(meditationId)}`);
    return data?.url ? { ok: true, url: data.url } : { ok: false, reason: REASON.MISSING };
  } catch (err) {
    if (err instanceof ApiError) {
      /* 402 është kodi që serveri përdor për "kërkon abonim" — aplikacioni e
         njeh dhe hap paywall-in, në vend që të tregojë një gabim. */
      if (err.status === 402) return { ok: false, reason: REASON.PREMIUM };
      if (err.status === 401) return { ok: false, reason: REASON.AUTH };
      if (err.status === 404) return { ok: false, reason: REASON.MISSING };
      if (err.status === 0) return { ok: false, reason: REASON.OFFLINE };
    }
    return { ok: false, reason: REASON.MISSING };
  }
}

/** Emër skedari i sigurt nga titulli shqip. */
function fileName(title) {
  const base = (title || "meditim")
    .replace(/[ëË]/g, "e")
    .replace(/[çÇ]/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${base || "meditim"}.mp3`;
}

/**
 * Shkarkon vërtet skedarin.
 *
 * Merret si `blob` dhe jo thjesht duke hapur lidhjen, për dy arsye: emri i
 * skedarit vendoset nga ne (përndryshe do të ruhej me hash-in e nënshkrimit),
 * dhe një lidhje që kthen 404 do të hapte një skedë bosh në vend që të thoshte
 * çfarë ndodhi.
 *
 * @returns {Promise<{ ok: true, name: string } | { ok: false, reason: string }>}
 */
export async function downloadAudio(item) {
  const link = await fetchAudioUrl(item?.id);
  if (!link.ok) return link;

  let response;
  try {
    response = await fetch(link.url);
  } catch {
    return { ok: false, reason: REASON.OFFLINE };
  }

  /* Skedari nuk është ngarkuar ende te serveri — rasti i pritshëm sot. */
  if (!response.ok) return { ok: false, reason: REASON.MISSING };

  const blob = await response.blob();
  const name = fileName(item?.title);

  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  /* Lirohet pasi shfletuesi e ka marrë — pa këtë, blob-i mbetet në kujtesë. */
  setTimeout(() => URL.revokeObjectURL(href), 1000);

  return { ok: true, name };
}
