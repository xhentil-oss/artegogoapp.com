import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Crown, Info, Play, X } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { padBottom } from "../../theme/responsive.js";
import { intentMeta } from "../../domain/intent.js";
import { dailyNotifications, trialEndingNotification } from "../../services/notifications.js";
import { formatDate } from "../../domain/subscription.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useSession } from "../../store/SessionContext.jsx";
import { usePlayback } from "../../hooks/usePlayback.js";
import * as push from "../../services/push.js";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";

/**
 * NJOFTIMET DITORE (seksioni 9).
 *
 * Këtu shihen të tre njoftimet e sotme — çasti, ora dhe meditimi rastësor që
 * do të dërgohej. Meditimi zgjidhet nga `domain/dailyPick`, ndaj ky ekran dhe
 * njoftimi i vërtetë tregojnë të njëjtën gjë për të njëjtën ditë.
 *
 * Oraret ndryshohen edhe këtu, jo vetëm gjatë onboarding-ut: pas regjistrimit
 * nuk kishte asnjë rrugë për t'i prekur, dhe një orar i gabuar do të mbetej
 * i gabuar përgjithmonë.
 */
export function NotificationsSheet() {
  const { closeNotifications } = useNavigation();
  const { reminders, updateReminders, subscription } = useSession();
  const { playItems } = usePlayback();
  useBodyScrollLock();

  const items = dailyNotifications(reminders);
  const trial = trialEndingNotification(subscription);

  const toggle = (slotId) =>
    updateReminders({
      ...reminders,
      [slotId]: { ...reminders[slotId], enabled: !reminders[slotId]?.enabled },
    });

  const setTime = (slotId, time) =>
    updateReminders({ ...reminders, [slotId]: { ...reminders[slotId], time } });

  return (
    <div
      onClick={closeNotifications}
      className="ag-fullscreen"
      style={{
        zIndex: 70,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: "fadeIn .25s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ag-sheet"
        style={{
          width: "100%",
          maxWidth: layout.sheetMaxWidth,
          background: "#fff",
          borderRadius: `${radii.sheet}px ${radii.sheet}px 0 0`,
          padding: `22px 22px ${padBottom(22)}`,
          maxHeight: "90%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={sx.flexText}>
            <h2 style={{ color: T.ink, fontSize: 21, fontWeight: 800, margin: 0 }}>
              Njoftimet e ditës
            </h2>
            <p style={{ color: T.sub, fontSize: 13, margin: "3px 0 0" }}>
              Një meditim i ri për çdo çast
            </p>
          </div>
          <button
            onClick={closeNotifications}
            aria-label="Mbyll"
            className="ag-press"
            style={{ ...sx.bareButton, ...sx.center, width: 40, height: 40, flexShrink: 0 }}
          >
            <X size={20} color={T.sub} />
          </button>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "20px 0" }}>
          {items.map((item) => (
            <SlotCard
              key={item.slotId}
              item={item}
              onToggle={() => toggle(item.slotId)}
              onTime={(time) => setTime(item.slotId, time)}
              onPlay={() => {
                playItems(item.meditation);
                closeNotifications();
              }}
            />
          ))}
        </div>

        {trial && <TrialCard trial={trial} />}

        <PushControl />
      </div>
    </div>
  );
}

/** Një çast i ditës: ora, ndërprerësi dhe meditimi i sotëm. */
function SlotCard({ item, onToggle, onTime, onPlay }) {
  const colors = intentMeta(item.meditation.intent);

  return (
    <section
      style={{
        border: `1px solid ${item.enabled ? T.line : T.bgSkeleton}`,
        borderRadius: radii.xl,
        padding: 14,
        background: item.enabled ? T.bg : T.bg2,
        opacity: item.enabled ? 1 : 0.72,
        transition: "opacity .2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ color: T.ink, fontSize: 15, fontWeight: 800 }}>{item.label}</span>

        {/* Fusha native, pa ikonë të shtuar: shfletuesi vizaton vetë treguesin
            e orës, dhe në telefon hap zgjedhësin e sistemit. Gjerësia lihet
            automatike sepse formati ndryshon me gjuhën e pajisjes —
            "13:00" diku, "01:00 PM" diku tjetër. */}
        <input
          type="time"
          value={item.time}
          onChange={(e) => onTime(e.target.value)}
          aria-label={`Ora e njoftimit — ${item.label}`}
          style={{
            background: T.bg2,
            border: `1px solid ${T.line}`,
            borderRadius: radii.pill,
            padding: "5px 10px",
            color: T.ink,
            /* 16px me qëllim: nën këtë prag iOS e zmadhon faqen sapo preket
               fusha, dhe pamja mbetet e zhvendosur pas mbylljes së tastierës */
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        />

        <div style={{ flex: 1 }} />

        <button
          onClick={onToggle}
          role="switch"
          aria-checked={item.enabled}
          aria-label={`Njoftimet për ${item.label}`}
          className="ag-press"
          style={{
            ...sx.bareButton,
            ...sx.center,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: item.enabled ? "rgba(43,182,115,0.14)" : T.bgSkeleton,
            cursor: "pointer",
          }}
        >
          {item.enabled ? <Bell size={16} color={T.success} /> : <BellOff size={16} color={T.faint} />}
        </button>
      </div>

      {/* Pamja e njoftimit ashtu si do të duket në ekranin e kyçur. */}
      <button
        onClick={onPlay}
        className="ag-card"
        style={{
          ...sx.cardButton,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: T.bg2,
          borderRadius: radii.lg,
          padding: 11,
          textAlign: "left",
          width: "100%",
        }}
      >
        <div style={circle(42, tile(colors.g))}>
          <Play size={16} color="#fff" style={{ marginLeft: 2 }} />
        </div>
        <div style={sx.flexText}>
          <div style={{ color: T.ink, fontSize: 13.5, fontWeight: 700, ...sx.truncate }}>
            {item.title}
          </div>
          <div style={{ color: T.sub, fontSize: 12.5, marginTop: 2, ...sx.truncate }}>
            {item.body}
          </div>
        </div>
      </button>
    </section>
  );
}

/** Njoftimi "prova po mbaron" — kërkesë e veçantë e seksionit 8. */
function TrialCard({ trial }) {
  return (
    <section
      style={{
        border: `1px solid rgba(224,169,60,0.45)`,
        background: "rgba(224,169,60,0.09)",
        borderRadius: radii.xl,
        padding: 14,
        display: "flex",
        gap: 11,
        alignItems: "flex-start",
      }}
    >
      <Crown size={17} color={T.gold} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={sx.flexText}>
        <div style={{ color: T.ink, fontSize: 13.5, fontWeight: 700 }}>{trial.title}</div>
        <div style={{ color: T.sub, fontSize: 12.5, marginTop: 2, lineHeight: 1.5 }}>
          {trial.body}
        </div>
        <div style={{ color: T.faint, fontSize: 11.5, marginTop: 6 }}>
          Dërgohet më {formatDate(trial.dueOn)}
        </div>
      </div>
    </section>
  );
}

/**
 * KONTROLLI I NJOFTIMEVE NË PAJISJE
 *
 * ⚠️  Tregon gjendjen HAP PAS HAPI, jo një "ndezur/fikur".
 *
 *     Rruga ka katër hallka — Service Worker, leje, abonim, server — dhe
 *     mungesa e njërës e ndal gjithçka pa asnjë gabim të dukshëm. Një ndërprerës
 *     i thjeshtë do ta linte përdoruesin të mendonte se njoftimet punojnë,
 *     ndërsa asgjë nuk mbërrin.
 *
 *     Rasti i iPhone-it trajtohet veç: aty problemi nuk zgjidhet me leje, por
 *     me shtimin e aplikacionit te Home Screen — dhe kjo duhet thënë, sepse
 *     përndryshe përdoruesi provon pa fund të njëjtin buton.
 */
function PushControl() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const refresh = useCallback(() => {
    push.status().then(setState);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const say = (text) => {
    setFlash(text);
    setTimeout(() => setFlash(null), 3200);
  };

  const REASON = {
    auth: "Hyr në llogari për të ndezur njoftimet.",
    "needs-install": "Te iPhone duhet shtuar aplikacioni te Home Screen.",
    unsupported: "Ky shfletues nuk i mbështet njoftimet.",
    "not-configured": "Njoftimet nuk janë konfiguruar ende te serveri.",
    denied: "Leja u refuzua. Ndryshoje te cilësimet e shfletuesit.",
    default: "Leja nuk u dha.",
    "no-worker": "Service Worker-i nuk u regjistrua.",
    "subscribe-failed": "Abonimi te shfletuesi dështoi.",
  };

  const turnOn = async () => {
    setBusy(true);
    const result = await push.enable();
    setBusy(false);
    refresh();
    say(result.ok ? "Njoftimet u ndezën për këtë pajisje." : (REASON[result.reason] ?? result.reason));
  };

  const turnOff = async () => {
    setBusy(true);
    await push.disable();
    setBusy(false);
    refresh();
    say("Njoftimet u fikën për këtë pajisje.");
  };

  const test = async () => {
    setBusy(true);
    const result = await push.sendTest();
    setBusy(false);
    say(result.sent > 0 ? `U dërgua te ${result.sent} pajisje.` : (result.reason ?? "Nuk u dërgua."));
  };

  if (!state) return null;

  const on = state.subscribed && state.permission === "granted";

  return (
    <div
      style={{
        background: T.bg2,
        border: `1px solid ${T.line}`,
        borderRadius: radii.lg,
        padding: "14px 14px 12px",
        marginTop: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        {on ? <Bell size={16} color={T.gold} /> : <BellOff size={16} color={T.faint} />}
        <div style={{ flex: 1 }}>
          <div style={{ color: T.ink, fontSize: 14, fontWeight: 700 }}>
            Njoftime në pajisje
          </div>
          <div style={{ color: T.sub, fontSize: 11.5, marginTop: 1 }}>
            {on
              ? `Aktive te ${state.devices} ${state.devices === 1 ? "pajisje" : "pajisje"}`
              : "Të fikura për këtë pajisje"}
          </div>
        </div>
      </div>

      {/* Rasti i iPhone-it: udhëzim, jo gabim. */}
      {state.needsInstall && !on && (
        <p style={{ color: T.sub, fontSize: 11.5, lineHeight: 1.6, margin: "0 0 10px" }}>
          Te iPhone, njoftimet punojnë vetëm kur aplikacioni shtohet te Home Screen:
          shtyp <strong>Share</strong> → <strong>Add to Home Screen</strong>, pastaj hape
          nga ikona dhe kthehu këtu.
        </p>
      )}

      {!state.configured && (
        <p style={{ color: T.sub, fontSize: 11.5, lineHeight: 1.6, margin: "0 0 10px" }}>
          Serveri nuk ka ende çelësat e njoftimeve (VAPID).
        </p>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={on ? turnOff : turnOn}
          disabled={busy || (!on && (state.needsInstall || !state.supported))}
          className="ag-press"
          style={{
            flex: 1,
            borderRadius: radii.pill,
            padding: "9px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: busy ? "default" : "pointer",
            background: on ? T.bg : T.ink,
            color: on ? T.ink : "#fff",
            border: on ? `1px solid ${T.line}` : "none",
            opacity: busy || (!on && (state.needsInstall || !state.supported)) ? 0.55 : 1,
          }}
        >
          {busy ? "Një moment…" : on ? "Fiki" : "Ndizi njoftimet"}
        </button>

        {on && (
          <button
            onClick={test}
            disabled={busy}
            className="ag-press"
            style={{
              border: `1px solid ${T.line}`,
              background: T.bg,
              color: T.ink,
              borderRadius: radii.pill,
              padding: "9px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Provo
          </button>
        )}
      </div>

      {flash && (
        <div style={{ color: T.sub, fontSize: 11.5, marginTop: 9, lineHeight: 1.5 }}>{flash}</div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 11 }}>
        <Info size={13} color={T.faint} style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ color: T.faint, fontSize: 11, lineHeight: 1.55 }}>
          Kujtesat dërgohen nga serveri në orarin e caktuar, edhe me aplikacionin të
          mbyllur. Meditimi i secilës ditë është përcaktuar tashmë: njoftimi tregon
          pikërisht atë që sheh këtu.
        </span>
      </div>
    </div>
  );
}
