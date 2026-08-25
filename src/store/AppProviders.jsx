import { SessionProvider } from "./SessionContext.jsx";
import { NavigationProvider } from "./NavigationContext.jsx";
import { ProgressProvider } from "./ProgressContext.jsx";
import { PlayerProvider } from "./PlayerContext.jsx";

/**
 * Rendi ka kuptim: `PlayerProvider` konsumon `Navigation` (kalon në
 * "Komunitet" pas përmbylljes) dhe `Progress` (regjistron seancën),
 * ndaj qëndron më i brendshmi.
 */
export function AppProviders({ children }) {
  return (
    <SessionProvider>
      <NavigationProvider>
        <ProgressProvider>
          <PlayerProvider>{children}</PlayerProvider>
        </ProgressProvider>
      </NavigationProvider>
    </SessionProvider>
  );
}
