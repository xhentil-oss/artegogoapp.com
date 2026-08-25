import { REMINDER_SLOTS } from "../data/reminders.js";
import { picksForDay } from "../domain/dailyPick.js";
import { dayKey } from "../lib/time.js";
import { TRIAL_DAYS, effectiveNow } from "../domain/subscription.js";

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
