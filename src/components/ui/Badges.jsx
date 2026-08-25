import { Crown, Lock, Star } from "lucide-react";
import { T } from "../../theme/tokens.js";
import { ratingFor } from "../../lib/placeholders.js";

/**
 * Distinktivi lart-djathtas mbi një kapak: kurorë për premium të hapur,
 * dryn për premium të kyçur. Nuk shfaqet fare për përmbajtje të lirë.
 */
export function PremiumBadge({ premium, locked, size = 13 }) {
  if (!premium) return null;
  return (
    <span
      style={{
        position: "absolute",
        top: size > 12 ? 10 : 8,
        right: size > 12 ? 10 : 8,
        background: "rgba(0,0,0,0.5)",
        borderRadius: 20,
        padding: size > 12 ? 5 : 4,
        zIndex: 2,
      }}
    >
      {locked ? <Lock size={size} color="#fff" /> : <Crown size={size} color={T.gold} />}
    </span>
  );
}

/** Vlerësim me yll. `index` përdoret vetëm nga vlerat vend-mbajtëse. */
export function Rating({ index = 0, size = 12, color = T.sub }) {
  return (
    <>
      {ratingFor(index)} <Star size={size} fill={T.gold} color={T.gold} style={{ color }} />
    </>
  );
}

/** Etiketë "LIVE" pulsuese. */
export function LiveDot({ size = 7 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: T.live,
        animation: "livePulse 1.6s ease-in-out infinite",
      }}
    />
  );
}
