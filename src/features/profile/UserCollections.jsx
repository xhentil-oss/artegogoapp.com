import { Bookmark, Download, Play, Sparkles, Trash2 } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { intentMeta } from "../../domain/intent.js";
import { totalMinutes } from "../../domain/sequence.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { useCollections } from "../../store/CollectionsContext.jsx";
import { SectionHead } from "../../components/ui/SectionHead.jsx";

/**
 * Tri listat e përdoruesit te profili: të krijuara, të preferuara,
 * të shkarkuara. Secila fshihet kur është bosh — një titull mbi zbrazëti
 * nuk ndihmon askënd.
 */
export function UserCollections() {
  const { savedSessions, removeSession, favoriteItems, downloadedItems } = useCollections();
  const { playItems } = usePlayback();

  const nothing =
    savedSessions.length === 0 && favoriteItems.length === 0 && downloadedItems.length === 0;

  if (nothing) {
    return (
      <div
        style={{
          ...sx.panel,
          borderRadius: radii.lg,
          textAlign: "center",
          color: T.sub,
          fontSize: 13.5,
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        Këtu do të mblidhen meditimet që ruan me <Bookmark size={13} style={{ verticalAlign: -2 }} />,
        ato që shkarkon, dhe seancat që krijon vetë.
      </div>
    );
  }

  return (
    <>
      {savedSessions.length > 0 && (
        <>
          <SectionHead flush title="Të" accent="krijuara" hint={`${savedSessions.length}`} />
          <List>
            {savedSessions.map((session) => (
              <Item
                key={session.id}
                title={session.name}
                meta={`${totalMinutes(session.blocks)}m · ${session.blocks.length} hapa`}
                icon={Sparkles}
                intent={session.blocks[0]?.intent}
                onPlay={() => playItems(session.blocks)}
                onRemove={() => removeSession(session.id)}
              />
            ))}
          </List>
        </>
      )}

      {favoriteItems.length > 0 && (
        <>
          <SectionHead flush title="Të" accent="preferuarat" hint={`${favoriteItems.length}`} />
          <List>
            {favoriteItems.map((item) => (
              <Item
                key={item.id}
                title={item.title}
                meta={`${intentMeta(item.intent).label} · ${item.dur}m`}
                icon={Bookmark}
                intent={item.intent}
                onPlay={() => playItems(item)}
              />
            ))}
          </List>
        </>
      )}

      {downloadedItems.length > 0 && (
        <>
          <SectionHead flush title="Të" accent="shkarkuarat" hint={`${downloadedItems.length}`} />
          <List>
            {downloadedItems.map((item) => (
              <Item
                key={item.id}
                title={item.title}
                meta={`${intentMeta(item.intent).label} · ${item.dur}m`}
                icon={Download}
                intent={item.intent}
                onPlay={() => playItems(item)}
              />
            ))}
          </List>
        </>
      )}
    </>
  );
}

function List({ children }) {
  /* Pa gutter të vetin: Profili e ka tashmë, ndaj lista rreshtohet
     drejtpërdrejt me titujt `flush` mbi të. */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function Item({ title, meta, icon: Icon, intent, onPlay, onRemove }) {
  const colors = intentMeta(intent);

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
        <div style={circle(44, tile(colors.g))}>
          <Play size={17} color="#fff" style={{ marginLeft: 2 }} />
        </div>

        <div style={sx.flexText}>
          <div style={{ color: T.ink, fontSize: 15.5, fontWeight: 700, ...sx.truncate }}>{title}</div>
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
            <Icon size={12} /> {meta}
          </div>
        </div>
      </button>

      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Fshi ${title}`}
          className="ag-press"
          style={{ ...sx.bareButton, ...sx.center, width: 44, height: 44, flexShrink: 0 }}
        >
          <Trash2 size={18} color={T.faint} />
        </button>
      )}
    </div>
  );
}
