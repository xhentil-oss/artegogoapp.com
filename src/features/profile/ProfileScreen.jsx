import { Crown, Settings, User } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile, brandPair } from "../../theme/gradients.js";
import { useSession } from "../../store/SessionContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useProgress } from "../../store/ProgressContext.jsx";
import { StatRow } from "../../components/ui/Charts.jsx";
import { ToggleSwitch } from "../../components/ui/Controls.jsx";
import { Paywall } from "../premium/Paywall.jsx";
import { DailyRhythm } from "./DailyRhythm.jsx";
import { MoodTracker } from "./MoodTracker.jsx";
import { HabitTracker } from "./HabitTracker.jsx";
import { PracticeHistory } from "./PracticeHistory.jsx";

/** Avatari mban çiftin Violet të paletës. */
const AVATAR_GRADIENT = brandPair;

/** Profili: identiteti, statistikat, trackerat, historiku, opsioni admin. */
export function ProfileScreen() {
  const { name, isPremium, isAdmin, setIsAdmin } = useSession();
  const { openAdmin } = useNavigation();
  const { history } = useProgress();

  const totalMinutes = history.reduce((sum, entry) => sum + entry.min, 0);

  return (
    <div style={{ padding: `0 ${layout.gutter}px 8px` }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, margin: "12px 0 20px" }}>
        <div style={circle(64, tile(AVATAR_GRADIENT))}>
          <User size={28} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: T.ink, fontSize: 20, fontWeight: 800 }}>{name}</div>
          <div style={{ color: T.sub, fontSize: 13.5, marginTop: 2 }}>
            {isPremium ? (
              <span style={{ color: T.gold, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Crown size={13} /> Premium
              </span>
            ) : (
              "Llogari Falas"
            )}
          </div>
        </div>
      </header>

      <div style={{ marginBottom: 20 }}>
        <StatRow
          stats={[
            { value: totalMinutes, label: "MINUTA" },
            { value: history.length, label: "SEANCA" },
            { value: 6, label: "RRJESHT" },
          ]}
        />
      </div>

      {!isPremium && (
        <div style={{ marginBottom: 20 }}>
          <Paywall feature="Akses i plotë në të gjitha kategoritë dhe programet" />
        </div>
      )}

      <DailyRhythm />
      <MoodTracker />
      <HabitTracker />
      <PracticeHistory history={history} />

      <div
        style={{
          ...sx.panel,
          borderRadius: radii.lg,
          padding: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Settings size={18} color={T.sub} />
          <span style={{ color: T.ink, fontSize: 14, fontWeight: 600 }}>Modaliteti Admin (demo)</span>
        </div>
        <ToggleSwitch checked={isAdmin} onChange={setIsAdmin} />
      </div>

      {isAdmin && (
        <button
          onClick={openAdmin}
          style={{
            width: "100%",
            background: T.ink,
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: 14,
            cursor: "pointer",
            fontSize: 14.5,
            fontWeight: 700,
            ...sx.center,
            gap: 8,
          }}
        >
          <Settings size={16} /> Hap Panelin e Admin-it
        </button>
      )}
    </div>
  );
}
