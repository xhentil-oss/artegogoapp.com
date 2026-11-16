import { fetchAudioUrl, REASON } from "./audio.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  SHKARKIMI BRENDA APLIKACIONIT
 * ═══════════════════════════════════════════════════════════════
 *
 * Butoni "Shkarko" NUK e ruan më skedarin te telefoni.
 *
 * ⚠️  Më parë krijonte një `<a download>`, pra mp3-ja shkonte te dosja
 *     "Downloads" e pajisjes: e dëgjueshme nga çdo player, e dërgueshme me
 *     WhatsApp, e kopjueshme kudo. Abonimi mbrohej vetëm deri te shkarkimi i
 *     parë. Kërkesë e klientes (16 nëntor 2026): meditimet ruhen BRENDA
 *     aplikacionit, që të dëgjohen pa internet dhe të mos dalin jashtë tij.
 *
 * Vendi i ruajtjes është Cache Storage — e njëjta kujtesë që përdor service
 * worker-i, e lidhur me origjinën e aplikacionit. Jashtë tij nuk shihet nga
 * asnjë program i pajisjes, dhe fshihet bashkë me të dhënat e aplikacionit.
 *
 * ⚠️  ÇELËSI NUK ËSHTË LIDHJA E NËNSHKRUAR.
 *
 *     Ajo mban `expires`, `u` dhe `sig`, pra ndryshon në çdo kërkesë: një
 *     `caches.match` me të nuk do të gjente kurrë asgjë. Prandaj përgjigjja
 *     ruhet nën një adresë të sajuar e të qëndrueshme, `/offline/audio/<id>`,
 *     që nuk i përgjigjet askush te serveri dhe shërben vetëm si çelës.
 *
 * ⚠️  `kind` ruhet si kokë e shpikur (`X-Ag-Kind`).
 *
 *     Meditimet me figurë vijnë si video, dhe player-i duhet ta dijë para se
 *     ta vendosë burimin. Po ta nxirrnim nga lloji MIME, një mp4 pa `kind`
 *     do të trajtohej si zë dhe figura nuk do të dukej.
 */

const CACHE = "ag-audio-v1";

/** Adresa-çelës, kurrë një kërkesë e vërtetë te serveri. */
const keyFor = (id) => `/offline/audio/${encodeURIComponent(id)}`;

/**
 * A e mbështet pajisja këtë ruajtje?
 *
 * Cache Storage kërkon kontekst të sigurt (https). Te prodhimi dhe te
 * Capacitor-i është gjithmonë aty; mbetet `false` vetëm te `http://` i
 * thjeshtë, dhe atëherë butoni e thotë, në vend që të dështojë në heshtje.
 */
export const supportsOffline = () =>
  typeof caches !== "undefined" && typeof window !== "undefined" && Boolean(window.isSecureContext);

/** Kutia e shkarkimeve; `null` kur ruajtja nuk mbështetet. */
async function box() {
  if (!supportsOffline()) return null;
  try {
    return await caches.open(CACHE);
  } catch {
    return null;
  }
}

/**
 * Lexon trupin duke njoftuar sa ka ardhur.
 *
 * ⚠️  `response.blob()` do të mjaftonte, por nuk thotë asgjë derisa të
 *     mbarojë — dhe 16MB me internet celulari janë dhjetëra sekonda heshtje.
 *     Leximi copë-copë jep përqindjen, dhe kur dështon, dihet se ku ndaloi.
 *
 * Kur `body` nuk lexohet dot (shfletues i vjetër), kthehet te `blob()`.
 */
async function lexoTrupin(response, onProgress) {
  const total = Number(response.headers.get("Content-Length")) || 0;
  if (!response.body?.getReader || !total) return response.blob();

  const reader = response.body.getReader();
  const copat = [];
  let marre = 0;
  /* Njoftohet vetëm kur ndryshon përqindja e plotë: copat janë me dhjetëra
     kilobajtë, pra një njoftim për copë do të ishin qindra rivizatime. */
  let fundit = -1;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    copat.push(value);
    marre += value.length;
    const percent = Math.min(99, Math.round((marre / total) * 100));
    if (percent !== fundit) {
      fundit = percent;
      onProgress?.(percent, total);
    }
  }

  return new Blob(copat, { type: response.headers.get("Content-Type") || "" });
}

/**
 * Shkarkon meditimin dhe e ruan brenda aplikacionit.
 *
 * @returns {Promise<{ ok: true, bytes: number } | { ok: false, reason: string }>}
 */
export async function storeOffline(item, onProgress = null) {
  const cache = await box();
  if (!cache) {
    return { ok: false, reason: null, detail: "Kujtesa e aplikacionit nuk u hap dot." };
  }

  const link = await fetchAudioUrl(item?.id);
  if (!link.ok) return link;

  let response;
  try {
    response = await fetch(link.url);
  } catch {
    return { ok: false, reason: REASON.OFFLINE };
  }
  /*
   * Kodi i serverit shkruhet te mesazhi. Një "nuk u krye" i thatë nuk thotë
   * nëse skedari mungon (404), nëse nënshkrimi skadoi (410) apo nëse porta e
   * abonimit e ndaloi (403) — dhe pa të, kërkimi nis nga zeroja.
   */
  if (!response.ok) {
    return { ok: false, reason: null, detail: `Serveri ktheu ${response.status} për skedarin.` };
  }

  /*
   * Trupi merret si `blob` dhe rishkruhet me koka të tonat.
   *
   * ⚠️  Përgjigjja origjinale ruhet bashkë me `Content-Range` dhe `Cache-Control`
   *     të serverit; e para do ta bënte skedarin të pjesshëm kur shfletuesi
   *     kërkon një pjesë, e dyta mund ta fshinte vetë. Këtu ruajmë skedarin e
   *     plotë dhe vetëm atë që na duhet për ta luajtur.
   */
  /*
   * ⚠️  LEXIMI I TRUPIT KA KURTHIN E VET.
   *
   *     `fetch()` kthehet sapo mbërrijnë kokat — skedari vazhdon të vijë pas
   *     saj. Nëse lidhja këputet gjatë atyre 16 megabajtëve, ai që dështon
   *     është `blob()`, jo `fetch()`, dhe përjashtimi del jashtë bllokut të
   *     mësipërm. Pikërisht kjo nxori "Failed to fetch" te ekrani më 16 nëntor
   *     2026, pa asnjë shpjegim se në cilin hap ndodhi.
   */
  let blob;
  try {
    blob = await lexoTrupin(response, onProgress);
  } catch {
    const mb = Math.round((Number(response.headers.get("Content-Length")) || 0) / 1048576);
    return {
      ok: false,
      reason: null,
      detail: mb
        ? `Lidhja u këput gjatë marrjes së skedarit (${mb}MB). Provo me Wi-Fi.`
        : "Lidhja u këput gjatë marrjes së skedarit. Provo me Wi-Fi.",
    };
  }

  const headers = new Headers();
  headers.set("Content-Type", blob.type || (link.kind === "video" ? "video/mp4" : "audio/mpeg"));
  headers.set("Content-Length", String(blob.size));
  headers.set("X-Ag-Kind", link.kind);

  try {
    await cache.put(keyFor(item.id), new Response(blob, { headers }));
  } catch (err) {
    /* Zakonisht kuota e pajisjes. Mesazhi i vërtetë kalon te përdoruesi. */
    return {
      ok: false,
      reason: null,
      detail: `Nuk u ruajt dot (${Math.round(blob.size / 1048576)}MB): ${err?.message ?? err}`,
    };
  }

  return { ok: true, bytes: blob.size };
}

/** A e kemi këtë meditim brenda aplikacionit? */
export async function hasOffline(id) {
  const cache = await box();
  if (!cache || !id) return false;
  return Boolean(await cache.match(keyFor(id)));
}

/**
 * Burimi i luajtshëm nga kopja e brendshme.
 *
 * Kthen një `blob:` URL — pra zëri nuk kalon fare nga rrjeti. Thirrësi duhet
 * ta lirojë me `URL.revokeObjectURL` kur ndërron meditimi; përndryshe blob-i
 * mbetet në kujtesë deri sa të mbyllet aplikacioni.
 */
export async function readOffline(id) {
  const cache = await box();
  if (!cache || !id) return null;

  let hit;
  try {
    hit = await cache.match(keyFor(id));
  } catch {
    return null;
  }
  if (!hit) return null;

  const kind = hit.headers.get("X-Ag-Kind") === "video" ? "video" : "audio";
  const blob = await hit.blob();
  return { url: URL.createObjectURL(blob), kind };
}

/** Heq kopjen e brendshme. */
export async function removeOffline(id) {
  const cache = await box();
  if (!cache || !id) return false;
  try {
    return await cache.delete(keyFor(id));
  } catch {
    return false;
  }
}
