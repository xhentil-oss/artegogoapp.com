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
 * Ky rend është ai i seksionit 3 të katalogut, i rikonfirmuar nga klientja më
 * 16 shtator 2026: Komunitet · Meditime · Krijo · Programe · Profili.
 *
 * ⚠️  "Sot" doli nga shiriti me kërkesë. Ekrani `TodayScreen` dhe `TABS.TODAY`
 *     nuk u fshinë — dega te `App.jsx` rri aty dhe kthimi i tij do të thotë
 *     vetëm një rresht këtu. Asgjë tjetër nuk e vendos më këtë tab, ndaj
 *     aplikacioni nuk kalon dot aksidentalisht te një ekran pa vend në shirit.
 *
 * ⚠️  Profili u kthye te shiriti. Vazhdon të hapet edhe nga avatari lart —
 *     të dyja rrugët thërrasin të njëjtin tab, ndaj nuk ka gjendje të dyfishtë.
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

/** Nën-tabet e "Komunitet": feed frymëzimi + Live. */
export const COMMUNITY_VIEWS = [
  { id: "feed", label: "Frymëzim" },
  { id: "live", label: "Live", pulse: true },
];
