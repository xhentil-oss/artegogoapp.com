import { Bell, Search } from "lucide-react";
import { T, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { padTop } from "../../theme/responsive.js";
import { COMMUNITY_VIEWS, TABS } from "../../config/navigation.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { PillButton } from "../ui/Controls.jsx";
import { LiveDot } from "../ui/Badges.jsx";

/**
 * Shiriti i sipërm: nën-tabet e Komunitetit (vetëm aty), kërkim, njoftime.
 * Ngjitet gjatë scroll-it.
 *
 * Padding-u lart shtohet me `safe-area-inset-top` që në iPhone me notch
 * (dhe si PWA pa shirit browser-i) të mos hyjë nën shiritin e statusit.
 */
export function TopBar() {
  const { openSearch, openNotifications, tab } = useNavigation();
  /* Te Komuniteti, vendin e avatarit e zënë "Frymëzim / Live": pamja e
     klientes i kërkon në të njëjtin rresht me kërkimin dhe zilen, jo në një
     rresht të vetin nën hero. Avatari nuk humbet — hero-ja poshtë e ka të
     vetin, dhe Profili tani është tab më vete poshtë. */
  const komuniteti = tab === TABS.COMMUNITY;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        /* ⚠️  Pa sfond, në çdo skedë: aurora duhet të mbërrijë deri lart, pa
           një brez të bardhë që e pret. Turbullimi mbetet, ndaj kur faqja
           rrëshqet poshtë shiritit përmbajtja nuk përzihet me ikonat. */
        background: "transparent",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${padTop(14)} ${layout.gutter}px 10px`,
      }}
    >
      {/* ⚠️  Avatari u hoq: Profili është tab më vete te shiriti i poshtëm, dhe
          dy hyrje për të njëjtin ekran ishin një më shumë. Te Komuniteti vendin
          e zë "Frymëzim / Live"; gjetkë mbetet një hapësirë bosh, që kërkimi dhe
          zilja të rrinë djathtas. */}
      {komuniteti ? <CommunityViews /> : <span />}

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

/** Nën-tabet e Komunitetit, te vendi i avatarit. */
function CommunityViews() {
  const { communityView, setCommunityView } = useNavigation();

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {COMMUNITY_VIEWS.map((item) => (
        <PillButton
          key={item.id}
          active={communityView === item.id}
          onClick={() => setCommunityView(item.id)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {item.pulse && <LiveDot />}
          {item.label}
        </PillButton>
      ))}
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
