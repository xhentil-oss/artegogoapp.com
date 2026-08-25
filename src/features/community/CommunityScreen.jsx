import { layout } from "../../theme/tokens.js";
import { COMMUNITY_VIEWS } from "../../config/navigation.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { PillButton } from "../../components/ui/Controls.jsx";
import { LiveDot } from "../../components/ui/Badges.jsx";
import { FeedList } from "./FeedList.jsx";
import { LiveScreen } from "./LiveScreen.jsx";

/**
 * Skeda "Komunitet": feed frymëzimi + nën-tab "Live".
 *
 * Profili u shkëput që këtu dhe u bë tab-i i 5-të, sipas specifikimit.
 *
 * Nën-pamja jeton në `NavigationContext`, jo në state lokal, sepse zilja te
 * shiriti i sipërm çon direkt te feed-i.
 */
export function CommunityScreen() {
  const { communityView: view, setCommunityView: setView } = useNavigation();

  return (
    <div>
      <div
        className="ag-scroll-x"
        style={{ display: "flex", gap: 8, padding: `12px ${layout.gutter}px 4px`, overflowX: "auto" }}
      >
        {COMMUNITY_VIEWS.map((item) => (
          <PillButton
            key={item.id}
            active={view === item.id}
            onClick={() => setView(item.id)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {item.pulse && <LiveDot />}
            {item.label}
          </PillButton>
        ))}
      </div>

      {view === "live" ? <LiveScreen /> : <FeedList />}
    </div>
  );
}
