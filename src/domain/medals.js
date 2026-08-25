/**
 * SISTEMI I SHPËRBLIMIT (medaljet) — seksioni 7 i katalogut.
 *
 * Baza është *streak-u i meditimit*: ditët rresht që përdoruesi mediton.
 *   · Bronz   — një i ri për çdo cikël 3-ditor   (dita 3, 6, 9 …)
 *   · Argjend — një i ri për çdo 7 ditë          (dita 7, 14, 21 …)
 *   · Ar      — një i ri për çdo 21 ditë         (dita 21, 42 …)
 *
 * Streak-u shtohet me +1 për çdo ditë me të paktën një meditim të plotësuar.
 * Nëse një ditë kapërcehet, streak-u rinis nga 1 — por medaljet e fituara
 * MBETEN. Prandaj numërimi nuk bëhet mbi streak-un e tanishëm, por mbi të
 * gjitha vargjet e ditëve në histori: secili varg jep medaljet e veta dhe
 * ato mblidhen (prej nga vjen edhe pulla «×N»).
 *
 * Asgjë nuk ruhet veçmas. Numrat rrjedhin nga vetë historiku i seancave, ndaj
 * nuk kanë si të shpërputhen me të: një numërues i ruajtur më vete do të
 * dilte i gabuar sapo historiku të ndryshonte ose të sinkronizohej.
 *
 * Pikët «Dritë» (Progresioni Ditor) janë sistem paralel — nuk përzihen këtu.
 */

const DAY_MS = 86400000;

/**
 * Renditjet e medaljeve, nga më e ulëta te më e larta.
 * `everyDays` është edhe pragu i parë, edhe hapi i çdo medaljeje të radhës.
 */
export const MEDAL_TIERS = [
  { id: "bronze", label: "Bronz", everyDays: 3 },
  { id: "silver", label: "Argjend", everyDays: 7 },
  { id: "gold", label: "Ar", everyDays: 21 },
];

/** Çelësi i ditës ("2026-08-24") si numër ditësh — që të krahasohen fqinjët. */
const dayNumber = (key) => Math.round(Date.parse(`${key}T00:00:00Z`) / DAY_MS);

/**
 * Vargjet e ditëve rresht brenda një grupi ditësh.
 *
 * @param {string[]} dayKeys ditë me të paktën një meditim, në çfarëdo radhe
 * @returns {{ start: number, end: number, length: number }[]} nga më e vjetra
 */
export function streakRuns(dayKeys) {
  const days = [...new Set(dayKeys)]
    .map(dayNumber)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  const runs = [];
  for (const day of days) {
    const last = runs[runs.length - 1];
    if (last && day === last.end + 1) {
      last.end = day;
      last.length += 1;
    } else {
      runs.push({ start: day, end: day, length: 1 });
    }
  }
  return runs;
}

/**
 * Streak-u i tanishëm.
 *
 * Vargu quhet ende i gjallë nëse mbyllet sot ose dje: dita e sotme mund të
 * jetë ende pa u medituar. Këputet vetëm kur kalon një ditë e tërë pa meditim.
 */
export function currentStreak(dayKeys, todayKey) {
  const runs = streakRuns(dayKeys);
  const last = runs[runs.length - 1];
  if (!last) return 0;

  const today = dayNumber(todayKey);
  return last.end === today || last.end === today - 1 ? last.length : 0;
}

/** Vargu më i gjatë i arritur ndonjëherë. */
export function bestStreak(dayKeys) {
  return streakRuns(dayKeys).reduce((best, run) => Math.max(best, run.length), 0);
}

/**
 * Sa medalje të secilës renditje janë fituar gjithsej.
 * @returns {{ bronze: number, silver: number, gold: number }}
 */
export function medalCounts(dayKeys) {
  const runs = streakRuns(dayKeys);
  return MEDAL_TIERS.reduce((counts, tier) => {
    counts[tier.id] = runs.reduce((sum, run) => sum + Math.floor(run.length / tier.everyDays), 0);
    return counts;
  }, {});
}

/** Numri i përgjithshëm i medaljeve. */
export const totalMedals = (counts) => Object.values(counts).reduce((a, b) => a + b, 0);

/**
 * Medalja më e afërt që fitohet nëse streak-u vazhdon.
 *
 * Kur dy renditje bien në të njëjtën ditë (p.sh. dita 21 sjell bronz, argjend
 * dhe ar bashkë), shpallet më e larta — ajo është arritja që ka peshë.
 *
 * @returns {{ tier: object, daysLeft: number } | null} null kur nuk ka histori
 */
export function nextMedal(streakLength) {
  const candidates = MEDAL_TIERS.map((tier) => ({
    tier,
    daysLeft: tier.everyDays - (streakLength % tier.everyDays),
  }));

  return candidates.reduce((best, candidate) =>
    candidate.daysLeft < best.daysLeft ||
    (candidate.daysLeft === best.daysLeft && candidate.tier.everyDays > best.tier.everyDays)
      ? candidate
      : best
  );
}
