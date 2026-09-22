import { useEffect } from "react";
import { sx } from "./theme/styles.js";
import { TABS } from "./config/navigation.js";

import { AppProviders } from "./store/AppProviders.jsx";
import { useSession } from "./store/SessionContext.jsx";
import { useNavigation } from "./store/NavigationContext.jsx";
import { usePlayer } from "./store/PlayerContext.jsx";

import { AppShell } from "./components/layout/AppShell.jsx";
import { TopBar } from "./components/layout/TopBar.jsx";
import { BottomNav } from "./components/layout/BottomNav.jsx";

import { AuthScreen } from "./features/auth/AuthScreen.jsx";
import { resetTokenFromUrl } from "./services/auth.js";
import { OnboardingScreen } from "./features/onboarding/OnboardingScreen.jsx";
import { TodayScreen } from "./features/today/TodayScreen.jsx";
import { CommunityScreen } from "./features/community/CommunityScreen.jsx";
import { LibraryScreen } from "./features/library/LibraryScreen.jsx";
import { CategoryScreen } from "./features/library/CategoryScreen.jsx";
import { FolderSheet } from "./features/library/FolderSheet.jsx";
import { MeditationSheet } from "./features/library/MeditationSheet.jsx";
import { CreateScreen } from "./features/create/CreateScreen.jsx";
import { ProgramsScreen } from "./features/programs/ProgramsScreen.jsx";
import { ProfileScreen } from "./features/profile/ProfileScreen.jsx";
import { SearchSheet } from "./features/search/SearchSheet.jsx";
import { UpsellSheet } from "./features/premium/UpsellSheet.jsx";
import { AdminPanel } from "./features/admin/AdminPanel.jsx";
import { PlayerSheet } from "./features/player/PlayerSheet.jsx";
import { MiniPlayer } from "./features/player/MiniPlayer.jsx";
import { CompletionSheet } from "./features/player/CompletionSheet.jsx";
import { NotificationsSheet } from "./features/notifications/NotificationsSheet.jsx";
import { useAdminVersion } from "./hooks/useAdmin.js";
import { useCatalogVersion } from "./hooks/useCatalog.js";
import { CatalogNotice } from "./components/CatalogNotice.jsx";

/**
 * Rrënja e aplikacionit — vetëm kompozim.
 *
 * Gjendja jeton në `store/`, përmbajtja në `services/contentRepository`,
 * pamja në `features/`. Këtu vendoset vetëm ÇFARË shfaqet, jo SI.
 */
export default function App() {
  return (
    <AppProviders>
      <Root />
    </AppProviders>
  );
}

function Root() {
  const { hasAccount, isOnboarded, ready } = useSession();
  /* Abonimi rri këtu, në rrënjë: një ndryshim i admin-it prek klasifikimin,
     pool-et, programet dhe feed-in njëherësh, ndaj ripërpunimi i tërë pemës
     është edhe më i thjeshtë edhe më i saktë se abonime nëpër çdo ekran. */
  useAdminVersion();
  /*
   * I njëjti arsyetim si për admin-in, por për katalogun: kur ai mbërrin pas
   * render-it të parë — server i ngadaltë, ose një riprovë pas dështimit —
   * pema duhet ripërpunuar, përndryshe ekranet mbeten me përmbajtjen lokale.
   */
  useCatalogVersion();

  /* derisa të lexohet ruajtja nuk dimë nëse duhet onboarding-u — një pamje
     bosh e shkurtër është më e mirë se një pulsim i ekranit të gabuar */
  if (!ready) return <AppShell light />;

  /*
   * LINK-U I RIVENDOSJES KA PËRPARËSI MBI SESIONIN.
   *
   * ⚠️  Pa këtë, kush ishte ende i futur te pajisja dhe klikonte link-un e
   *     email-it hynte DREJT te aplikacioni: `AuthScreen` — i vetmi që e lexon
   *     `?reset=` — vizatohej vetëm te dega `!hasAccount`, ndaj forma e
   *     fjalëkalimit të ri nuk shfaqej kurrë. Link-u dukej sikur nuk bënte
   *     asgjë, dhe token-i mbetej i pashfrytëzuar te adresa deri sa skadonte.
   *
   * ⚠️  Lexohet gjatë render-it, jo te `useState`. Pas rivendosjes AuthScreen
   *     e heq `?reset=` nga adresa dhe gjendja e sesionit ndryshon — pra ky
   *     render i dytë e gjen adresën të pastër dhe kalon më tej vetë. Po ta
   *     ruanim te gjendja, ekrani i rivendosjes do të ngecte përgjithmonë.
   *
   * Nëse token-i i takon një llogarie tjetër nga ajo e hapur, `adoptAccount`
   * e trajton: profili i vjetër hiqet dhe onboarding-u rinis.
   */
  if (resetTokenFromUrl()) {
    return (
      <AppShell light>
        <AuthScreen />
      </AppShell>
    );
  }

  /* Dy porta, në rend: pa llogari → hyrje; me llogari po pa profil → onboarding. */
  if (!hasAccount) {
    return (
      <AppShell light>
        <AuthScreen />
      </AppShell>
    );
  }

  if (!isOnboarded) {
    return (
      <AppShell light>
        <OnboardingScreen />
      </AppShell>
    );
  }

  return (
    <AppShell light>
      <TopBar />
      <CatalogNotice />
      <ActiveTab />
      <BottomNav />
      <Overlays />
    </AppShell>
  );
}

/**
 * Skeda aktive — pesë, në rendin e specifikimit.
 * `key` rinis animacionin e hyrjes në çdo ndryshim pamjeje.
 */
function ActiveTab() {
  const { tab, category } = useNavigation();

  /**
   * Çdo skedë e re nis NGA KRYE.
   *
   * ⚠️  Faqja rrëshqet te dritarja (`.ag-viewport` ka vetëm `min-height`),
   *     ndaj pozicioni i rrëshqitjes është i përbashkët për të pesta skedat.
   *     Pa këtë, kalimi nga fundi i një liste te një skedë tjetër e nxirrte
   *     atë të hapur në mes — me titullin dhe hero-n e saj të mbetura sipër.
   *
   *     Pa animacion me qëllim: rrëshqitja e butë do të rridhte në të njëjtën
   *     kohë me hyrjen e faqes (`ag-page`) dhe të dyja bashkë duken si një
   *     kërcim.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, category]);

  return (
    <div key={`${tab}-${category ?? ""}`} className="ag-page" style={sx.page}>
      {tab === TABS.TODAY && <TodayScreen />}
      {tab === TABS.COMMUNITY && <CommunityScreen />}
      {tab === TABS.LIBRARY && (category ? <CategoryScreen intent={category} /> : <LibraryScreen />)}
      {tab === TABS.CREATE && <CreateScreen />}
      {tab === TABS.PROGRAMS && <ProgramsScreen />}
      {tab === TABS.PROFILE && <ProfileScreen />}
    </div>
  );
}

/**
 * Shtresat mbi ekran, të renditura sipas z-index-it:
 * mini-player (45) → folder (55) → meditimi (58) → kërkim (60) → player (60)
 * → përmbyllje / admin (65) → upsell (70)
 */
function Overlays() {
  const { folder, meditation, overlay } = useNavigation();
  const { active, minimized, completed } = usePlayer();

  return (
    <>
      {minimized && !active && <MiniPlayer sequence={minimized} />}
      {folder && <FolderSheet collection={folder} />}
      {meditation && <MeditationSheet item={meditation} />}
      {overlay.search && <SearchSheet />}
      {active && <PlayerSheet sequence={active} />}
      {completed && <CompletionSheet sequence={completed} />}
      {overlay.admin && <AdminPanel />}
      {overlay.notifications && <NotificationsSheet />}
      {overlay.upsell && <UpsellSheet />}
    </>
  );
}
