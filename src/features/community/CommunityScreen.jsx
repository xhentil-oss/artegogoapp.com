import { useNavigation } from "../../store/NavigationContext.jsx";
import { CommunityHero } from "./CommunityHero.jsx";
import { FeedList } from "./FeedList.jsx";
import { LiveScreen } from "./LiveScreen.jsx";

/**
 * Skeda "Komunitet": hero + feed frymëzimi + nën-tab "Live".
 *
 * ⚠️  Pilulat "Frymëzim / Live" nuk janë më këtu: me kërkesë të klientes
 *     ngjitën te shiriti i sipërm, në një rresht me kërkimin dhe zilen.
 *     Vizatohen te `TopBar`, por gjendja mbetet po ajo e `NavigationContext`,
 *     ndaj zilja dhe avatari vazhdojnë t'i çojnë te pamja e duhur.
 */
export function CommunityScreen() {
  const { communityView: view } = useNavigation();

  return (
    <div>
      <CommunityHero />

      {view === "live" ? <LiveScreen /> : <FeedList />}
    </div>
  );
}
