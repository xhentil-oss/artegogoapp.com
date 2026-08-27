import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Clock, Search, X } from "lucide-react";
import { T, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { searchContent } from "../../domain/search.js";
import { listIntentions } from "../../services/contentRepository.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useRecentSearches } from "../../hooks/useRecentSearches.js";
import { SearchResultRow } from "../../components/cards/MeditationRow.jsx";

const FOCUS_DELAY_MS = 120;

/** Fletë kërkimi mbi të gjithë ekranin. */
export function SearchSheet() {
  const { closeSearch, openCategory } = useNavigation();
  const [query, setQuery] = useState("");
  const { recent, remember, clear } = useRecentSearches();
  const inputRef = useRef(null);
  useBodyScrollLock();

  /* fokusi pas animacionit të hyrjes, që tastiera të mos e ndërpresë */
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const results = searchContent(query);
  const isEmpty = query.trim().length === 0;

  const goToCategory = (intent) => {
    closeSearch();
    openCategory(intent);
  };

  return (
    <div
      className="ag-fullscreen"
      style={{ ...sx.fullSheet, zIndex: 60, overflowY: "hidden", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: `${padTop(16)} 16px 12px`,
          borderBottom: `1px solid ${T.line}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={closeSearch}
          aria-label="Mbyll kërkimin"
          className="ag-press"
          style={{ ...sx.bareButton, ...sx.center, width: 44, height: 44 }}
        >
          <ArrowLeft size={24} color={T.ink} />
        </button>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: T.bg2,
            borderRadius: 24,
            padding: "11px 16px",
          }}
        >
          <Search size={19} color={T.faint} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kërko meditime…"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            /* Ruhet kur përdoruesi shtyp "Kërko" te tastiera, ose kur largohet
               nga fusha — jo në çdo shkronjë, që historiku të mos mbushet me
               fragmente si "g", "gj", "gju". */
            onKeyDown={(e) => e.key === "Enter" && remember(query)}
            onBlur={() => remember(query)}
            /* fontSize 16px vjen nga global.css — nën 16 iOS zoom-on faqen */
            style={{
              ...sx.flexText,
              background: "transparent",
              border: "none",
              outline: "none",
              color: T.ink,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Pastro"
              style={{ ...sx.bareButton, ...sx.center, width: 32, height: 32, flexShrink: 0 }}
            >
              <X size={18} color={T.faint} />
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: `16px ${layout.gutter}px ${padBottom(40)}`,
        }}
      >
        {isEmpty ? (
          <EmptyState
            recent={recent}
            onClearRecent={clear}
            onPickRecent={setQuery}
            onPickIntent={goToCategory}
          />
        ) : (
          <Results query={query} results={results} onPickIntent={goToCategory} onPlayed={closeSearch} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ recent, onClearRecent, onPickRecent, onPickIntent }) {
  return (
    <div className="ag-page">
      {recent.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Kërkimet e fundit</span>
            <button onClick={onClearRecent} style={{ ...sx.bareButton, color: T.sub, fontSize: 13 }}>
              Pastro
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 26 }}>
            {recent.map((term) => (
              <button
                key={term}
                onClick={() => onPickRecent(term)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  ...sx.bareButton,
                  padding: "11px 4px",
                  textAlign: "left",
                }}
              >
                <Clock size={18} color={T.faint} />
                <span style={{ flex: 1, color: T.ink, fontSize: 14.5 }}>{term}</span>
                <ArrowLeft size={16} color={T.faint} style={{ transform: "rotate(135deg)" }} />
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Eksploro sipas qëllimit</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
        {listIntentions().map((intention) => (
          <button
            key={intention.id}
            onClick={() => onPickIntent(intention.id)}
            className="ag-press"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              /* `14` / `33` = alfa hex, tint i lehtë i ngjyrës së qëllimit */
              background: `${intention.g[1]}14`,
              border: `1px solid ${intention.g[1]}33`,
              borderRadius: 22,
              padding: "9px 14px",
              cursor: "pointer",
            }}
          >
            <intention.icon size={15} color={intention.g[1]} />
            <span style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{intention.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Results({ query, results, onPickIntent, onPlayed }) {
  return (
    <div className="ag-page">
      {results.intents.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <Label>KATEGORI</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {results.intents.map((intention) => (
              <button
                key={intention.id}
                onClick={() => onPickIntent(intention.id)}
                className="ag-press"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: tile(intention.g),
                  border: "none",
                  borderRadius: 22,
                  padding: "9px 15px",
                  cursor: "pointer",
                }}
              >
                <intention.icon size={15} color="#fff" />
                <span style={{ fontSize: 13.5, color: "#fff", fontWeight: 700 }}>{intention.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Numri i vërtetë i përputhjeve, jo sa u vizatuan: kur rezultatet
          kalojnë kufirin, përdoruesi duhet ta dijë se ka edhe të tjera. */}
      <Label>
        {results.total > 0
          ? results.total > results.blocks.length
            ? `${results.blocks.length} NGA ${results.total} MEDITIME`
            : `${results.total} MEDITIME`
          : "MEDITIME"}
      </Label>

      {results.blocks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: T.sub }}>
          <Search size={34} color={T.line} style={{ marginBottom: 14 }} />
          <div style={{ fontSize: 15, color: T.ink, fontWeight: 600, marginBottom: 6 }}>
            Asnjë rezultat për “{query}”
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
            Provo një fjalë tjetër, ose eksploro sipas qëllimit.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {results.blocks.map(({ block, index }) => (
            <SearchResultRow key={block.id} block={block} index={index} onBeforePlay={onPlayed} />
          ))}
        </div>
      )}
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 13, color: T.sub, fontWeight: 600, marginBottom: 10, letterSpacing: 0.3 }}>
      {children}
    </div>
  );
}
