import { useState } from "react";
import {
  ArrowLeft,
  Crown,
  Grid3x3,
  MessageCircle,
  Music,
  Plus,
  Send,
  Upload,
  Users,
} from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { autoGrid, padTop, padBottom } from "../../theme/responsive.js";
import { intentMeta } from "../../domain/intent.js";
import { listIntentions } from "../../services/contentRepository.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";

const TABS = [
  { id: "audio", label: "Audio", icon: Upload },
  { id: "categories", label: "Kategori", icon: Grid3x3 },
  { id: "feed", label: "Feed", icon: MessageCircle },
  { id: "users", label: "Përdorues", icon: Users },
];

/* Të dhëna demo — do t'i zëvendësojë API-ja e admin-it. */
const DEMO_UPLOADS = ["Vorbulla e Zemrës.m4a", "Vala e Theta-s.m4a", "Çlirimi.mp3"];
const DEMO_USERS = [
  { name: "Ana K.", tier: "Premium", premium: true, intent: "heart" },
  { name: "Besi M.", tier: "Falas", premium: false, intent: "calm" },
  { name: "Drita P.", tier: "Premium", premium: true, intent: "transform" },
  { name: "Eron T.", tier: "Falas", premium: false, intent: "energy" },
];

/** Paneli i admin-it. Struktura është gati; veprimet lidhen me backend-in. */
export function AdminPanel() {
  const { closeAdmin } = useNavigation();
  const [tab, setTab] = useState("audio");
  useBodyScrollLock();

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
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <button onClick={closeAdmin} style={sx.bareButton}>
            <ArrowLeft size={24} color={T.ink} />
          </button>
          <div>
            <div style={{ color: T.ink, fontSize: 20, fontWeight: 800 }}>Paneli i Admin-it</div>
            <div style={{ color: T.sub, fontSize: 12 }}>Menaxho përmbajtjen (demo)</div>
          </div>
        </header>

        <nav className="ag-scroll-x" style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: active ? T.ink : T.bg2,
                  color: active ? "#fff" : T.sub,
                  border: `1px solid ${active ? T.ink : T.line}`,
                  borderRadius: radii.md,
                  padding: "10px 15px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={15} /> {label}
              </button>
            );
          })}
        </nav>

        {tab === "audio" && <AudioTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "feed" && <FeedTab />}
        {tab === "users" && <UsersTab />}
      </div>
    </div>
  );
}

function AudioTab() {
  return (
    <section style={sx.panel}>
      <div
        style={{
          border: `2px dashed ${T.line}`,
          borderRadius: radii.lg,
          padding: 40,
          textAlign: "center",
          marginBottom: 16,
          background: T.bg,
        }}
      >
        <Upload size={30} color={T.faint} style={{ marginBottom: 10 }} />
        <div style={{ color: T.ink, fontSize: 15, fontWeight: 700 }}>Ngarko audio meditimi</div>
        <div style={{ color: T.sub, fontSize: 12, marginTop: 6 }}>.mp3, .m4a, .wav (demo)</div>
      </div>

      {DEMO_UPLOADS.map((file, i) => (
        <div
          key={file}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            background: T.bg,
            borderRadius: radii.md,
            marginBottom: 8,
            border: `1px solid ${T.line}`,
          }}
        >
          <Music size={16} color={T.eve1} />
          <span style={{ flex: 1, color: T.ink, fontSize: 13.5 }}>{file}</span>
          <span style={{ color: T.faint, fontSize: 11 }}>
            {6 + i}:0{i}m
          </span>
        </div>
      ))}
    </section>
  );
}

function CategoriesTab() {
  return (
    <div style={autoGrid(118, 12)}>
      {listIntentions().map((intention) => (
        <div
          key={intention.id}
          style={{
            background: tile(intention.g),
            borderRadius: radii.lg,
            padding: 16,
            minHeight: 90,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <intention.icon size={22} color="#fff" />
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{intention.label}</div>
        </div>
      ))}

      <button
        style={{
          background: T.bg2,
          border: `2px dashed ${T.line}`,
          borderRadius: radii.lg,
          color: T.sub,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 90,
        }}
      >
        <Plus size={22} /> Shto
      </button>
    </div>
  );
}

function FeedTab() {
  return (
    <section style={sx.panel}>
      <textarea
        placeholder="Postim i ri për feed-in…"
        style={{
          width: "100%",
          boxSizing: "border-box",
          minHeight: 100,
          background: T.bg,
          border: `1px solid ${T.line}`,
          borderRadius: radii.md,
          padding: 14,
          color: T.ink,
          outline: "none",
          resize: "vertical",
          marginBottom: 12,
        }}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <button
          style={{
            flex: 1,
            background: T.bg,
            border: `1px solid ${T.line}`,
            borderRadius: radii.md,
            padding: 12,
            color: T.sub,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            ...sx.center,
            gap: 6,
          }}
        >
          <Upload size={15} /> Foto/Video
        </button>
        <button
          style={{
            flex: 1,
            background: T.ink,
            color: "#fff",
            border: "none",
            borderRadius: radii.md,
            padding: 12,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            ...sx.center,
            gap: 6,
          }}
        >
          <Send size={15} /> Publiko
        </button>
      </div>
    </section>
  );
}

function UsersTab() {
  return (
    <section style={sx.panel}>
      {DEMO_USERS.map((user, i) => (
        <div
          key={user.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderBottom: i < DEMO_USERS.length - 1 ? `1px solid ${T.line}` : "none",
          }}
        >
          <div style={circle(36, tile(intentMeta(user.intent).g))} />
          <span style={{ flex: 1, color: T.ink, fontSize: 14 }}>{user.name}</span>
          {user.premium ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: T.gold,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Crown size={12} /> PREMIUM
            </span>
          ) : (
            <span style={{ color: T.faint, fontSize: 12 }}>{user.tier}</span>
          )}
        </div>
      ))}
    </section>
  );
}
