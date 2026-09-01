import { api, hasToken } from "./api.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  NJOFTIMET NË PAJISJE
 * ═══════════════════════════════════════════════════════════════
 *
 * Rruga e plotë: Service Worker → leje nga përdoruesi → abonim → serveri.
 * Të katërta duhen; mungesa e njërës e ndal gjithçka pa asnjë gabim të dukshëm,
 * ndaj `status()` i raporton veç e veç.
 *
 * ⚠️  KUFIRI I VËRTETË, DHE JO I NDREQSHËM ME KOD:
 *
 *     Te iPhone, Web Push punon VETËM kur aplikacioni është shtuar te Home
 *     Screen (iOS 16.4+). Te Safari në skedë të zakonshme, `PushManager` nuk
 *     ekziston fare. Kjo është kufizim i Apple-it. Për njoftime që punojnë
 *     gjithmonë te iPhone duhet aplikacion nativ me APNs.
 *
 *     Prandaj `status()` kthen `needsInstall` — që ekrani të kërkojë instalimin
 *     në vend që të tregojë një gabim që përdoruesi nuk mund ta zgjidhë.
 */

const SW_PATH = "/sw.js";

const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && (navigator.maxTouchPoints ?? 0) > 1));

/** A rrjedh si aplikacion i instaluar (Home Screen / PWA)? */
const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true);

const supported = () =>
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator &&
  typeof window !== "undefined" &&
  "PushManager" in window &&
  "Notification" in window;

/** Regjistron Service Worker-in. I sigurt të thirret sa herë. */
export async function registerWorker() {
  if (!supported()) return null;
  try {
    return await navigator.serviceWorker.register(SW_PATH);
  } catch {
    return null;
  }
}

/**
 * Gjendja e vërtetë, hap pas hapi.
 *
 * @returns {Promise<{supported:boolean, needsInstall:boolean, permission:string,
 *                    subscribed:boolean, devices:number, configured:boolean}>}
 */
export async function status() {
  /* iPhone jashtë Home Screen-it: `PushManager` mungon, dhe arsyeja duhet
     dalluar nga "shfletues i vjetër" — zgjidhja është krejt tjetër. */
  const needsInstall = isIOS() && !isStandalone();

  if (!supported()) {
    return {
      supported: false,
      needsInstall,
      permission: "unsupported",
      subscribed: false,
      devices: 0,
      configured: false,
    };
  }

  const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
  const subscription = await registration?.pushManager.getSubscription();

  let server = { configured: false, devices: 0 };
  if (hasToken()) {
    server = (await api.get("/me/push/status").catch(() => null)) ?? server;
  }

  return {
    supported: true,
    needsInstall,
    permission: Notification.permission,
    subscribed: Boolean(subscription),
    devices: server.devices ?? 0,
    configured: Boolean(server.configured),
  };
}

/** Base64URL → Uint8Array, forma që kërkon `applicationServerKey`. */
function decodeKey(base64) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Ndez njoftimet.
 *
 * @returns {Promise<{ok:boolean, reason?:string}>}
 */
export async function enable() {
  if (!hasToken()) return { ok: false, reason: "auth" };

  if (!supported()) {
    return { ok: false, reason: isIOS() && !isStandalone() ? "needs-install" : "unsupported" };
  }

  /* Çelësi publik VAPID merret PARA se t'i kërkohet leja përdoruesit: pa të,
     abonimi dështon gjithsesi, dhe një leje e dhënë kot nuk kërkohet dy herë. */
  const key = await api.get("/push/key", { auth: false }).catch(() => null);
  if (!key?.key) return { ok: false, reason: "not-configured" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: permission };

  const registration = (await navigator.serviceWorker.getRegistration(SW_PATH)) ?? (await registerWorker());
  if (!registration) return { ok: false, reason: "no-worker" };
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager
      .subscribe({
        /* `true` është i detyrueshëm: shfletuesit e refuzojnë abonimet e
           heshtura, sepse ato do të lejonin gjurmim pa dijeninë e përdoruesit. */
        userVisibleOnly: true,
        applicationServerKey: decodeKey(key.key),
      })
      .catch(() => null);
  }
  if (!subscription) return { ok: false, reason: "subscribe-failed" };

  try {
    await api.post("/me/push/subscribe", subscription.toJSON());
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err?.message ?? "server" };
  }
}

/** Fik njoftimet — te pajisja dhe te serveri. */
export async function disable() {
  const registration = await navigator.serviceWorker?.getRegistration(SW_PATH);
  const subscription = await registration?.pushManager.getSubscription();

  if (subscription) {
    /* Serveri i pari: një abonim i hequr lokalisht, që mbetet te serveri, do të
       vazhdonte të prodhonte dërgime drejt një adrese të vdekur. */
    await api.del("/me/push/subscribe", { body: subscription.toJSON() }).catch(() => {});
    await subscription.unsubscribe().catch(() => {});
  } else if (hasToken()) {
    await api.del("/me/push/subscribe").catch(() => {});
  }
  return { ok: true };
}

/** Dërgon një njoftim provë te pajisjet e vetë përdoruesit. */
export async function sendTest() {
  try {
    return await api.post("/me/push/test");
  } catch (err) {
    return { sent: 0, failed: 0, reason: err?.message ?? "dështoi" };
  }
}
