import { Bookmark, Play, Sparkles, Trash2 } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { intentMeta } from "../../domain/intent.js";
import { totalMinutes } from "../../domain/sequence.js";
import { usePlayback } from "../../hooks/usePlayback.js";
import { useCollections } from "../../store/CollectionsContext.jsx";
import { SectionHead } from "../../components/ui/SectionHead.jsx";
import { CoverArt } from "../../components/art/CoverArt.jsx";

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
    /*
     * Dy karta bosh, jo një shënim i vetëm.
     *
     * ⚠️  Më parë këtu ishte një kuti e vetme që përmendte tri listat bashkë —
     *     e preferuara, e shkarkuar, e krijuar. Askush nuk mësonte prej saj SI
     *     mbushet secila. Tani secila e ka kartën e vet dhe shpjegon hapin.
     *     "Të shkarkuarat" nuk shfaqet bosh me qëllim: shkarkimi kërkon
     *     Premium, ndaj një kartë e tretë do të ishte reklamë, jo udhëzim.
     */
    return (
      <>
        <EmptyList
          icon={Bookmark}
          color={T.gold}
          title="Të preferuarat"
          text="Shto meditime me shenjën e bookmark-ut te faqja e meditimit — do të shfaqen këtu."
        />
        <EmptyList
          icon={Sparkles}
          color={T.accent}
          title="Të krijuara"
          text={'Krijo një meditim te "Krijo", dëgjoje deri në fund dhe ruaje me emër — do të shfaqet këtu.'}
        />
      </>
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
                label="Seanca jote"
                title={session.name}
                meta={`${totalMinutes(session.blocks)} min · ${session.blocks.length} hapa`}
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
                label="Meditim në Arte Gogo"
                title={item.title}
                meta={`${intentMeta(item.intent).label} · ${item.dur} min`}
                cover={item.cover}
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
                label="Meditim në Arte Gogo"
                title={item.title}
                meta={`${intentMeta(item.intent).label} · ${item.dur} min`}
                cover={item.cover}
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

/** Kartë e zbrazët: kreu me ikonë dhe numër, poshtë hapi që e mbush. */
function EmptyList({ icon: Icon, color, title, text }) {
  return (
    <section style={{ ...sx.panel, borderRadius: radii.lg, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={17} color={color} />
        <span style={{ color: T.ink, fontSize: 16, fontWeight: 800 }}>{title}</span>
        <span style={{ color: T.faint, fontSize: 13.5 }}>· 0</span>
      </div>
      <p
        style={{
          color: T.faint,
          fontSize: 13.5,
          lineHeight: 1.6,
          textAlign: "center",
          margin: "16px 6px 4px",
        }}
      >
        {text}
      </p>
    </section>
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

/**
 * Rreshti i listës — e njëjta formë si meditimi i bashkangjitur te postimet:
 * kapak katror, mbishkrim i vogël, titull, dhe poshtë çasti me kohëzgjatjen.
 */
function Item({ label, title, meta, cover, intent, onPlay, onRemove }) {
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
          gap: 12,
          padding: 10,
          textAlign: "left",
        }}
      >
        {/* `CoverArt` bie vetë te peizazhi procedural kur fotoja mungon. */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <CoverArt intent={intent} image={cover} />
        </div>

        <div style={sx.flexText}>
          <div
            style={{
              color: T.faint,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.1,
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          <div style={{ color: T.ink, fontSize: 14.5, fontWeight: 700, marginTop: 2, ...sx.truncate }}>
            {title}
          </div>
          <div style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>{meta}</div>
        </div>

        <div style={{ ...circle(40, tile(colors.g)), ...sx.center, flexShrink: 0 }}>
          <Play size={17} color="#fff" style={{ marginLeft: 2 }} />
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
