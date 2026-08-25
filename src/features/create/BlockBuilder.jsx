import { useRef, useState } from "react";
import { Clock, Crown, GripVertical, Layers, Lock, Music, Plus, X } from "lucide-react";
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
 * Ndërtuesi manual: bibliotekë e filtrueshme majtas, seanca në ndërtim lart.
 * Rirenditja bëhet me drag & drop; `domain/sequence.reorder` mban logjikën.
 */
export function BlockBuilder({ sequence, setSequence }) {
  const [filter, setFilter] = useState(ALL);
  const dragIndex = useRef(null);
  const { isLocked, openUpsell } = usePlayback();

  const library = filter === ALL ? listBlocks() : listBlocks().filter((b) => b.intent === filter);

  const add = (block) => {
    if (isLocked(block)) return openUpsell();
    setSequence([...sequence, withUid(block)]);
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
                      <button onClick={() => remove(block.uid)} style={sx.bareButton}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Layers size={16} color={T.eve1} />
          <span style={{ color: T.ink, fontSize: 15, fontWeight: 700 }}>Biblioteka</span>
        </div>

        <PillGroup options={filterOptions} value={filter} onChange={setFilter} style={{ marginBottom: 16 }} />

        <div style={autoGrid(190, 10)}>
          {library.map((block) => (
            <LibraryEntry key={block.id} block={block} locked={isLocked(block)} onAdd={() => add(block)} />
          ))}
        </div>
      </section>
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
          {block.title} {block.premium && <Crown size={12} color={T.gold} />}
        </div>
        <div style={{ color: T.sub, fontSize: 11.5 }}>
          {block.phase} · {block.dur}m
        </div>
      </div>

      <button
        onClick={onAdd}
        style={{
          background: locked ? "rgba(224,169,60,0.15)" : tile(meta.g),
          border: "none",
          borderRadius: 9,
          padding: 7,
          cursor: "pointer",
          display: "flex",
        }}
      >
        {locked ? <Lock size={15} color={T.gold} /> : <Plus size={15} color="#fff" />}
      </button>
    </div>
  );
}
