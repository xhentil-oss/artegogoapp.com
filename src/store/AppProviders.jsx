import { SessionProvider } from "./SessionContext.jsx";
import { NavigationProvider } from "./NavigationContext.jsx";
import { ProgressProvider } from "./ProgressContext.jsx";
import { CollectionsProvider } from "./CollectionsContext.jsx";
import { CommunityProvider } from "./CommunityContext.jsx";
import { JourneyProvider } from "./JourneyContext.jsx";
import { PlayerProvider } from "./PlayerContext.jsx";

/**
 * Rendi ka kuptim: `PlayerProvider` konsumon `Navigation` (kalon në Profil
 * pas përmbylljes), `Progress` (regjistron seancën) dhe `Journey` (shënon
 * ditën e kryer të programit), ndaj qëndron më i brendshmi. `Collections` rri
 * mbi të, sepse ekrani i përmbylljes ruan seancën e krijuar.
 *
 * `Community` (pëlqimet dhe të ruajturat e postimeve) nuk konsumon asnjë të
 * tjetër, ndaj vendi i saj është i lirë; rri pranë `Collections` sepse të dyja
 * mbajnë lista të përdoruesit dhe lexohen nga i njëjti ekran — profili.
 */
export function AppProviders({ children }) {
  return (
    <SessionProvider>
      <NavigationProvider>
        <ProgressProvider>
          <CollectionsProvider>
            <CommunityProvider>
              <JourneyProvider>
                <PlayerProvider>{children}</PlayerProvider>
              </JourneyProvider>
            </CommunityProvider>
          </CollectionsProvider>
        </ProgressProvider>
      </NavigationProvider>
    </SessionProvider>
  );
}
