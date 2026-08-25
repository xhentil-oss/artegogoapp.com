/**
 * MINI-MEDITIMET (blocks) — njësia më e vogël e luajtshme.
 *
 * `phase` përcakton pozicionin në një seancë të ndërtuar:
 *   Hapje → Korpi → Mbyllje
 * Ndërtuesi (`domain/sequence.js`) e përdor për të montuar seanca koherente.
 */
export const PHASES = { OPENING: "Hapje", CORE: "Korpi", CLOSING: "Mbyllje" };

export const BLOCKS = [
  { id: "b1",  title: "Hyrje në Trup",         intent: "calm",      phase: PHASES.OPENING, dur: 3,  premium: false, desc: "Vendosje e vëmendjes në frymëmarrje dhe trup." },
  { id: "b2",  title: "Frymëmarrje Koherente", intent: "calm",      phase: PHASES.OPENING, dur: 5,  premium: false, desc: "Ritëm 5.5 frymë/min për koherencë zemër-tru." },
  { id: "b3",  title: "Vorbulla e Zemrës",     intent: "heart",     phase: PHASES.CORE,    dur: 7,  premium: true,  desc: "Ndjesi vortex në kraharor, hapje e qendrës së zemrës." },
  { id: "b4",  title: "Lulëzimi",              intent: "heart",     phase: PHASES.CORE,    dur: 6,  premium: true,  desc: "Zgjerimi i fushës së zemrës, ndjesi blooming." },
  { id: "b5",  title: "Fëmija i Brendshëm",    intent: "heal",      phase: PHASES.CORE,    dur: 8,  premium: true,  desc: "Takim me arketipin e Fëmijës, butësi e shërim." },
  { id: "b6",  title: "Mbrojtësi",             intent: "heal",      phase: PHASES.CORE,    dur: 6,  premium: true,  desc: "Integrim i arketipit Mbrojtës/Kontrollues." },
  { id: "b7",  title: "Drita e Fokusit",       intent: "focus",     phase: PHASES.CORE,    dur: 5,  premium: false, desc: "Tone izokronike për vëmendje të mprehtë." },
  { id: "b8",  title: "Vala e Theta-s",        intent: "transform", phase: PHASES.CORE,    dur: 9,  premium: true,  desc: "Gjendje e thellë theta, akses te Vetja e Lartë." },
  { id: "b9",  title: "Shtegu i Gjumit",       intent: "sleep",     phase: PHASES.CORE,    dur: 10, premium: false, desc: "Zbritje graduale drejt deltës dhe pushimit." },
  { id: "b10", title: "Zjarri i Energjisë",    intent: "energy",    phase: PHASES.CORE,    dur: 5,  premium: true,  desc: "Aktivizim, ngjitje e energjisë nëpër shtylla." },
  { id: "b11", title: "Çlirimi",               intent: "stress",    phase: PHASES.CORE,    dur: 6,  premium: false, desc: "Lëshimi i tensionit, valë lëshuese sub-bas." },
  { id: "b12", title: "Mbyllje me Mirënjohje", intent: "calm",      phase: PHASES.CLOSING, dur: 3,  premium: false, desc: "Integrim, mirënjohje, kthim i butë." },
  { id: "b13", title: "Vula e Vetes së Lartë", intent: "transform", phase: PHASES.CLOSING, dur: 4,  premium: true,  desc: "Ankorim i gjendjes së re të qenies." },
  { id: "b14", title: "Afirmime Bollëku",      intent: "abundance", phase: PHASES.CORE,    dur: 7,  premium: true,  desc: "Riprogramim i besimeve për bollëk dhe vlerë." },
  { id: "b15", title: "Përqafimi i Vetes",     intent: "selflove",  phase: PHASES.CORE,    dur: 6,  premium: true,  desc: "Butësi dhe pranim i thellë i vetes." },
];

/** Qëllimet e rekomanduara sipas pjesës së ditës (shih `lib/time.js`). */
export const DAY_PART_INTENTS = {
  morning: ["energy", "focus", "abundance"],
  afternoon: ["focus", "calm", "stress"],
  evening: ["calm", "heart", "heal"],
  night: ["sleep", "calm"],
};
