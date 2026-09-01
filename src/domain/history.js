/**
 * HISTORIKU I PRAKTIKËS — seri ditore, jo listë seancash.
 *
 * ⚠️  Grafiku tregonte një shtyllë PËR SEANCË. Gjashtë seanca të së njëjtës
 *     ditë jepnin gjashtë shtylla, të gjitha me etiketën "Sot" — dhe ditët pa
 *     meditim nuk shfaqeshin fare, ndaj një javë e mbarë dukej si gjashtë ditë
 *     rresht praktike.
 *
 *     Këtu ndërtohet seria e ditëve: minutat mblidhen për ditë, dhe ditët bosh
 *     mbeten në pamje me zero. Një boshllëk është pikërisht ajo që përdoruesi
 *     duhet të shohë.
 */

const MONTHS = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gsh", "Sht", "Tet", "Nën", "Dhj"];

/** `2026-09-01` → `Sot`, `31 Gsh`. */
export function dayLabel(isoDate, todayKey) {
  if (!isoDate) return "";
  if (isoDate === todayKey) return "Sot";
  const [, month, day] = isoDate.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1] ?? ""}`.trim();
}

/** Çelësi i ditës `days` ditë para asaj të dhënë. */
function shift(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Minutat për ditë, për `days` ditët e fundit që mbarojnë sot.
 *
 * @param {Record<string, Array<{min:number, intent?:string}>>} byDay
 * @param {number} days
 * @param {string} todayKey
 * @returns {Array<{key:string, label:string, min:number, intent:string, sessions:number}>}
 */
export function dailySeries(byDay = {}, days = 7, todayKey) {
  const series = [];

  for (let back = days - 1; back >= 0; back -= 1) {
    const key = shift(todayKey, -back);
    const entries = byDay[key] ?? [];
    const min = entries.reduce((sum, entry) => sum + (Number(entry.min) || 0), 0);

    series.push({
      key,
      label: dayLabel(key, todayKey),
      min,
      sessions: entries.length,
      /* Ngjyra e ditës merret nga seanca e parë e saj — një ditë me disa
         qëllime nuk ka një ngjyrë të vetme, dhe përzierja do të jepte gri. */
      intent: entries[0]?.intent ?? "calm",
    });
  }

  return series;
}
