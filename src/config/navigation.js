/** Skedat kryesore. Përdor konstantet, jo literale, nëpër kod. */
export const TABS = {
  TODAY: "today",
  COMMUNITY: "community",
  LIBRARY: "library",
  CREATE: "create",
  PROGRAMS: "programs",
  PROFILE: "profile",
};

/**
 * SHIRITI I NAVIGIMIT — 5 tabe.
 * `featured` = butoni i mesit, i ngritur, me gradient violet.
 *
 * ⚠️  Ky rend NUK është ai i seksionit 3 të katalogut (Komunitet · Meditime ·
 *     Krijo · Programe · Profili). Klientja e ndryshoi me dorë: "Sot" u kthye
 *     i pari, si në ndërtimin fillestar, dhe Profili doli nga shiriti.
 *
 * Profili nuk ka vend këtu me qëllim: hapet nga avatari te shiriti i sipërm.
 * Mbetet te `TABS` sepse ekrani ekziston dhe navigimi çon te ai — thjesht nuk
 * zë një nga pesë vendet e poshtme.
 */
export const NAV_ITEMS = [
  { id: TABS.TODAY,     label: "Sot",       icon: "today" },
  { id: TABS.PROGRAMS,  label: "Programe",  icon: "programs" },
  { id: TABS.CREATE,    label: "Krijo",     icon: "create", featured: true },
  { id: TABS.LIBRARY,   label: "Meditime",  icon: "library" },
  { id: TABS.COMMUNITY, label: "Komunitet", icon: "community" },
];

/** Tab-i ku hapet aplikacioni — i pari i listës. */
export const DEFAULT_TAB = TABS.TODAY;

/** Nën-tabet e "Komunitet": feed frymëzimi + Live. */
export const COMMUNITY_VIEWS = [
  { id: "feed", label: "Frymëzim" },
  { id: "live", label: "Live", pulse: true },
];
