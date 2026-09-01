import { T } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { tile } from "../../theme/gradients.js";
import { intentMeta } from "../../domain/intent.js";

const BAR_AREA = 110;

/**
 * Grafik i minutave të praktikës, një shtyllë PËR DITË.
 *
 * ⚠️  Ditët bosh mbeten në pamje, si shtylla e ulët gri. Fshehja e tyre do të
 *     bënte një javë me një ditë praktike të dukej plot — dhe pikërisht
 *     boshllëku është ai që përdoruesi duhet të shohë.
 */
export function PracticeHistory({ series }) {
  const recent = series ?? [];
  /* mbroje nga pjesëtimi me zero kur historiku është bosh */
  const max = Math.max(1, ...recent.map((entry) => entry.min));

  return (
    <section style={{ ...sx.panel, marginBottom: 16 }}>
      <div style={{ color: T.ink, fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
        Historiku i praktikës
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {recent.map((entry) => (
          <div key={entry.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {/* Pistë me lartësi të caktuar — përqindja e shtyllës matet ndaj saj. */}
            <div style={{ height: BAR_AREA, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: 34,
                  borderRadius: "8px 8px 0 0",
                  height: `${entry.min > 0 ? Math.max(8, (entry.min / max) * 100) : 4}%`,
                  /* Dita bosh mbetet e dukshme, por gri — një ditë pa meditim
                     nuk duhet ngjyrosur si praktikë. */
                  background: entry.min > 0 ? tile(intentMeta(entry.intent).g) : T.line,
                }}
                title={entry.min > 0 ? `${entry.min} min · ${entry.sessions} seanca` : "pa meditim"}
              />
            </div>
            <div
              style={{
                color: entry.label === "Sot" ? T.ink : T.faint,
                fontSize: 10,
                fontWeight: entry.label === "Sot" ? 700 : 500,
                whiteSpace: "nowrap",
              }}
            >
              {entry.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
