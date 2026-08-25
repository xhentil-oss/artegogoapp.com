import { SessionProvider } from "./SessionContext.jsx";
import { NavigationProvider } from "./NavigationContext.jsx";
import { ProgressProvider } from "./ProgressContext.jsx";
import { CollectionsProvider } from "./CollectionsContext.jsx";
import { PlayerProvider } from "./PlayerContext.jsx";

/**
 * Rendi ka kuptim: `PlayerProvider` konsumon `Navigation` (kalon në Profil
 * pas përmbylljes) dhe `Progress` (regjistron seancën), ndaj qëndron më i
 * brendshmi. `Collections` rri mbi të, sepse ekrani i përmbylljes ruan
 * seancën e krijuar dhe player-i shënon të preferuarat.
 */
export function AppProviders({ children }) {
  return (
    <SessionProvider>
      <NavigationProvider>
        <ProgressProvider>
          <CollectionsProvider>
            <PlayerProvider>{children}</PlayerProvider>
          </CollectionsProvider>
        </ProgressProvider>
      </NavigationProvider>
    </SessionProvider>
  );
}
