import { useCallback, useEffect, useState } from "react";
import { Crown, RefreshCw, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { T, radii } from "../../../theme/tokens.js";
import { sx } from "../../../theme/styles.js";
import { MONTHS_SHORT } from "../../../lib/time.js";
import { fetchUserStats, fetchUsers } from "../../../services/adminApi.js";
import { Empty, Panel, TextInput } from "../AdminUI.jsx";

/**
 * PËRDORUESIT E REGJISTRUAR.
 *
 * Deri tani kjo listë shihej vetëm te phpMyAdmin. Këtu vjen brenda panelit,
 * me kërkim dhe me aktivitetin e secilit.
 *
 * ⚠️  Vetëm lexim, me qëllim. Nuk ka buton fshirjeje dhe as ndryshimi.
 *     Fshirja e një llogarie tërheq pas vetes seancat, medaljet dhe krijimet
 *     (`ON DELETE CASCADE`) — një prekje e gabuar në telefon do t'i zhbënte pa
 *     kthim. Kur duhet vërtet, bëhet me vetëdije te databaza.
 */
export function UsersTab() {
  const [term, setTerm] = useState("");
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (q) => {
    setBusy(true);
    setError(null);
    const [list, counts] = await Promise.all([fetchUsers({ q }), fetchUserStats()]);
    if (list.ok) {
      setRows(list.items);
      setTotal(list.total);
    } else {
      setError(list.error);
    }
    if (counts.ok) setStats(counts.stats);
    setBusy(false);
  }, []);

  /*
   * Kërkimi pret 350ms pas shkronjës së fundit.
   *
   * ⚠️  Pa këtë, çdo shkronjë do të niste një kërkesë: "emanuela" do të
   *     bëhej tetë kërkesa, dhe përgjigjet mund të mbërrinin pa radhë — lista
   *     do të përfundonte me rezultatet e "eman" mbi ato të "emanuela".
   *     Pastrimi i `useEffect`-it anulon atë të mëparshmen.
   */
  useEffect(() => {
    const timer = setTimeout(() => load(term), term ? 350 : 0);
    return () => clearTimeout(timer);
  }, [term, load]);

  return (
    <>
      <Panel
        title="Përdoruesit"
        note={stats ? `${stats.total} llogari gjithsej` : "Po lexohet nga databaza…"}
        action={
          <button
            onClick={() => load(term)}
            aria-label="Rifresko listën"
            className="ag-press"
            style={{ ...sx.bareButton, color: T.sub, padding: 6, cursor: "pointer" }}
          >
            <RefreshCw size={15} />
          </button>
        }
      >
        {stats && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Stat icon={Users} label="Gjithsej" value={stats.total} />
            <Stat icon={Crown} label="Me abonim" value={stats.subscribed} tone={T.gold} />
            <Stat icon={Sparkles} label="Në provë" value={stats.trial} tone={T.accent} />
            <Stat icon={ShieldCheck} label="Sot" value={stats.today} tone={T.success} />
          </div>
        )}
      </Panel>

      <Panel
        title="Lista"
        note={
          term
            ? `${total} rezultate për "${term}"`
            : "Nga më i riu te më i vjetri · vetëm lexim"
        }
      >
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search
            size={15}
            color={T.faint}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <TextInput
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Kërko me email ose emër"
            aria-label="Kërko përdorues"
            autoCapitalize="none"
            spellCheck="false"
            style={{ paddingLeft: 34 }}
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: "rgba(255,90,110,0.1)",
              border: `1px solid ${T.live}`,
              borderRadius: radii.md,
              padding: "10px 12px",
              color: T.live,
              fontSize: 12.5,
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}

        {busy && rows.length === 0 && <Empty>Po lexohet…</Empty>}

        {!busy && rows.length === 0 && !error && (
          <Empty>{term ? "Asnjë përdorues nuk përputhet." : "Ende asnjë regjistrim."}</Empty>
        )}

        {rows.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </Panel>
    </>
  );
}

/** Një numër i vetëm me ikonë — kutitë e kokës. */
function Stat({ icon: Icon, label, value, tone = T.ink }) {
  return (
    <div
      style={{
        flex: "1 1 96px",
        background: T.bg2,
        borderRadius: radii.md,
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
        <Icon size={12} color={tone} />
        <span style={{ color: T.faint, fontSize: 11, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ color: tone, fontSize: 19, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function UserRow({ user }) {
  const active = user.subscription_end_at && new Date(user.subscription_end_at) > new Date();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "11px 0",
        borderTop: `1px solid ${T.line}`,
      }}
    >
      <div style={sx.flexText}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ color: T.ink, fontSize: 13.5, fontWeight: 700 }}>{user.name}</span>
          {Boolean(user.is_admin) && <Tag tone={T.accent}>admin</Tag>}
          {active && user.subscription_status === "trial" && <Tag tone={T.accent}>provë</Tag>}
          {active && user.subscription_status !== "trial" && <Tag tone={T.gold}>abonim</Tag>}
          {!user.onboarding_completed && <Tag tone={T.faint}>pa onboarding</Tag>}
        </div>

        {/* `break-all`: një email i gjatë pa këtë e zgjeron rreshtin dhe nxjerr
            shiritin horizontal te i gjithë paneli. */}
        <div style={{ color: T.sub, fontSize: 12, marginTop: 2, wordBreak: "break-all" }}>
          {user.email}
        </div>

        <div style={{ color: T.faint, fontSize: 11, marginTop: 4 }}>
          {shortDate(user.created_at)}
          {user.sessions > 0
            ? ` · ${user.sessions} seanca · ${user.minutes} min${
                user.streak > 0 ? ` · varg ${user.streak}` : ""
              }`
            : " · ende pa medituar"}
        </div>
      </div>
    </div>
  );
}

function Tag({ children, tone }) {
  return (
    <span
      style={{
        background: `${tone}1A`,
        color: tone,
        borderRadius: radii.pill,
        padding: "2px 7px",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 0.2,
        textTransform: "uppercase",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

/**
 * "14 gsh 2026" — data e regjistrimit.
 *
 * MySQL-ja e kthen si "2026-09-04T08:26:50.000Z". `new Date()` mbi atë varg
 * është e sigurt; mbi formatin "2026-09-04 08:26:50" (pa `T`) Safari kthen
 * `Invalid Date`, ndaj përgjigja e serverit nuk normalizohet këtu por lexohet
 * ashtu siç vjen — si ISO.
 */
function shortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}
