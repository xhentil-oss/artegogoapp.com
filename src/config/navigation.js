/** Skedat kryesore. Përdor konstantet, jo literale, nëpër kod. */
export const TABS = {
  COMMUNITY: "community",
  LIBRARY: "library",
  CREATE: "create",
  PROGRAMS: "programs",
  PROFILE: "profile",
};

/**
 * SHIRITI I NAVIGIMIT — 5 tabe, në rendin e specifikimit (seksioni 3).
 * `featured` = butoni i mesit, i ngritur, me gradient violet.
 *
 * Rendi nuk është arbitrar: specifikimi i numëron 1–5 pikërisht kështu.
 */
export const NAV_ITEMS = [
  { id: TABS.COMMUNITY, label: "Komunitet", icon: "community" },
  { id: TABS.LIBRARY,   label: "Meditime",  icon: "library" },
  { id: TABS.CREATE,    label: "Krijo",     icon: "create", featured: true },
  { id: TABS.PROGRAMS,  label: "Programe",  icon: "programs" },
  { id: TABS.PROFILE,   label: "Profili",   icon: "profile" },
];

/** Tab-i ku hapet aplikacioni — i pari i listës. */
export const DEFAULT_TAB = TABS.COMMUNITY;

/**
 * Nën-tabet e "Komunitet": feed frymëzimi + Live.
 * Profili u shkëput që këtu dhe u bë tab-i i 5-të, sipas specifikimit.
 */
export const COMMUNITY_VIEWS = [
  { id: "feed", label: "Frymëzim" },
  { id: "live", label: "Live", pulse: true },
];
