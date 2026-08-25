import { useRef, useState } from "react";
import { AlertTriangle, Image as ImageIcon, Music, Trash2, Upload } from "lucide-react";
import { T, radii } from "../../../theme/tokens.js";
import { sx } from "../../../theme/styles.js";
import { listMeditations } from "../../../services/contentRepository.js";
import { addTo, removeFrom, replaceIn } from "../../../services/adminStore.js";
import { useAdminState } from "../../../hooks/useAdmin.js";
import { nextId } from "../../../lib/id.js";
import { Empty, Panel, Select } from "../AdminUI.jsx";

const KINDS = {
  audio: { label: "Audio", accept: "audio/*", icon: Music },
  cover: { label: "Kapak", accept: "image/*", icon: ImageIcon },
};

/**
 * NGARKIM I AUDIOVE DHE KAPAKËVE (seksioni 11).
 *
 * ⚠️  KUFIZIM I DEKLARUAR
 *     Skedari vetë nuk ruhet. `localStorage` mban rreth 5MB gjithsej — një
 *     meditim i vetëm 10-minutësh e kalon disa herë. Ndaj këtu ruhet vetëm
 *     PËRSHKRIMI i skedarit: emri, madhësia, kohëzgjatja dhe meditimi të cilit
 *     i takon. Kjo lidhje është pikërisht puna që mbetet e vlefshme — kur të
 *     vijë backend-i, skedari ngarkohet te ruajtja e objekteve dhe këtu
 *     shtohet vetëm URL-ja e kthyer.
 *
 *     Kohëzgjatja lexohet vërtet nga skedari, jo hamendësohet: ajo është e
 *     dhëna që duhet të përputhet me minutat e shkruara te katalogu.
 */
export function MediaTab() {
  const admin = useAdminState();
  const meditations = listMeditations();
  const [kind, setKind] = useState("audio");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const pick = async (event) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    for (const file of files) {
      addTo("media", {
        id: nextId("media"),
        kind,
        name: file.name,
        sizeKB: Math.round(file.size / 1024),
        seconds: kind === "audio" ? await audioDuration(file) : null,
        meditationId: null,
      });
    }
    setBusy(false);
  };

  return (
    <>
      <Panel
        title="Ngarko"
        note="Zgjidh një ose disa skedarë. Kohëzgjatja lexohet nga vetë audio."
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {Object.entries(KINDS).map(([id, { label }]) => (
            <button
              key={id}
              onClick={() => setKind(id)}
              aria-pressed={kind === id}
              className="ag-press"
              style={{
                flex: 1,
                background: kind === id ? T.ink : T.bg,
                color: kind === id ? "#fff" : T.sub,
                border: `1px solid ${kind === id ? T.ink : T.line}`,
                borderRadius: radii.md,
                padding: "9px 12px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={KINDS[kind].accept}
          onChange={pick}
          aria-label={`Zgjidh skedarë — ${KINDS[kind].label}`}
          style={{ display: "none" }}
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="ag-press"
          style={{
            width: "100%",
            border: `2px dashed ${T.line}`,
            borderRadius: radii.lg,
            padding: 30,
            background: T.bg,
            cursor: busy ? "wait" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Upload size={26} color={T.faint} />
          <span style={{ color: T.ink, fontSize: 14, fontWeight: 700 }}>
            {busy ? "Duke lexuar…" : `Ngarko ${KINDS[kind].label.toLowerCase()}`}
          </span>
          <span style={{ color: T.sub, fontSize: 11.5 }}>{KINDS[kind].accept}</span>
        </button>

        <div
          style={{
            display: "flex",
            gap: 9,
            alignItems: "flex-start",
            background: T.bg2,
            border: `1px solid ${T.line}`,
            borderRadius: radii.md,
            padding: "10px 12px",
            marginTop: 12,
          }}
        >
          <AlertTriangle size={14} color={T.gold} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ color: T.sub, fontSize: 11.5, lineHeight: 1.55 }}>
            Skedari vetë nuk ruhet në prototip — ruhen emri, madhësia, kohëzgjatja dhe lidhja me
            meditimin. Ngarkimi i vërtetë kërkon backend.
          </span>
        </div>
      </Panel>

      <Panel title="Skedarët" note={`${admin.media.length} gjithsej`}>
        {admin.media.length === 0 && <Empty>Ende asnjë skedar.</Empty>}

        {admin.media.map((file) => {
          const FileIcon = KINDS[file.kind]?.icon ?? Music;
          return (
            <div
              key={file.id}
              style={{ padding: "11px 0", borderTop: `1px solid ${T.line}` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <FileIcon size={16} color={T.accent} />
                <div style={sx.flexText}>
                  <div style={{ color: T.ink, fontSize: 13, fontWeight: 600, ...sx.truncate }}>
                    {file.name}
                  </div>
                  <div style={{ color: T.faint, fontSize: 11, marginTop: 2 }}>
                    {formatSize(file.sizeKB)}
                    {file.seconds != null && ` · ${formatDuration(file.seconds)}`}
                  </div>
                </div>
                <button
                  onClick={() => removeFrom("media", file.id)}
                  aria-label={`Fshi ${file.name}`}
                  className="ag-press"
                  style={{ background: "none", border: "none", padding: 6, cursor: "pointer" }}
                >
                  <Trash2 size={15} color={T.faint} />
                </button>
              </div>

              <Select
                value={file.meditationId}
                onChange={(e) => replaceIn("media", file.id, { meditationId: e.target.value || null })}
                options={meditations.map((m) => ({ id: m.id, label: `${m.title} (${m.dur}m)` }))}
                placeholder="Pa meditim të lidhur"
                aria-label={`Meditimi për ${file.name}`}
              />

              {file.seconds != null && file.meditationId && (
                <DurationCheck file={file} meditations={meditations} />
              )}
            </div>
          );
        })}
      </Panel>
    </>
  );
}

/**
 * Krahason kohëzgjatjen e vërtetë me minutat e shkruara te katalogu.
 * Një mospërputhje do të thoshte se lista tregon një kohë dhe player-i një tjetër.
 */
function DurationCheck({ file, meditations }) {
  const meditation = meditations.find((m) => m.id === file.meditationId);
  if (!meditation) return null;

  const realMinutes = file.seconds / 60;
  const off = Math.abs(realMinutes - meditation.dur);
  if (off < 1) return null;

  return (
    <div style={{ color: T.gold, fontSize: 11, marginTop: 7, display: "flex", gap: 6 }}>
      <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
      Katalogu thotë {meditation.dur}m, audio është {formatDuration(file.seconds)}.
    </div>
  );
}

/** Lexon kohëzgjatjen nga vetë skedari, pa e ngarkuar askund. */
function audioDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const done = (value) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    audio.addEventListener("loadedmetadata", () =>
      done(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null)
    );
    /* Formate që shfletuesi nuk i lexon dot nuk duhet ta bllokojnë ngarkimin. */
    audio.addEventListener("error", () => done(null));
    audio.src = url;
  });
}

const formatSize = (kb) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

const formatDuration = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
