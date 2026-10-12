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
  /* Katror: katër faza, një për brinjë. */
  shape: "square",
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
 * Frymëmarrje ritmike 4×6 — dy faza, gjashtë raunde, mbi një RRETH.
 *
 * ⚠️  Forma ndryshon sepse ndryshon vetë ushtrimi. Box breathing ka katër
 *     faza të barabarta — katër brinjë të njëjta, pra katror. Këtu janë dy
 *     faza të pabarabarta (4 dhe 6), dhe një rreth i ndan natyrshëm: pika
 *     ngjitet nga poshtë majtas kur merr frymë, dhe zbret nga e djathta kur e
 *     nxjerr. Pikërisht për këtë etiketat janë MERR majtas dhe NXIRR djathtas.
 *
 * Audioja zgjat 62.2 s, ndërsa ushtrimi 60 s (6 × 10). Dallimi rri në fund
 * si bisht: figura e mbyll ciklin dhe tregon "MBARUAR" ndërsa zëri shuhet.
 */
const RITMIKE_4X6 = {
  id: "ritmike-4x6",
  shape: "circle",
  rounds: 6,
  /* Rreshti i fundit te lista — udhëzim, jo fazë. Shih `BreathSteps`. */
  extraStep: {
    text: "Përsërite 6 herë (≈1 minutë) dhe vëre ndryshimin",
    color: "#C9A0C8",
  },
  phases: [
    {
      id: "in",
      corner: "MERR",
      title: "MERR FRYMË",
      text: "Merr frymë ngadalë nga hunda — 4 sekonda",
      seconds: 4,
      side: "left",
      color: "#F2D34B",
    },
    {
      id: "out",
      corner: "NXIRR",
      title: "NXIRR FRYMË",
      text: "Nxirre butësisht — 6 sekonda",
      seconds: 6,
      side: "right",
      color: "#3FD0C9",
    },
  ],
};

/**
 * Koherenca e zemrës 5×5 — dy faza të barabarta, gjashtë raunde, mbi rreth.
 *
 * I njëjti mekanizëm si 4×6; ndryshojnë vetëm sekondat dhe ngjyrat. Pikërisht
 * për këtë forma u shkrua si të dhëna dhe jo si komponent më vete: ushtrimi i
 * tretë nuk shtoi asnjë rresht pamjeje.
 *
 * Audioja zgjat 61.6 s, ushtrimi 60 (6 × 10) — bishti mbetet në fund.
 */
const KOHERENCA_5X5 = {
  id: "koherenca-5x5",
  shape: "circle",
  rounds: 6,
  extraStep: {
    text: "Përsërite 6 herë (≈1 minutë) dhe vëre ndryshimin",
    color: "#8FD3C4",
  },
  phases: [
    {
      id: "in",
      corner: "MERR",
      title: "MERR FRYMË",
      text: "Merr frymë ngadalë nga hunda — 5 sekonda",
      seconds: 5,
      side: "left",
      color: "#F2D34B",
    },
    {
      id: "out",
      corner: "NXIRR",
      title: "NXIRR FRYMË",
      text: "Nxirre butësisht — 5 sekonda",
      seconds: 5,
      side: "right",
      color: "#FF8FB8",
    },
  ],
};

/**
 * Relaksim i thellë 4×8 — nxjerrja dyfish sa marrja, pesë raunde, mbi rreth.
 *
 * Nxjerrja e gjatë është vetë qëllimi i ushtrimit, dhe rrethi e tregon pa
 * fjalë: harku i dytë është dy herë më i gjatë se i pari. Pikërisht këtu
 * forma rrethore paguan — një katror do të kërkonte brinjë të pabarabarta.
 *
 * Audioja zgjat 61.2 s, ushtrimi 60 (5 × 12).
 *
 * ⚠️  Faza e dytë është LEJLA, jo rozë si te 5×5. Sfondi i këtij meditimi
 *     është magenta — ngjyra e qëllimit "Stres" — dhe mbi të harku rozë
 *     zhdukej: dy ngjyra të të njëjtës famille, njëra mbi tjetrën. Lejla e
 *     zbehtë ndahet me ndryësim ndriçimi, jo vetëm nuance, ndaj lexohet edhe
 *     aty. Ngjyrat e ushtrimeve të tjera mbeten — sfondet e tyre janë të
 *     gjelbër e blu, ku roza dallohet mirë.
 */
const RELAKSIM_4X8 = {
  id: "relaksim-4x8",
  shape: "circle",
  rounds: 5,
  extraStep: {
    text: "Përsërite 5 herë (≈1 minutë) dhe vëre ndryshimin",
    color: "#8FD3C4",
  },
  phases: [
    {
      id: "in",
      corner: "MERR",
      title: "MERR FRYMË",
      text: "Merr frymë ngadalë nga hunda — 4 sekonda",
      seconds: 4,
      side: "left",
      color: "#F2D34B",
    },
    {
      id: "out",
      corner: "NXIRR",
      title: "NXIRR FRYMË",
      text: "Nxirre ngadalë e butësisht — 8 sekonda",
      seconds: 8,
      side: "right",
      color: "#D9C6FF",
    },
  ],
};

/**
 * 4-7-8 para gjumit — TRI faza mbi rreth, katër raunde.
 *
 * Cikli 19 sekonda: 4 brenda, 7 mbajtje, 8 jashtë. Audioja zgjat 78 s, pra
 * 76 të ushtrimit (4 × 19) plus dy sekonda bisht.
 *
 * ⚠️  Mbajtja zë brinjën e sipërme të rrethit (`side: "top"`), ndërmjet
 *     ngjitjes nga e majta dhe zbritjes nga e djathta — pra rendi i etiketave
 *     rreth figurës ndjek rendin e fazave në kohë.
 *
 * ⚠️  Asnjë ngjyrë rozë: sfondi i këtij meditimi është magenta (qëllimi
 *     "Stres"), dhe roza mbi të zhduket — shih shënimin te `RELAKSIM_4X8`.
 */
const PARA_GJUMIT_478 = {
  id: "para-gjumit-4-7-8",
  shape: "circle",
  rounds: 4,
  extraStep: {
    text: "Përsërite 4 herë (≈1 minutë) dhe vëre ndryshimin",
    color: "#8FD3C4",
  },
  phases: [
    {
      id: "in",
      corner: "MERR",
      title: "MERR FRYMË",
      text: "Merr frymë ngadalë nga hunda — 4 sekonda",
      seconds: 4,
      side: "left",
      color: "#F2D34B",
    },
    {
      id: "hold",
      corner: "MBAJE",
      title: "MBAJE",
      text: "Mbaje frymën — 7 sekonda",
      seconds: 7,
      side: "top",
      color: "#D9C6FF",
    },
    {
      id: "out",
      corner: "NXIRR",
      title: "NXIRR FRYMË",
      text: "Nxirre ngadalë e butësisht — 8 sekonda",
      seconds: 8,
      side: "right",
      color: "#7FD3F2",
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
  "5ecc1612-a510-11f1-b99e-107c614af9b1": RITMIKE_4X6,
  "5ecc1a59-a510-11f1-b99e-107c614af9b1": KOHERENCA_5X5,
  "5ecc158c-a510-11f1-b99e-107c614af9b1": RELAKSIM_4X8,
  "5ecc15d3-a510-11f1-b99e-107c614af9b1": PARA_GJUMIT_478,
};

const BY_TITLE = {
  "box breathing": BOX_4X4,
  "frymëmarrje ritmike 4x6 për lirim nga stresi": RITMIKE_4X6,
  "rikthe koherencën e zemrës me frymëmarrje 5x5": KOHERENCA_5X5,
  "relaksim i thellë me frymëmarrje 4x8": RELAKSIM_4X8,
  "frymëmarrje ritmike 4x7x8 para gjumit për qetësim": PARA_GJUMIT_478,
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

  /* Sa pjesë e ciklit ka kaluar para kësaj faze — i duhet rrethit, që harku
     i fazës të nisë aty ku mbaroi i mëparshmi. */
  const before = pattern.phases
    .slice(0, index)
    .reduce((sum, p) => sum + p.seconds, 0);

  return {
    index,
    phase,
    /** Fraksioni 0→1 i të gjithë ciklit — pozicioni mbi rreth. */
    cycleProgress: (before + within) / cycle,
    /** Ku nis dhe ku mbaron faza, si fraksion i ciklit. */
    phaseStart: before / cycle,
    phaseEnd: (before + phase.seconds) / cycle,
    progress: Math.min(1, within / phase.seconds),
    /* Numërimi zbret: 4 në fillim të fazës, 1 në sekondën e fundit. */
    remaining: Math.max(1, Math.ceil(phase.seconds - within)),
    round: Math.min(round, pattern.rounds),
    done,
  };
}
