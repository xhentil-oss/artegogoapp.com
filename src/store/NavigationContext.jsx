import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_TAB, TABS } from "../config/navigation.js";

/**
 * Navigimi dhe shtresat mbi ekran (overlay).
 *
 * E gjithë gjendja e navigimit jeton këtu, në një vend. Kur të vijë momenti
 * për URL-a reale (deep links, butoni "back" i browser-it), zëvendëso
 * brendësinë e këtij provider-i me `react-router` — API-ja publike
 * (`goToTab`, `openCategory`, …) mund të mbetet e njëjtë.
 */
const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [tab, setTab] = useState(DEFAULT_TAB);
  const [category, setCategory] = useState(null);
  const [folder, setFolder] = useState(null);
  const [overlay, setOverlay] = useState({
    search: false,
    upsell: false,
    admin: false,
    notifications: false,
  });
  /* nën-pamja e skedës "Komunitet" — e mbajtur këtu, që avatari dhe zilja
     te shiriti i sipërm të mund të çojnë direkt në profil ose në feed */
  const [communityView, setCommunityView] = useState("feed");

  const setOverlayFlag = useCallback(
    (name, open) => setOverlay((prev) => ({ ...prev, [name]: open })),
    []
  );

  const goToTab = useCallback((next) => {
    setTab(next);
    /* biblioteka hapet gjithmonë në rrënjë, jo brenda një kategorie */
    if (next === TABS.LIBRARY) setCategory(null);
  }, []);

  /** Hap një kategori — kalon në bibliotekë nëse jemi gjetkë. */
  const openCategory = useCallback((intent) => {
    setTab(TABS.LIBRARY);
    setCategory(intent);
  }, []);

  /** Hap skedën "Komunitet" në një nën-pamje të caktuar (feed ose live). */
  const goToCommunity = useCallback((view = "feed") => {
    setCommunityView(view);
    setTab(TABS.COMMUNITY);
  }, []);

  const goToProfile = useCallback(() => setTab(TABS.PROFILE), []);

  /**
   * Hap panelin e admin-it, opsionalisht te një tab i caktuar.
   *
   * Pa këtë, butoni "Posto" te feed-i do ta hapte panelin te "Media" dhe
   * admini do të duhej ta gjente vetë tabin e duhur çdo herë.
   */
  const [adminTab, setAdminTab] = useState(null);
  const openAdmin = useCallback(
    (tabId = null) => {
      setAdminTab(tabId);
      setOverlayFlag("admin", true);
    },
    [setOverlayFlag]
  );

  const value = useMemo(
    () => ({
      tab,
      category,
      folder,
      overlay,
      communityView,
      setCommunityView,
      goToCommunity,
      goToProfile,
      goToTab,
      openCategory,
      closeCategory: () => setCategory(null),
      openFolder: setFolder,
      closeFolder: () => setFolder(null),
      openSearch: () => setOverlayFlag("search", true),
      closeSearch: () => setOverlayFlag("search", false),
      openUpsell: () => setOverlayFlag("upsell", true),
      closeUpsell: () => setOverlayFlag("upsell", false),
      openAdmin,
      adminTab,
      closeAdmin: () => setOverlayFlag("admin", false),
      openNotifications: () => setOverlayFlag("notifications", true),
      closeNotifications: () => setOverlayFlag("notifications", false),
    }),
    [
      tab, category, folder, overlay, communityView,
      goToCommunity, goToProfile, goToTab, openCategory, setOverlayFlag,
      openAdmin, adminTab,
    ]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation duhet të përdoret brenda <NavigationProvider>");
  return ctx;
}
