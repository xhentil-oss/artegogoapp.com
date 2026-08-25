import { T, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { NAV_ITEMS } from "../../config/navigation.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { NavIcon } from "../icons/NavIcon.jsx";
import { LotusMark } from "../icons/BrandIcons.jsx";

/**
 * Navigimi i poshtëm, i fiksuar, me butonin e ngritur "Krijo" në mes.
 *
 * Është `position: fixed`, ndaj nuk e trashëgon `max-width` të kornizës —
 * kufizohet vetë, që në desktop shiriti të mos shtrihet në gjithë ekranin.
 */
export function BottomNav() {
  const { tab, goToTab } = useNavigation();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        maxWidth: layout.frameWidth,
        margin: "0 auto",
        zIndex: 40,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(16px)",
        borderTop: `1px solid ${T.line}`,
        padding: "8px 4px calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-end",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => goToTab(item.id)}
              style={{
                ...sx.bareButton,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                padding: "4px 6px",
                flex: 1,
              }}
            >
              {item.featured ? <FeaturedButton /> : <NavIcon icon={item.icon} active={active} />}
              <span style={{ fontSize: 10.5, color: active ? T.ink : T.faint, fontWeight: active ? 700 : 500 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Butoni i mesit — i ngritur, me shkëndijë rrethuese. */
function FeaturedButton() {
  return (
    <div className="ag-press" style={{ position: "relative", marginTop: -16 }}>
      <div
        style={{
          position: "absolute",
          inset: -6,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.eve1}88, transparent 70%)`,
          filter: "blur(6px)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: `linear-gradient(145deg, ${T.eve2}, ${T.eve1})`,
          ...sx.center,
          boxShadow: `0 6px 20px ${T.eve1}88`,
        }}
      >
        <LotusMark size={28} />
      </div>
    </div>
  );
}
