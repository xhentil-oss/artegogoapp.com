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
 * `kind` është `"video"` kur meditimi ka figurë, `"audio"` përndryshe. Serveri
 * zgjedh njërën nga të dyja — kurrë të dyja njëherësh, sepse videoja e mban
 * zërin brenda vetes.
 *
 * @returns {Promise<{ ok: true, url: string, kind: string } | { ok: false, reason: string }>}
 */
export async function fetchAudioUrl(meditationId) {
  if (!isDatabaseId(meditationId)) return { ok: false, reason: REASON.LOCAL };
  if (!hasToken()) return { ok: false, reason: REASON.AUTH };

  try {
    const data = await api.get(`/audio/${encodeURIComponent(meditationId)}`);
    return data?.url
      ? { ok: true, url: data.url, kind: data.kind === "video" ? "video" : "audio" }
      : { ok: false, reason: REASON.MISSING };
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

/*
 * ⚠️  `downloadAudio()` U HOQ më 16 nëntor 2026.
 *
 *     Krijonte një `<a download>`, pra e ruante mp3-në te dosja "Downloads" e
 *     telefonit: jashtë aplikacionit, e dëgjueshme nga çdo player dhe e
 *     dërgueshme kujtdo. Klientja e kërkoi të kundërtën — kopja të rrijë
 *     brenda aplikacionit. Zëvendësuesi është `services/offlineAudio.js`.
 *
 *     Nuk u la "për çdo rast": një funksion i tillë, i harruar te skedari,
 *     kthehet në përdorim nga rrjedha e parë që kërkon "shkarkim".
 */
