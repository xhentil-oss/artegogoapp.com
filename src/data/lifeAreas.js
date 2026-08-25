/**
 * KËRKO SIPAS KATEGORIVE — fushat e jetës, për skedën "Programe".
 *
 * Programet mbajnë një `intent`; fushat e jetës janë një shtresë mbi ta, më e
 * afërt me mënyrën si e mendon përdoruesi ("dua të punoj me trupin"), sesa
 * taksonomia e brendshme e qëllimeve.
 *
 * Një qëllim mund t'i takojë më shumë se një fushe — `transform` është njësoj
 * punë e mendjes sa e shpirtit — ndaj `intents` është listë, jo vlerë e vetme.
 */
export const LIFE_AREAS = [
  { id: "mind",     label: "Mendja",  intents: ["focus", "calm", "stress", "transform"] },
  { id: "spirit",   label: "Shpirti", intents: ["heart", "selflove", "heal", "transform"] },
  { id: "body",     label: "Trupi",   intents: ["sleep", "heal", "energy"] },
  { id: "business", label: "Biznesi", intents: ["abundance", "energy", "focus"] },
];

/** Vlera e filtrit kur nuk është zgjedhur asnjë fushë. */
export const ALL_AREAS = "all";
