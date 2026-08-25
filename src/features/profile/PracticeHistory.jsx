import { T } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { intentMeta } from "../../domain/intent.js";

const VISIBLE_ENTRIES = 6;
const BAR_AREA = 110;

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

      <div style={{ display: "flex", gap: 12 }}>
        {recent.map((entry, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {/* Pistë me lartësi të caktuar — përqindja e shtyllës matet ndaj saj. */}
            <div style={{ height: BAR_AREA, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: 34,
                  borderRadius: "8px 8px 0 0",
                  height: `${Math.max(3, (entry.min / max) * 100)}%`,
                  background: tile(intentMeta(entry.intent).g),
                }}
              />
            </div>
            <div style={{ color: T.faint, fontSize: 10 }}>{entry.date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
