import { Bell, Search, User } from "lucide-react";
import { T, layout } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { padTop } from "../../theme/responsive.js";
import { TABS } from "../../config/navigation.js";
import { useNavigation } from "../../store/NavigationContext.jsx";

/**
 * Shiriti i sipërm: avatar, kërkim, njoftime. Ngjitet gjatë scroll-it.
 *
 * Padding-u lart shtohet me `safe-area-inset-top` që në iPhone me notch
 * (dhe si PWA pa shirit browser-i) të mos hyjë nën shiritin e statusit.
 */
export function TopBar() {
  const { openSearch, openNotifications, goToProfile, tab } = useNavigation();
  /* Profili doli nga shiriti i poshtëm, ndaj avatari është e vetmja hyrje te
     ai. Pa një shenjë aktive, asgjë në ekran nuk do të tregonte se ku je. */
  const onProfile = tab === TABS.PROFILE;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${padTop(14)} ${layout.gutter}px 10px`,
      }}
    >
      <button
        onClick={goToProfile}
        aria-label="Profili"
        aria-current={onProfile ? "page" : undefined}
        className="ag-press"
        style={{
          ...circle(44, onProfile ? "rgba(124,92,224,0.12)" : T.bg2),
          border: `1.5px solid ${onProfile ? T.accent : T.line}`,
          padding: 0,
          overflow: "hidden",
          cursor: "pointer",
          transition: "background .2s, border-color .2s",
        }}
      >
        <User size={22} color={onProfile ? T.accent : T.faint} />
      </button>

      {/* gap i vogël sepse butonat vetë mbajnë 44px zonë prekjeje */}
      <div style={{ display: "flex", gap: 2 }}>
        <IconButton onClick={openSearch} label="Kërko">
          <Search size={24} color={T.ink} />
        </IconButton>
        {/* zilja hap njoftimet ditore (seksioni 9) — më parë çonte te feed-i,
            sepse njoftimet nuk ekzistonin ende si sistem */}
        <IconButton onClick={openNotifications} label="Njoftime">
          <Bell size={24} color={T.ink} />
        </IconButton>
      </div>
    </div>
  );
}

/**
 * Zona e prekjes 44×44 (minimumi i rekomanduar), ndërsa ikona mbetet 24px.
 * Pa këtë, gishti e humb butonin në telefon.
 */
function IconButton({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="ag-press"
      style={{ ...sx.bareButton, ...sx.center, width: 44, height: 44 }}
    >
      {children}
    </button>
  );
}
