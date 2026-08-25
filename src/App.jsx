import { sx } from "./theme/styles.js";
import { TABS } from "./config/navigation.js";

import { AppProviders } from "./store/AppProviders.jsx";
import { useSession } from "./store/SessionContext.jsx";
import { useNavigation } from "./store/NavigationContext.jsx";
import { usePlayer } from "./store/PlayerContext.jsx";

import { AppShell } from "./components/layout/AppShell.jsx";
import { TopBar } from "./components/layout/TopBar.jsx";
import { BottomNav } from "./components/layout/BottomNav.jsx";

import { OnboardingScreen } from "./features/onboarding/OnboardingScreen.jsx";
import { CommunityScreen } from "./features/community/CommunityScreen.jsx";
import { LibraryScreen } from "./features/library/LibraryScreen.jsx";
import { CategoryScreen } from "./features/library/CategoryScreen.jsx";
import { FolderSheet } from "./features/library/FolderSheet.jsx";
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
  const { isAuthenticated, ready } = useSession();
  /* Abonimi rri këtu, në rrënjë: një ndryshim i admin-it prek klasifikimin,
     pool-et, programet dhe feed-in njëherësh, ndaj ripërpunimi i tërë pemës
     është edhe më i thjeshtë edhe më i saktë se abonime nëpër çdo ekran. */
  useAdminVersion();

  /* derisa të lexohet ruajtja nuk dimë nëse duhet onboarding-u — një pamje
     bosh e shkurtër është më e mirë se një pulsim i ekranit të gabuar */
  if (!ready) return <AppShell light />;

  if (!isAuthenticated) {
    return (
      <AppShell>
        <OnboardingScreen />
      </AppShell>
    );
  }

  return (
    <AppShell light>
      <TopBar />
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

  return (
    <div key={`${tab}-${category ?? ""}`} className="ag-page" style={sx.page}>
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
 * mini-player (45) → folder (55) → kërkim (60) → player (60)
 * → përmbyllje / admin (65) → upsell (70)
 */
function Overlays() {
  const { folder, overlay } = useNavigation();
  const { active, minimized, completed } = usePlayer();

  return (
    <>
      {minimized && !active && <MiniPlayer sequence={minimized} />}
      {folder && <FolderSheet collection={folder} />}
      {overlay.search && <SearchSheet />}
      {active && <PlayerSheet sequence={active} />}
      {completed && <CompletionSheet sequence={completed} />}
      {overlay.admin && <AdminPanel />}
      {overlay.notifications && <NotificationsSheet />}
      {overlay.upsell && <UpsellSheet />}
    </>
  );
}
