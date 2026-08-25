import { useState } from "react";
import { Radio, Trash2 } from "lucide-react";
import { T, radii } from "../../../theme/tokens.js";
import { sx } from "../../../theme/styles.js";
import { listLiveSessions } from "../../../services/contentRepository.js";
import { addTo, removeFrom, replaceIn } from "../../../services/adminStore.js";
import { useAdminState } from "../../../hooks/useAdmin.js";
import { nextId } from "../../../lib/id.js";
import { Empty, Field, Panel, PrimaryButton, TextArea, TextInput } from "../AdminUI.jsx";

/**
 * TRANSMETIMET LIVE (seksioni 11).
 *
 * Vetëm një transmetim mund të jetë "në ajër" njëherësh — ndaj ndezja e njërit
 * i fik të tjerët. Pa këtë, feed-i do të tregonte dy pika të kuqe njëherësh
 * dhe përdoruesi nuk do ta dinte cilën të ndiqte.
 */
export function LiveTab() {
  const admin = useAdminState();
  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [when, setWhen] = useState("");
  const [emoji, setEmoji] = useState("🧘");

  const ready = title.trim().length > 0;
  const baseCount = listLiveSessions().length - admin.live.length;

  const create = () => {
    if (!ready) return;
    addTo("live", {
      /* e njëjta formë si te `data/catalog.js` */
      id: nextId("live"),
      emoji: emoji.trim() || "🧘",
      title: title.trim(),
      sub: sub.trim(),
      when: when.trim() || "Së shpejti",
      live: false,
    });
    setTitle("");
    setSub("");
    setWhen("");
  };

  /** Ndez një transmetim dhe fik të gjitha të tjerat. */
  const goLive = (id, on) => {
    admin.live.forEach((session) => {
      const next = on && session.id === id;
      if (session.live !== next) replaceIn("live", session.id, { live: next });
    });
  };

  return (
    <>
      <Panel
        title="Transmetim i ri"
        note={`${admin.live.length} të tuat · ${baseCount} bazë. Shfaqen te skeda "Komunitet" → Live.`}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 78 }}>
            <Field label="Emoji">
              <TextInput
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
                aria-label="Emoji i transmetimit"
                style={{ textAlign: "center" }}
              />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Titulli">
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="p.sh. Meditim Live"
                aria-label="Titulli i transmetimit"
              />
            </Field>
          </div>
        </div>

        <Field label="Përshkrimi">
          <TextArea
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            placeholder="Për çfarë do të jetë ky sesion…"
            aria-label="Përshkrimi i transmetimit"
            style={{ minHeight: 62 }}
          />
        </Field>

        <Field label="Kur" hint="tekst i lirë">
          <TextInput
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            placeholder="p.sh. E mërkurë · 19:00"
            aria-label="Kur zhvillohet"
          />
        </Field>

        <PrimaryButton onClick={create} disabled={!ready} style={{ width: "100%" }}>
          <Radio size={15} /> Planifiko
        </PrimaryButton>
      </Panel>

      <Panel title="Transmetimet e tua">
        {admin.live.length === 0 && <Empty>Ende asnjë transmetim i planifikuar.</Empty>}

        {admin.live.map((session) => (
          <div
            key={session.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "11px 0",
              borderTop: `1px solid ${T.line}`,
            }}
          >
            <span style={{ fontSize: 22 }}>{session.emoji}</span>

            <div style={sx.flexText}>
              <div style={{ color: T.ink, fontSize: 13.5, fontWeight: 700, ...sx.truncate }}>
                {session.title}
              </div>
              <div style={{ color: T.faint, fontSize: 11.5, marginTop: 2 }}>{session.when}</div>
            </div>

            <button
              onClick={() => goLive(session.id, !session.live)}
              role="switch"
              aria-checked={session.live}
              aria-label={`Në ajër — ${session.title}`}
              className="ag-press"
              style={{
                background: session.live ? T.live : T.bg,
                color: session.live ? "#fff" : T.sub,
                border: `1px solid ${session.live ? T.live : T.line}`,
                borderRadius: radii.pill,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 11.5,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {session.live ? "NË AJËR" : "Nis"}
            </button>

            <button
              onClick={() => removeFrom("live", session.id)}
              aria-label={`Fshi ${session.title}`}
              className="ag-press"
              style={{ background: "none", border: "none", padding: 6, cursor: "pointer" }}
            >
              <Trash2 size={15} color={T.faint} />
            </button>
          </div>
        ))}
      </Panel>
    </>
  );
}
