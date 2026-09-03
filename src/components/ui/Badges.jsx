import { Lock, Star } from "lucide-react";
import { T } from "../../theme/tokens.js";
import { ratingFor } from "../../lib/placeholders.js";

/**
 * Distinktivi lart-djathtas mbi një kapak.
 *
 * ⚠️  Distinktivi «FALAS» U HOQ (3 shtator 2026, vendim i klientes).
 *
 *     Modeli i mëparshëm lejonte tre meditime falas; tani i gjithë katalogu
 *     është i kyçur dhe e vetmja rrugë është prova 3-ditore. Një etiketë
 *     "FALAS" mbi ndonjë kartelë do të premtonte akses që nuk ekziston.
 *
 * Për një abonent nuk shfaqet asnjë distinktiv: gjithçka është e hapur.
 */
export function AccessBadge({ locked, size = 13 }) {
  if (!locked) return null;

  const inset = size > 12 ? 10 : 8;

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
