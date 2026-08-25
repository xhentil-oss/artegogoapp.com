import { Clock, Play, Trash2 } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { intentMeta } from "../../domain/intent.js";
import { totalMinutes } from "../../domain/sequence.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { SectionHead } from "../../components/ui/SectionHead.jsx";

/** Lista e seancave të ruajtura. Nuk shfaqet fare kur nuk ka asnjë. */
export function SavedSessions({ sessions, onRemove }) {
  const { playItems } = usePlayback();
  if (sessions.length === 0) return null;

  return (
    <>
      <SectionHead title="Seancat e" accent="tua" hint={`${sessions.length}`} />
      <div
        style={{
          padding: `0 ${layout.gutter}px`,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 22,
        }}
      >
        {sessions.map((session) => (
          <SavedSessionRow
            key={session.id}
            session={session}
            onPlay={() => playItems(session.blocks)}
            onRemove={() => onRemove(session.id)}
          />
        ))}
      </div>
    </>
  );
}

function SavedSessionRow({ session, onPlay, onRemove }) {
  const meta = intentMeta(session.blocks[0]?.intent);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={onPlay}
        className="ag-card"
        style={{
          ...sx.cardButton,
          ...sx.card,
          display: "flex",
          alignItems: "center",
          gap: 13,
          padding: 12,
          textAlign: "left",
        }}
      >
        <div style={circle(44, tile(meta.g))}>
          <Play size={17} color="#fff" style={{ marginLeft: 2 }} />
        </div>

        <div style={sx.flexText}>
          <div style={{ color: T.ink, fontSize: 15.5, fontWeight: 700, ...sx.truncate }}>
            {session.name}
          </div>
          <div
            style={{
              color: T.sub,
              fontSize: 12.5,
              marginTop: 3,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Clock size={12} /> {totalMinutes(session.blocks)}m · {session.blocks.length} hapa
          </div>
        </div>
      </button>

      <button
        onClick={onRemove}
        aria-label={`Fshi seancën ${session.name}`}
        className="ag-press"
        style={{
          ...sx.bareButton,
          ...sx.center,
          width: 44,
          height: 44,
          borderRadius: radii.md,
          flexShrink: 0,
        }}
      >
        <Trash2 size={18} color={T.faint} />
      </button>
    </div>
  );
}
