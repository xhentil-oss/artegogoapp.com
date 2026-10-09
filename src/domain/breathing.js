/**
 * ═══════════════════════════════════════════════════════════════
 *  RITMET E FRYMËMARRJES — udhëzuesi pamor i player-it
 * ═══════════════════════════════════════════════════════════════
 *
 * Disa meditime nuk janë zë mbi muzikë: janë USHTRIME me ritëm të matur, ku
 * dëgjuesi duhet të dijë në çdo çast ç'po bën dhe sa i mbetet. Për to player-i
 * zëvendëson diskun me një figurë që ndjek pikërisht atë ritëm.
 *
 * ⚠️  RITMI PËRSHKRUHET KËTU, JO TE KOMPONENTI.
 *
 *     Komponenti vizaton çfarëdo cikli me katër ose më pak faza; ky skedar
 *     thotë sa zgjasin dhe si quhen. Një ushtrim i ri (4-7-8, frymëmarrje
 *     koherente) shtohet me një objekt, pa prekur asnjë rresht pamjeje.
 *
 * ⚠️  KOHA MATET NGA AUDIO, JO NGA NJË KRONOMETËR I VETI.
 *
 *     Figura ushqehet me `blockElapsed` të motorit — pra pozicionin e vërtetë
 *     të skedarit. Një kronometër i pavarur do të shmangej sapo dëgjuesi të
 *     ndalonte, të kthehej 15 sekonda prapa, ose rrjeti të vononte nisjen; dhe
 *     një udhëzues frymëmarrjeje i shmangur nga zëri është më keq se asnjë.
 */

/**
 * Box breathing 4×4 — katër faza nga katër sekonda, katër raunde.
 *
 * Audioja `3Fryma4x4` zgjat 64.1 s: saktësisht 4 × 16 s, pa hyrje. Prandaj
 * cikli nis në sekondën zero dhe nuk ka zhvendosje për të rregulluar.
 *
 * `side` thotë mbi cilin brinjë të katrorit lëviz pika — lart, djathtas,
 * poshtë, majtas. Kështu figura lexohet edhe pa numra: forma vetë tregon ku
 * je brenda ciklit.
 *
 * `color` është e njëjta për brinjën, për pikën dhe për numrin e rreshtit
 * përkatës poshtë figurës. Një ngjyrë për fazë, e përsëritur në të tri
 * vendet, e bën lidhjen të lexueshme pa asnjë shpjegim.
 */
const BOX_4X4 = {
  id: "box-4x4",
  rounds: 4,
  phases: [
    {
      id: "in",
      corner: "MERR",
      title: "MERR FRYMË",
      text: "Merr frymë ngadalë nga hunda — 4 sekonda",
      seconds: 4,
      side: "top",
      color: "#F2D34B",
    },
    {
      id: "hold-full",
      corner: "MBAJE",
      title: "MBAJE",
      text: "Mbaje frymën — 4 sekonda",
      seconds: 4,
      side: "right",
      color: "#3FD0C9",
    },
    {
      id: "out",
      corner: "NXIRR",
      title: "NXIRR FRYMË",
      text: "Nxirre butësisht — 4 sekonda",
      seconds: 4,
      side: "bottom",
      color: "#FF5FA2",
    },
    {
      id: "hold-empty",
      corner: "MBAJE",
      title: "MBAJE",
      text: "Mbaje bosh, pa marrë frymë — 4 sekonda",
      seconds: 4,
      side: "left",
      color: "#A98BFF",
    },
  ],
};

/**
 * Cilat meditime e kanë udhëzuesin.
 *
 * ⚠️  Çelësi është id-ja e databazës, dhe titulli mbetet si rrugë e dytë.
 *     Id-ja është e saktë por e brishtë: një ri-import i katalogut do ta
 *     ndërronte, dhe figura do të zhdukej pa asnjë gabim të dukshëm. Titulli
 *     është i qëndrueshëm por mund të përsëritet. Të dyja bashkë mbulojnë
 *     njëra-tjetrën.
 */
const BY_ID = {
  "5ecc1a98-a510-11f1-b99e-107c614af9b1": BOX_4X4,
};

const BY_TITLE = {
  "box breathing": BOX_4X4,
};

/** Ritmi i këtij meditimi, ose `null` kur nuk ka. */
export function breathingFor(item) {
  if (!item) return null;
  return BY_ID[item.id] ?? BY_TITLE[String(item.title ?? "").trim().toLowerCase()] ?? null;
}

/** Sa zgjat një cikël i plotë. */
export const cycleSeconds = (pattern) =>
  pattern.phases.reduce((sum, phase) => sum + phase.seconds, 0);

/** Sa zgjat i gjithë ushtrimi. */
export const totalSeconds = (pattern) => cycleSeconds(pattern) * pattern.rounds;

/**
 * Ku ndodhemi brenda ushtrimit në sekondën `elapsed`.
 *
 * Funksion i pastër: e njëjta hyrje jep të njëjtën dalje, ndaj figura mund të
 * rivizatohet sa herë të duash — edhe pas një kërcimi prapa — pa mbajtur asnjë
 * gjendje të vetën.
 *
 * @returns {{ index:number, phase:object, progress:number, remaining:number,
 *             round:number, done:boolean }}
 *          `progress` 0→1 brenda fazës; `remaining` sekondat që numërohen në
 *          ekran (4,3,2,1); `done` kur ushtrimi ka mbaruar dhe audioja vazhdon.
 */
export function breathStateAt(pattern, elapsed) {
  const cycle = cycleSeconds(pattern);
  const total = cycle * pattern.rounds;
  const done = elapsed >= total;

  /* Pas fundit mbetet korniza e fazës së fundit, jo një figurë e zbrazët. */
  const t = Math.max(0, Math.min(elapsed, total - 0.001));

  const round = Math.floor(t / cycle) + 1;
  let within = t % cycle;
  let index = 0;

  while (index < pattern.phases.length - 1 && within >= pattern.phases[index].seconds) {
    within -= pattern.phases[index].seconds;
    index += 1;
  }

  const phase = pattern.phases[index];
  return {
    index,
    phase,
    progress: Math.min(1, within / phase.seconds),
    /* Numërimi zbret: 4 në fillim të fazës, 1 në sekondën e fundit. */
    remaining: Math.max(1, Math.ceil(phase.seconds - within)),
    round: Math.min(round, pattern.rounds),
    done,
  };
}
