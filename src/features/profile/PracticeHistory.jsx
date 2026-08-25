import { T } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { intentMeta } from "../../domain/intent.js";

const VISIBLE_ENTRIES = 6;

/** Grafik i minutave të praktikës, i ngjyrosur sipas qëllimit të seancës. */
export function PracticeHistory({ history }) {
  const recent = history.slice(-VISIBLE_ENTRIES);
  /* mbroje nga pjesëtimi me zero kur historiku është bosh */
  const max = Math.max(1, ...recent.map((entry) => entry.min));

  return (
    <section style={{ ...sx.panel, marginBottom: 16 }}>
      <div style={{ color: T.ink, fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
        Historiku i praktikës
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 110 }}>
        {recent.map((entry, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: "100%",
                maxWidth: 34,
                borderRadius: "8px 8px 0 0",
                height: `${(entry.min / max) * 100}%`,
                background: tile(intentMeta(entry.intent).g),
              }}
            />
            <div style={{ color: T.faint, fontSize: 10 }}>{entry.date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
