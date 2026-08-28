/** Ndihmësa datash dhe kalendari, në shqip. */

/* Tri shkronja për secilën — etiketat e grafikëve rreshtohen vetëm nëse
   kanë gjerësi të njëjtë. */
export const WEEKDAYS = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];
export const MONTHS_SHORT = [
  "Jan", "Shk", "Mar", "Pri", "Maj", "Qer",
  "Kor", "Gsh", "Sht", "Tet", "Nën", "Dhj",
];
export const MONTHS_INITIAL = ["J", "Sh", "M", "P", "Ma", "Q", "K", "G", "S", "T", "N", "D"];

/** Pjesa e ditës — përcakton përshëndetjen dhe përmbajtjen e rekomanduar. */
export const DAY_PARTS = { MORNING: "morning", AFTERNOON: "afternoon", EVENING: "evening", NIGHT: "night" };

export function dayPart(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return DAY_PARTS.MORNING;
  if (h >= 12 && h < 17) return DAY_PARTS.AFTERNOON;
  if (h >= 17 && h < 22) return DAY_PARTS.EVENING;
  return DAY_PARTS.NIGHT;
}

/** Çelës i stabilizuar për një ditë: "2026-08-24". */
export const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);

/**
 * Dita sipas orës LOKALE të pajisjes: "2026-08-24".
 *
 * Ndryshe nga `dayKey`, që mat në UTC. Për rrugëtimin e programeve rregulli
 * është "një ndalesë në ditë", dhe ajo ditë duhet të jetë e njëjta që sheh
 * përdoruesi te kalendari: në Tiranë (UTC+2) një meditim në orën 01:00 bie
 * ende në ditën e djeshme sipas UTC-së, dhe do të lejonte dy ndalesa brenda
 * së njëjtës ditë.
 *
 * ⚠️  Zakonet, gjendja dhe streak-u përdorin ende `dayKey` (UTC). Kanë të
 *     njëjtën dobësi dhe duhet të kalojnë këtu — por jo në të njëjtin
 *     ndryshim, sepse do të zhvendoste kuptimin e të dhënave të ruajtura.
 */
export const localDayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

/** Çelës i stabilizuar për një muaj: "2026-08". */
export const monthKey = (date = new Date()) => date.toISOString().slice(0, 7);

const shiftDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const shiftMonths = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};

/**
 * `count` ditët e fundit, nga më e vjetra te sotmja.
 * @returns {{ key: string, date: Date, weekday: string, dayOfMonth: string }[]}
 */
export function lastDays(count) {
  return Array.from({ length: count }, (_, i) => {
    const date = shiftDays(count - 1 - i);
    return {
      key: dayKey(date),
      date,
      weekday: WEEKDAYS[date.getDay()],
      dayOfMonth: String(date.getDate()),
    };
  });
}

/**
 * `count` muajt e fundit, nga më i vjetri te ky.
 * @returns {{ key: string, date: Date, label: string, initial: string }[]}
 */
export function lastMonths(count) {
  return Array.from({ length: count }, (_, i) => {
    const date = shiftMonths(count - 1 - i);
    return {
      key: monthKey(date),
      date,
      label: MONTHS_SHORT[date.getMonth()],
      initial: MONTHS_INITIAL[date.getMonth()],
    };
  });
}
