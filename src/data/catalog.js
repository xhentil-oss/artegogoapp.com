/**
 * Përmbajtja e kuruar e vitrinës: seri, programe, të shkurtra, tinguj.
 * Këto lista janë të vogla dhe redaksionale — kandidatët e parë për CMS.
 */

/** Seri të kuruara që hapin një kategori të plotë. */
export const SERIES = [
  { id: "s1", title: "Seria e Zemrës",        sub: "FRYMËZIM SOMATIK",  intent: "heart" },
  { id: "s2", title: "Transformimi i Thellë", sub: "ARKETIPET & THETA", intent: "transform" },
  { id: "s3", title: "Ritmi i Gjumit",        sub: "DELTA & PUSHIM",    intent: "sleep" },
];

/** Programe shumë-ditore. `lessons` = numri i seancave. */
export const PROGRAMS = [
  { id: "p1", title: "MISTIK ZEMËR", sub: "7 ditë · hapje e zemrës", lessons: 7,  intent: "heart" },
  { id: "p2", title: "TRANSFORMIM",  sub: "21 ditë · arketipet",     lessons: 21, intent: "transform" },
  { id: "p3", title: "GJUMË I QETË", sub: "10 ditë · ritual nate",   lessons: 10, intent: "sleep" },
  { id: "p4", title: "BOLLËK",       sub: "14 ditë · manifestim",    lessons: 14, intent: "abundance" },
];

/** Klipe të shkurtra ditore. */
export const SHORTS = [
  { id: "sh1", title: "Si të prekësh zemrën",   author: "Marvin",    intent: "heart" },
  { id: "sh2", title: "Koherenca në 60 sekonda", author: "Arte Gogo", intent: "calm" },
  { id: "sh3", title: "Energjia e mëngjesit",    author: "Marvin",    intent: "energy" },
];

/** Peizazhe tingullore — rrathë në faqen "Sot". */
export const SOUNDSCAPES = [
  { id: "snd1", title: "Solfeggio 349Hz", intent: "energy" },
  { id: "snd2", title: "Solfeggio 528Hz", intent: "abundance" },
  { id: "snd3", title: "Theta 6Hz",       intent: "transform" },
  { id: "snd4", title: "Alpha 10Hz",      intent: "focus" },
];

/** Sesione live / workshope. */
export const LIVE_SESSIONS = [
  { id: "l1", emoji: "🧘", title: "Meditime Live",     sub: "Sesione të udhëhequra nga Dr. Artemisa në kohë reale",   live: true,  when: "Tani" },
  { id: "l2", emoji: "💡", title: "Workshope Online",  sub: "Mësimet dhe praktikat live me interaksion të drejtpërdrejtë", live: false, when: "E mërkurë · 19:00" },
  { id: "l3", emoji: "🎯", title: "Q&A dhe Koçing",    sub: "Pyetje dhe përgjigje live — merr ndihmë direkt",         live: false, when: "E premte · 20:00" },
];
