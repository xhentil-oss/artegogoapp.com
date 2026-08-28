import { SessionProvider } from "./SessionContext.jsx";
import { NavigationProvider } from "./NavigationContext.jsx";
import { ProgressProvider } from "./ProgressContext.jsx";
import { CollectionsProvider } from "./CollectionsContext.jsx";
import { JourneyProvider } from "./JourneyContext.jsx";
import { PlayerProvider } from "./PlayerContext.jsx";

/**
 * Rendi ka kuptim: `PlayerProvider` konsumon `Navigation` (kalon në Profil
 * pas përmbylljes), `Progress` (regjistron seancën) dhe `Journey` (shënon
 * ditën e kryer të programit), ndaj qëndron më i brendshmi. `Collections` rri
 * mbi të, sepse ekrani i përmbylljes ruan seancën e krijuar.
 */
export function AppProviders({ children }) {
  return (
    <SessionProvider>
      <NavigationProvider>
        <ProgressProvider>
          <CollectionsProvider>
            <JourneyProvider>
              <PlayerProvider>{children}</PlayerProvider>
            </JourneyProvider>
          </CollectionsProvider>
        </ProgressProvider>
      </NavigationProvider>
    </SessionProvider>
  );
}
