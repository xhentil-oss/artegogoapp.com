import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  MessageCircle,
  Radio,
  RotateCcw,
  Tags,
  Upload,
} from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { resetAdmin } from "../../services/adminStore.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { MediaTab } from "./tabs/MediaTab.jsx";
import { ClassificationTab } from "./tabs/ClassificationTab.jsx";
import { PoolsTab } from "./tabs/PoolsTab.jsx";
import { ProgramsTab } from "./tabs/ProgramsTab.jsx";
import { CommunityTab } from "./tabs/CommunityTab.jsx";
import { LiveTab } from "./tabs/LiveTab.jsx";

/** Gjashtë tabet e seksionit 11, në të njëjtin rend si te specifikimi. */
const PANEL_TABS = [
  { id: "media", label: "Media", icon: Upload, Component: MediaTab },
  { id: "classification", label: "Klasifikimi", icon: Tags, Component: ClassificationTab },
  { id: "pools", label: "Njoftimet", icon: Bell, Component: PoolsTab },
  { id: "programs", label: "Programet", icon: CalendarDays, Component: ProgramsTab },
  { id: "community", label: "Komuniteti", icon: MessageCircle, Component: CommunityTab },
  { id: "live", label: "Live", icon: Radio, Component: LiveTab },
];

/**
 * PANELI I ADMINISTRATORIT (seksioni 11).
 *
 * Çdo ndryshim këtu shkruhet te `services/adminStore` dhe duket menjëherë në
 * aplikacion — klasifikimi te biblioteka, pool-et te njoftimet, programet te
 * skeda e tyre, postimet dhe Live te komuniteti. Kjo është dallimi mes një
 * paneli të vërtetë dhe një pamjeje demo.
 *
 * ⚠️  Ruajtja është lokale, në pajisjen e admin-it. Në aplikacionin e vërtetë
 *     këto kalojnë te backend-i dhe i shohin të gjithë përdoruesit.
 */
export function AdminPanel() {
  const { closeAdmin, adminTab } = useNavigation();
  /* Tab-i fillestar vjen nga kush e hapi panelin — p.sh. butoni "Posto" te
     feed-i e çon drejt te "Komuniteti". */
  const [tab, setTab] = useState(adminTab ?? "media");
  useBodyScrollLock();

  const active = PANEL_TABS.find((t) => t.id === tab) ?? PANEL_TABS[0];
  const Active = active.Component;

  const reset = () => {
    /* Fshirja prek vetëm mbishkrimet; përmbajtja bazë nuk cenohet kurrë. */
    if (window.confirm("Të hiqen të gjitha ndryshimet e panelit? Përmbajtja bazë mbetet.")) {
      resetAdmin();
    }
  };

  return (
    <div
      className="ag-fullscreen"
      style={{
        ...sx.fullSheet,
        zIndex: 65,
        padding: `${padTop(20)} ${layout.gutter}px ${padBottom(40)}`,
      }}
    >
      <div style={{ maxWidth: layout.frameWidth, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <button onClick={closeAdmin} aria-label="Mbyll panelin" style={sx.bareButton}>
            <ArrowLeft size={24} color={T.ink} />
          </button>

          <div style={sx.flexText}>
            <div style={{ color: T.ink, fontSize: 20, fontWeight: 800 }}>Paneli i Admin-it</div>
            <div style={{ color: T.sub, fontSize: 12 }}>Ndryshimet duken menjëherë</div>
          </div>

          <button
            onClick={reset}
            aria-label="Hiq të gjitha ndryshimet"
            className="ag-press"
            style={{
              ...sx.bareButton,
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: T.sub,
              fontSize: 12,
              padding: 8,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <RotateCcw size={14} /> Rivendos
          </button>
        </header>

        <nav
          className="ag-scroll-x"
          style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto" }}
        >
          {PANEL_TABS.map(({ id, label, icon: Icon }) => {
            const on = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-pressed={on}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: on ? T.ink : T.bg2,
                  color: on ? "#fff" : T.sub,
                  border: `1px solid ${on ? T.ink : T.line}`,
                  borderRadius: radii.md,
                  padding: "10px 15px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <Icon size={15} /> {label}
              </button>
            );
          })}
        </nav>

        <Active />
      </div>
    </div>
  );
}
