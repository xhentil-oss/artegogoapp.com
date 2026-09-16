import { Moon, Sun, Sunrise } from "lucide-react";

/**
 * KUJTESAT — tre çastet e ditës që caktohen gjatë onboarding-ut.
 *
 * Specifikimi ruan vetëm emrin dhe oraret; hapat për qëllime apo kohëzgjatje
 * u hoqën me qëllim, për ta mbajtur regjistrimin të shkurtër.
 *
 * `icon` dhe `hint` janë pamje, jo të dhëna: ikona dhe rreshti i vogël nën emër
 * vijnë nga pamja e klientes. Qëndrojnë këtu, bashkë me emrin, që ekrani i
 * onboarding-ut dhe fleta e njoftimeve të mos i shkruajnë dy herë.
 *
 * ⚠️  Ikonat janë vija të holla (lucide), jo emoji. Emoji-t i vizaton sistemi:
 *     dilnin të trasha e me ngjyra të ndryshme te Windows-i, iPhone-i dhe
 *     Android-i, dhe nuk përputheshin me pjesën tjetër të aplikacionit — që
 *     nga navigimi te qëllimet përdor po këtë familje vijash.
 *
 * `color` nis nga gradienti i qëllimit përkatës — portokallia e "Energji" për
 * mëngjesin, blu e "Gjumë" për darkën — por rri e shkruar këtu, jo e nxjerrë
 * nga qëllimi: dreka e do të verdhën e navigimit (`nav.yellow`), jo arin e
 * "Fokus", sepse ndryshe nuk dallohej nga portokallia e mëngjesit.
 */
export const REMINDER_SLOTS = [
  { id: "morning", label: "Mëngjes", icon: Sunrise, color: "#E0552B", hint: "nis ditën me qëllim", defaultTime: "07:00", intent: "energy" },
  { id: "noon",    label: "Drekë",   icon: Sun,     color: "#F5C400", hint: "pauzë koherence",     defaultTime: "13:00", intent: "focus"  },
  { id: "evening", label: "Darkë",   icon: Moon,    color: "#5C7BD9", hint: "çlodhje para gjumit", defaultTime: "21:00", intent: "sleep"  },
];

/**
 * Gjendja fillestare: **mëngjesi dhe darka të ndezura**, dreka e fikur.
 *
 * ⚠️  Më parë ishin të treja të fikura, dhe onboarding-u nxirrte tre
 *     ndërprerës të vdekur — përdoruesi duhej t'i ndizte vetë që të merrte
 *     ndonjë kujtesë. Dy të ndezura tregojnë ritmin që propozon aplikacioni
 *     (nis ditën, mbylle ditën), dhe dreka mbetet zgjedhje.
 *
 * Prek VETËM llogaritë e reja: kush e ka kaluar onboarding-un e ka zgjedhjen
 * e vet të ruajtur, dhe ajo nuk mbishkruhet.
 */
const NDEZUR_NE_NISJE = ["morning", "evening"];

export const defaultReminders = () =>
  Object.fromEntries(
    REMINDER_SLOTS.map((slot) => [
      slot.id,
      { enabled: NDEZUR_NE_NISJE.includes(slot.id), time: slot.defaultTime },
    ])
  );
