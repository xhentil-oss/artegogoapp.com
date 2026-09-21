import { api, upload } from "./api.js";
import { refreshFeed, refreshLive } from "./catalog.js";
import { isDatabaseId } from "../lib/ids.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  PANELI I ADMIN-IT → DATABAZA
 * ═══════════════════════════════════════════════════════════════
 *
 * Deri tani paneli shkruante vetëm te `localStorage`: ndryshimet i shihte një
 * shfletues i vetëm, humbeshin me pastrimin e të dhënave, dhe telefoni i
 * klientes nuk merrte vesh asgjë. Këtu ato shkojnë te databaza.
 *
 * ⚠️  PAS SHKRIMIT, KATALOGU RILEXOHET.
 *
 *     Përndryshe do të ekzistonin dy të vërteta: ajo e databazës dhe një
 *     mbivendosje lokale mbi të. Sapo të devijonin, folderi do të tregonte
 *     "9 meditime" dhe brenda do të kishte 8 — pa asnjë mënyrë për të kuptuar
 *     cila anë kishte të drejtë.
 */

/* ─────────────── komuniteti ─────────────── */

/**
 * Boton një postim te feed-i.
 *
 * ⚠️  Vetëm admini e ka këtë të drejtë, dhe kufizimi zbatohet TE SERVERI
 *     (`requireAdmin`). Fshehja e kutisë së shkrimit nga përdoruesit e
 *     zakonshëm është vetëm pamje — kushdo mund të dërgojë një kërkesë me dorë.
 *
 * @returns {Promise<{ok:boolean, post?:object, error?:string}>}
 */
/**
 * NGARKON NJË SKEDAR dhe kthen adresën e tij publike.
 *
 * ⚠️  Kthen `{ ok, url, type }` ose `{ ok: false, error }` — kurrë nuk hedh.
 *     Paneli e thërret brenda një cikli skedarësh; një përjashtim i vetëm do
 *     ta ndalte ngarkimin e të tjerëve pa asnjë shenjë pse.
 */
export async function uploadMedia(file) {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await upload("/admin/media", form);
    return { ok: true, url: res.url, type: res.type };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Ngarkimi dështoi." };
  }
}

/** A është gati ngarkimi te serveri — dhe nëse jo, pse. */
export async function mediaStatus() {
  try {
    return await api.get("/admin/media/status");
  } catch (err) {
    return { ready: false, reason: err?.message ?? "Nuk u lexua gjendja." };
  }
}

export async function publishPost({ text, type, author, meditationId = null, images = [], video = null }) {
  /*
   * MEDIA → një listë, plus e para veçmas.
   *
   * ⚠️  `mediaUrl`/`mediaType` dërgohen ende. Ato shkojnë te kolonat e vjetra
   *     të postimit, që aplikacionet e painstaluara sërish te telefonat —
   *     ato që nuk e njohin tabelën e re — të vazhdojnë ta shohin median.
   *     Lista shkon te `community_post_media` dhe mban karuselin.
   *
   * ⚠️  Të dyja fushat shkojnë bashkë ose s'shkon asnjëra: `chk_post_media` te
   *     databaza e refuzon njërën pa tjetrën, dhe API-ja kthen 400.
   */
  const media = video
    ? [{ url: video, type: "video" }]
    : images.filter(Boolean).map((url) => ({ url, type: "image" }));

  const mediaUrl = media[0]?.url ?? null;
  const mediaType = media[0]?.type ?? null;

  try {
    const post = await api.post("/admin/posts", {
      text,
      type,
      author,
      meditationId: meditationId && isDatabaseId(meditationId) ? meditationId : null,
      mediaUrl,
      mediaType,
      media,
    });
    /* Feed-i rilexohet, që postimi i ri të shfaqet ashtu siç e shohin të
       tjerët — me kohën dhe id-në e vërtetë, jo me atë të pritjes. */
    await refreshFeed();
    return { ok: true, post };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Botimi dështoi." };
  }
}

/**
 * Fsheh një postim.
 *
 * Serveri e shënon `is_published = 0` dhe NUK e fshin: postimet mbajnë reagime
 * e komente njerëzish, dhe një postim i hequr gabimisht duhet të rikthehet.
 */
export async function hidePost(id) {
  try {
    await api.del(`/admin/posts/${encodeURIComponent(id)}`);
    await refreshFeed();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Fshehja dështoi." };
  }
}

/* ─────────────── përdoruesit ─────────────── */

/**
 * Lista e përdoruesve të regjistruar.
 *
 * ⚠️  Nuk kalon nga `contentRepository` dhe nuk ruhet te `adminStore`.
 *
 *     Ato dy shtresa mbajnë përmbajtjen e aplikacionit — meditimet, pool-et,
 *     postimet — të cilat lexohen nga dhjetëra ekrane dhe duhen mbajtur në një
 *     kopje të vetme. Përdoruesit i sheh një ekran i vetëm, dhe një kopje
 *     lokale do të vjetrohej pa e vënë re kush: dikush regjistrohet, admini
 *     hap panelin, dhe lista tregon gjendjen e djeshme. Prandaj lexohet nga
 *     serveri sa herë hapet skeda.
 *
 * @returns {Promise<{ok:boolean, items?:object[], total?:number, error?:string}>}
 */
export async function fetchUsers({ q = "", limit = 100, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  try {
    const data = await api.get(`/admin/users?${params}`);
    return { ok: true, items: data?.items ?? [], total: data?.total ?? 0 };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Lista nuk u lexua dot." };
  }
}

/** Numrat e kokës — gjithsej, në provë, me abonim, sot, këtë javë. */
export async function fetchUserStats() {
  try {
    return { ok: true, stats: await api.get("/admin/users/stats") };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Numrat nuk u lexuan dot." };
  }
}

/* ─────────────── sesionet live (Zoom) ─────────────── */

/**
 * SESIONET LIVE
 *
 * Çdo shkrim ndiqet nga `refreshLive()`, që kartelat te skeda "Live" të
 * tregojnë menjëherë gjendjen e vërtetë — jo atë që pret paneli se u ruajt.
 *
 * ⚠️  Lista për panelin lexohet nga `/admin/live`, jo nga `/content/live`:
 *     rruga publike e fsheh linkun kur sesioni është i fikur, dhe admini
 *     duhet ta shohë pikërisht atëherë — që ta vendosë para se ta nisë.
 */
export async function fetchLiveSessions() {
  try {
    return { ok: true, items: (await api.get("/admin/live")) ?? [] };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Sesionet nuk u lexuan dot." };
  }
}

export async function createLiveSession(body) {
  try {
    const session = await api.post("/admin/live", body);
    await refreshLive();
    return { ok: true, session };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Sesioni nuk u ruajt." };
  }
}

export async function updateLiveSession(id, patch) {
  try {
    const session = await api.put(`/admin/live/${encodeURIComponent(id)}`, patch);
    await refreshLive();
    return { ok: true, session };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Ndryshimi nuk u ruajt." };
  }
}

/** Ndez ose fik një sesion. Serveri i fik vetë të tjerët kur ky ndizet. */
export async function setLiveOn(id, on) {
  try {
    const session = await api.post(`/admin/live/${encodeURIComponent(id)}/live`, { on });
    await refreshLive();
    return { ok: true, session };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Gjendja nuk u ndryshua." };
  }
}

export async function deleteLiveSession(id) {
  try {
    await api.del(`/admin/live/${encodeURIComponent(id)}`);
    await refreshLive();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Fshirja dështoi." };
  }
}
