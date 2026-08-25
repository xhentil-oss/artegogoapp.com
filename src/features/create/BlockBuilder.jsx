import { useMemo, useRef, useState } from "react";
import { Clock, GripVertical, Layers, Lock, Music, Plus, Search, X } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx, iconBox } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { autoGrid } from "../../theme/responsive.js";
import { intentMeta } from "../../domain/intent.js";
import { reorder, totalMinutes, withUid } from "../../domain/sequence.js";
import { listBlocks, listIntentions } from "../../services/contentRepository.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { PillGroup } from "../../components/ui/Controls.jsx";
import { BuilderRow } from "../../components/cards/MeditationRow.jsx";

const ALL = "all";

/**
 * Ndërtuesi manual: seanca në ndërtim lart, biblioteka poshtë.
 *
 * Kërkimi vepron mbi TË GJITHË katalogun, jo mbi kategorinë e zgjedhur —
 * përndryshe përdoruesi do të duhej të gjente vetë kategorinë e duhur para se
 * të kërkonte. Sapo shtohet një meditim nga kërkimi, fusha pastrohet dhe
 * kthehet pamja normale me filtra.
 */
export function BlockBuilder({ sequence, setSequence }) {
  const [filter, setFilter] = useState(ALL);
  const [query, setQuery] = useState("");
  const dragIndex = useRef(null);
  const { isLocked, openUpsell } = usePlayback();

  const all = listBlocks();
  const term = query.trim().toLowerCase();
  const searching = term.length > 0;

  const library = useMemo(() => {
    if (searching) {
      return all.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.desc.toLowerCase().includes(term) ||
          intentMeta(b.intent).label.toLowerCase().includes(term)
      );
    }
    return filter === ALL ? all : all.filter((b) => b.intent === filter);
  }, [all, searching, term, filter]);

  const add = (block) => {
    if (isLocked(block)) return openUpsell();
    setSequence([...sequence, withUid(block)]);
    /* pas shtimit nga kërkimi, kthehu te pamja normale */
    if (searching) setQuery("");
  };

  const remove = (uid) => setSequence(sequence.filter((item) => item.uid !== uid));

  const drop = (index) => {
    setSequence(reorder(sequence, dragIndex.current, index));
    dragIndex.current = null;
  };

  const filterOptions = [
    { id: ALL, label: "Të gjitha" },
    ...listIntentions().map((i) => ({ id: i.id, label: i.label })),
  ];

  const activeLabel = filter === ALL ? "Të gjitha" : intentMeta(filter).label;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: `0 ${layout.gutter}px` }}>
      {/* ---------- seanca në ndërtim ---------- */}
      <section style={{ ...sx.panel, borderRadius: radii.xxl }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Music size={16} color={T.accent} />
            <span style={{ color: T.ink, fontSize: 15, fontWeight: 700 }}>Seanca jote</span>
          </div>
          {sequence.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: T.sub,
                fontSize: 12,
                background: T.bg,
                padding: "5px 11px",
                borderRadius: 20,
              }}
            >
              <Clock size={12} /> {totalMinutes(sequence)}m · {sequence.length}
            </div>
          )}
        </div>

        {sequence.length === 0 ? (
          <div
            style={{
              color: T.sub,
              fontSize: 13.5,
              textAlign: "center",
              padding: "28px 12px",
              lineHeight: 1.7,
              border: `1px dashed ${T.line}`,
              borderRadius: 14,
            }}
          >
            Zgjidh mini-meditime më poshtë.
            <br />
            Tërhiqi për t&apos;i risistemuar.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sequence.map((block, index) => (
              <div
                key={block.uid}
                draggable
                onDragStart={() => (dragIndex.current = index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(index)}
              >
                <BuilderRow
                  block={block}
                  borderAccent
                  right={
                    <>
                      <GripVertical size={16} color={T.faint} style={{ cursor: "grab" }} />
                      <button
                        onClick={() => remove(block.uid)}
                        aria-label={`Hiq ${block.title}`}
                        style={{ ...sx.bareButton, ...sx.center, width: 32, height: 32 }}
                      >
                        <X size={16} color={T.faint} />
                      </button>
                    </>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- biblioteka ---------- */}
      <section style={{ ...sx.panel, borderRadius: radii.xxl }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Layers size={16} color={T.eve1} />
          <span style={{ color: T.ink, fontSize: 15, fontWeight: 700 }}>Biblioteka</span>
          {/* numri i saktë i asaj që po shihet tani */}
          <span style={{ color: T.faint, fontSize: 12.5, marginLeft: "auto" }}>
            {searching ? `${library.length} rezultate` : `${library.length} · ${activeLabel}`}
          </span>
        </div>

        <SearchField value={query} onChange={setQuery} />

        {/* filtrat fshihen gjatë kërkimit — kërkimi shkon në tërë katalogun */}
        {!searching && (
          <PillGroup options={filterOptions} value={filter} onChange={setFilter} style={{ marginBottom: 16 }} />
        )}

        {library.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: T.sub, fontSize: 13.5 }}>
            Asnjë meditim për “{query}”.
          </div>
        ) : (
          /* pa lartësi fikse: lista rrjedh me faqen dhe ka hapësirë të plotë scroll-i */
          <div style={autoGrid(190, 10)}>
            {library.map((block) => (
              <LibraryEntry key={block.id} block={block} locked={isLocked(block)} onAdd={() => add(block)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Kërkim mbi të gjithë katalogun. */
function SearchField({ value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: T.bg,
        border: `1px solid ${T.line}`,
        borderRadius: radii.pill,
        padding: "10px 14px",
        marginBottom: 14,
      }}
    >
      <Search size={17} color={T.faint} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Kërko në të gjithë katalogun…"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        style={{ ...sx.flexText, background: "transparent", border: "none", outline: "none", color: T.ink }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Pastro kërkimin"
          style={{ ...sx.bareButton, ...sx.center, width: 30, height: 30, flexShrink: 0 }}
        >
          <X size={16} color={T.faint} />
        </button>
      )}
    </div>
  );
}

function LibraryEntry({ block, locked, onAdd }) {
  const meta = intentMeta(block.intent);
  const Icon = meta.icon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        background: T.bg,
        borderRadius: radii.md,
        padding: "11px 12px",
        border: `1px solid ${T.line}`,
      }}
    >
      <div style={iconBox(32, tile(meta.g), 9)}>
        <Icon size={15} color="#fff" />
      </div>

      <div style={sx.flexText}>
        <div style={{ color: T.ink, fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
          {block.title}
        </div>
        <div style={{ color: T.sub, fontSize: 11.5 }}>
          {meta.label} · {block.dur}m
        </div>
      </div>

      <button
        onClick={onAdd}
        aria-label={`Shto ${block.title}`}
        style={{
          background: locked ? "rgba(224,169,60,0.15)" : tile(meta.g),
          border: "none",
          borderRadius: 9,
          padding: 7,
          cursor: "pointer",
          display: "flex",
          flexShrink: 0,
        }}
      >
        {locked ? <Lock size={15} color={T.gold} /> : <Plus size={15} color="#fff" />}
      </button>
    </div>
  );
}
