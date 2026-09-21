import { REMINDER_SLOTS } from "../data/reminders.js";
import { picksForDay } from "../domain/dailyPick.js";
import { dayKey } from "../lib/time.js";
import { TRIAL_DAYS, effectiveNow } from "../domain/subscription.js";
import { api, hasToken } from "./api.js";

/**
 * NJOFTIMET DITORE (seksioni 9).
 *
 * ⚠️  KUFIZIM I PROTOTIPIT — i deklaruar, jo i fshehur.
 *     Ky prototip NUK dërgon push notifications. Një faqe web nuk mund të
 *     zgjohet në orën 07:30 kur aplikacioni është i mbyllur; asnjë API e
 *     shfletuesit nuk e jep këtë pa një server që shtyn njoftimin.
 *
 * NË APLIKACIONIN REAL:
 *   1. logjika e përzgjedhjes kalon te serveri — `domain/dailyPick.js` është
 *      funksion i pastër i ditës, ndaj serveri dhe telefoni nxjerrin TË NJËJTIN
 *      meditim pa u marrë vesh mes tyre. Kjo është arsyeja pse ai u shkrua pa
 *      `Math.random()`: përndryshe njoftimi do të premtonte një meditim dhe
 *      aplikacioni do të hapte një tjetër;
 *   2. dërgimi bëhet përmes APNs (iOS) dhe FCM (Android) në orarin e caktuar,
 *      edhe kur aplikacioni është i mbyllur;
 *   3. telefoni i dërgon serverit token-in e pajisjes dhe oraret e zgjedhura.
 *
 * Ajo që bëhet KËTU është pjesa që mbetet e vlefshme: ndërtimi i vetë
 * njoftimit. I njëjti funksion do ta ushqejë payload-in e serverit.
 */

const slotById = new Map(REMINDER_SLOTS.map((slot) => [slot.id, slot]));

/**
 * Njoftimet e një dite, sipas oraresh të aktivizuara.
 *
 * @param {object} reminders gjendja nga onboarding-u: { morning: {enabled, time} … }
 * @param {string} key çelësi i ditës; sot nëse mungon
 * @returns {{ slotId, label, time, enabled, meditation, title, body }[]}
 */
export function dailyNotifications(reminders = {}, key = dayKey()) {
  return picksForDay(key)
    .map(({ slotId, meditation }) => {
      const slot = slotById.get(slotId);
      const state = reminders[slotId] ?? {};
      if (!slot || !meditation) return null;

      return {
        slotId,
        label: slot.label,
        time: state.time ?? slot.defaultTime,
        enabled: Boolean(state.enabled),
        meditation,
        title: `${slot.label} me Arte Gogo`,
        /* Titulli i meditimit hyn në trupin e njoftimit, jo në krye: në ekranin
           e kyçur rreshti i parë pritet shpejt, dhe çasti i ditës është ai që
           e bën njoftimin të njohur. */
        body: `${meditation.title} · ${meditation.dur} min`,
      };
    })
    .filter(Boolean);
}

/**
 * Njoftimi "prova po mbaron", i kërkuar shprehimisht nga specifikimi.
 *
 * Bie një ditë para se prova të mbarojë — dita 2 e një prove 3-ditore, e
 * njëjta ditë që tregon timeline-i i paywall-it. Të dyja rrjedhin nga
 * `TRIAL_DAYS`, ndaj nuk kanë si të thonë gjëra të ndryshme.
 *
 * @returns {{ dueOn: Date, title: string, body: string }|null}
 */
export function trialEndingNotification(subscription) {
  if (!subscription || subscription.cancelled) return null;

  const trialEnds = new Date(subscription.trialEndsAt);
  const dueOn = new Date(trialEnds.getTime() - 86400000);
  if (effectiveNow(subscription) > trialEnds) return null;

  return {
    dueOn,
    title: "Prova falas po mbaron",
    body: `Nesër nis abonimi. Anulo para tij nëse nuk dëshiron të vazhdosh.`,
    trialDays: TRIAL_DAYS,
  };
}

/**
 * A i ka dhënë përdoruesi lejen e njoftimeve.
 *
 * Në web kthen gjendjen e vërtetë të shfletuesit; në aplikacionin e paketuar
 * kjo bëhet leja e sistemit që kërkohet përpara regjistrimit te APNs/FCM.
 */
export function permissionState() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

/* ─────────────── njoftimet e dërguara vërtet ─────────────── */

/**
 * Njoftimet që serveri KA DËRGUAR.
 *
 * ⚠️  Ndryshe nga `dailyNotifications`, që tregon çfarë do të dërgohet, kjo
 *     tregon çfarë U DËRGUA. Dallimi ka rëndësi: pa të, cron-i krijonte
 *     rreshta te databaza dhe asnjë ekran nuk i lexonte — njoftimi "prova po
 *     mbaron" ekzistonte dhe nuk e shihte kush.
 *
 * Sa herë lexohet lista, rifreskohet edhe numëruesi i të palexuarave (pulla
 * mbi zile): një kërkesë, një burim — lista dhe numri nuk kanë si të
 * shpërputhen.
 *
 * @returns {Promise<Array>} listë bosh kur nuk ka hyrje ose serveri nuk arrihet
 */
export async function sentNotifications(limit = 30) {
  if (!hasToken()) {
    setUnread(0);
    return [];
  }
  try {
    const rows = await api.get(`/me/notifications?limit=${limit}`);
    const list = Array.isArray(rows) ? rows : [];
    setUnread(list.filter((n) => !n.is_read).length);
    return list;
  } catch {
    /* Gabimi i rrjetit nuk e prek numëruesin: zeroja do të thoshte "asgjë e re",
       që është pohim — ndërsa e vërteta është se nuk dihet. */
    return [];
  }
}

/** Shënon një njoftim si të lexuar. */
export async function markRead(id) {
  try {
    await api.put(`/me/notifications/${encodeURIComponent(id)}/read`);
    setUnread(Math.max(0, unread - 1));
    return true;
  } catch {
    return false;
  }
}

/**
 * Heq një njoftim nga lista.
 *
 * `wasUnread` vjen nga thirësi sepse vetëm ai e di gjendjen e rreshtit që
 * sapo hoqi; pa të, numëruesi do të duhej të rilexohej nga serveri për çdo
 * fshirje të vetme.
 */
export async function deleteNotification(id, wasUnread = false) {
  try {
    await api.del(`/me/notifications/${encodeURIComponent(id)}`);
    if (wasUnread) setUnread(Math.max(0, unread - 1));
    return true;
  } catch {
    return false;
  }
}

/** Shënon të gjitha si të lexuara. */
export async function markAllRead() {
  try {
    await api.put("/me/notifications/read-all");
    setUnread(0);
    return true;
  } catch {
    return false;
  }
}

/* ─────────────── numëruesi i të palexuarave ─────────────── */

/**
 * Pulla mbi zile e lexon nga këtu.
 *
 * ⚠️  Numri rri te një dëgjues i thjeshtë, jo te një kontekst i ri: zilja
 *     dhe fleta e njoftimeve janë në dy degë të ndryshme të pemës, dhe
 *     "Shëno të lexuara" duhet ta fshijë pullën NJËHERËSH — pa pritur një
 *     rifreskim të faqes. I njëjti model si `onSessionSaved` te `userData`.
 *
 * Numri mat të palexuarat brenda njoftimeve të fundit që lexohen (30 si
 * parazgjedhje). Më shumë se kaq të palexuara njëherësh nuk ndodh: cron-i
 * dërgon tre në ditë, dhe lista e vjetër është tashmë e lexuar.
 */
let unread = 0;
const unreadListeners = new Set();

function setUnread(next) {
  if (next === unread) return;
  unread = next;
  for (const listener of unreadListeners) {
    try {
      listener(unread);
    } catch {
      /* Një dëgjues i prishur nuk duhet t'i ndalojë të tjerët. */
    }
  }
}

/** Vlera e tanishme — për gjendjen fillestare të një komponenti. */
export const unreadNow = () => unread;

/** @returns {() => void} funksioni që e heq dëgjuesin */
export function onUnreadChange(listener) {
  unreadListeners.add(listener);
  return () => unreadListeners.delete(listener);
}
