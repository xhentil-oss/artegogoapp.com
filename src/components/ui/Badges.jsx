import { Lock, Star } from "lucide-react";
import { T } from "../../theme/tokens.js";
import { ratingFor } from "../../lib/placeholders.js";

/**
 * Distinktivi lart-djathtas mbi një kapak.
 *
 * Sipas seksionit 8, falas janë vetëm tre meditime — pra premium është
 * rregulli, jo përjashtimi. Ndaj shënohet e kundërta e së kaluarës: dryn te
 * çfarë është e kyçur, «FALAS» te të treja të hapurat. Një kurorë mbi 241
 * kartela nuk do të thoshte asgjë.
 *
 * Për një abonent nuk shfaqet asnjë distinktiv: gjithçka është e hapur.
 */
export function AccessBadge({ locked, free, size = 13 }) {
  if (!locked && !free) return null;

  const inset = size > 12 ? 10 : 8;

  if (free) {
    return (
      <span
        style={{
          position: "absolute",
          top: inset,
          right: inset,
          background: T.success,
          color: "#fff",
          borderRadius: 20,
          padding: size > 12 ? "4px 9px" : "3px 7px",
          fontSize: size > 12 ? 10 : 9,
          fontWeight: 800,
          letterSpacing: 0.4,
          zIndex: 2,
        }}
      >
        FALAS
      </span>
    );
  }

  return (
    <span
      style={{
        position: "absolute",
        top: inset,
        right: inset,
        background: "rgba(0,0,0,0.5)",
        borderRadius: 20,
        padding: size > 12 ? 5 : 4,
        zIndex: 2,
      }}
    >
      <Lock size={size} color="#fff" />
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
