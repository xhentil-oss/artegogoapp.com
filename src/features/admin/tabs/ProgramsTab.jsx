import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { T, radii } from "../../../theme/tokens.js";
import { listIntentions, listMeditations, listPrograms } from "../../../services/contentRepository.js";
import { addTo, removeFrom, replaceIn } from "../../../services/adminStore.js";
import { useAdminState } from "../../../hooks/useAdmin.js";
import { nextId } from "../../../lib/id.js";
import { Empty, Field, Panel, PrimaryButton, Select, TextInput } from "../AdminUI.jsx";

const MAX_DAYS = 40;

/**
 * KRIJIM/REDAKTIM I PROGRAMEVE (seksioni 11) — "ditët dhe meditimet për secilën".
 *
 * Një program është një listë ditësh, dhe secila ditë mban meditimet e veta.
 * Ruhen vetëm ID-të e meditimeve, jo kopje: nëse një meditim riemërtohet,
 * programi tregon emrin e ri pa asnjë hap tjetër.
 */
export function ProgramsTab() {
  const admin = useAdminState();
  const [editing, setEditing] = useState(null);

  const mine = admin.programs;
  const baseCount = listPrograms().length - mine.length;

  const create = (program) => {
    addTo("programs", program);
    setEditing(program.id);
  };

  return (
    <>
      <Panel
        title="Programet"
        note={`${mine.length} të krijuara nga ti · ${baseCount} bazë. Programet e tua shfaqen të parat te skeda "Programe".`}
      >
        <NewProgramForm onCreate={create} />
      </Panel>

      {mine.length === 0 && <Empty>Ende asnjë program i krijuar.</Empty>}

      {mine.map((program) => (
        <ProgramEditor
          key={program.id}
          program={program}
          open={editing === program.id}
          onToggle={() => setEditing(editing === program.id ? null : program.id)}
          onRemove={() => removeFrom("programs", program.id)}
        />
      ))}
    </>
  );
}

function NewProgramForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [days, setDays] = useState("7");
  const [intent, setIntent] = useState(listIntentions()[0].id);

  const count = Math.min(MAX_DAYS, Math.max(1, Number(days) || 1));
  const ready = title.trim().length > 0;

  const submit = () => {
    if (!ready) return;
    onCreate({
      id: nextId("prog"),
      title: title.trim().toUpperCase(),
      /* e njëjta formë si te `data/catalog.js`, që kartelat ekzistuese ta
         shfaqin pa asnjë degëzim */
      sub: `${count} ditë · ${listIntentions().find((i) => i.id === intent)?.label ?? ""}`.trim(),
      lessons: count,
      intent,
      days: Array.from({ length: count }, () => []),
    });
    setTitle("");
  };

  return (
    <>
      <Field label="Titulli">
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="p.sh. MISTIK ZEMËR"
          aria-label="Titulli i programit"
        />
      </Field>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Field label="Ditë" hint={`max ${MAX_DAYS}`}>
            <TextInput
              type="number"
              min="1"
              max={MAX_DAYS}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              aria-label="Numri i ditëve"
            />
          </Field>
        </div>
        <div style={{ flex: 2 }}>
          <Field label="Qëllimi">
            <Select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              options={listIntentions()}
              aria-label="Qëllimi i programit"
            />
          </Field>
        </div>
      </div>

      <PrimaryButton onClick={submit} disabled={!ready} style={{ width: "100%" }}>
        <Plus size={15} /> Krijo programin
      </PrimaryButton>
    </>
  );
}

/** Redaktori i ditëve — meditimet shtohen ditë për ditë. */
function ProgramEditor({ program, open, onToggle, onRemove }) {
  const meditations = listMeditations();
  const filled = (program.days ?? []).filter((d) => d.length > 0).length;

  const setDay = (index, ids) =>
    replaceIn("programs", program.id, {
      days: program.days.map((day, i) => (i === index ? ids : day)),
    });

  return (
    <section
      style={{
        background: T.bg,
        border: `1px solid ${T.line}`,
        borderRadius: radii.lg,
        padding: 13,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onToggle}
          aria-expanded={open}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            padding: 0,
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div style={{ color: T.ink, fontSize: 14, fontWeight: 800 }}>{program.title}</div>
          <div style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>
            {program.sub} · {filled}/{program.lessons} ditë të mbushura
          </div>
        </button>

        <button
          onClick={onRemove}
          aria-label={`Fshi ${program.title}`}
          className="ag-press"
          style={{ background: "none", border: "none", padding: 6, cursor: "pointer" }}
        >
          <Trash2 size={16} color={T.faint} />
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {program.days.map((ids, i) => (
            <DayRow
              key={i}
              index={i}
              ids={ids}
              meditations={meditations}
              onChange={(next) => setDay(i, next)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DayRow({ index, ids, meditations, onChange }) {
  const chosen = ids.map((id) => meditations.find((m) => m.id === id)).filter(Boolean);

  return (
    <div style={{ background: T.bg2, borderRadius: radii.md, padding: 10 }}>
      <div style={{ color: T.ink, fontSize: 12.5, fontWeight: 700, marginBottom: 7 }}>
        Dita {index + 1}
      </div>

      {chosen.map((m) => (
        <div
          key={m.id}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}
        >
          <span style={{ flex: 1, color: T.sub, fontSize: 12.5 }}>
            {m.title} · {m.dur}m
          </span>
          <button
            onClick={() => onChange(ids.filter((id) => id !== m.id))}
            aria-label={`Hiq ${m.title} nga dita ${index + 1}`}
            style={{ background: "none", border: "none", color: T.faint, fontSize: 11, cursor: "pointer" }}
          >
            Hiq
          </button>
        </div>
      ))}

      <select
        value=""
        onChange={(e) => e.target.value && onChange([...ids, e.target.value])}
        aria-label={`Shto meditim te dita ${index + 1}`}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: T.bg,
          border: `1px dashed ${T.line}`,
          borderRadius: radii.sm,
          padding: "8px 10px",
          color: T.sub,
          fontSize: 16,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        <option value="">+ Shto meditim…</option>
        {meditations.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title} ({m.subTheme})
          </option>
        ))}
      </select>
    </div>
  );
}
