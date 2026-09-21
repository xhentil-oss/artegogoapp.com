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

/**
 * Numëruesi i kuq mbi një ikonë (zilja e njoftimeve).
 *
 * ⚠️  Zeroja nuk vizatohet fare. Një pullë e kuqe me "0" kërkon vemëndje
 *     për të thënë se nuk ka asgjë — pikërisht e kundërta e asaj që bën një
 *     distinktiv.
 *
 * Mbi 99 shkruhet "99+": tre shifra e zgjerojnë pullën sa të mbulës ikonën
 * që ajo duhet të shënojë.
 *
 * Kufiri i bardhë nuk është zbukurim: shiriti i sipërm është i tejdukshëm mbi
 * aurorë, dhe pa një ndarëse e kuqja ngjitej me ngjyrat nën të.
 */
export function CountBadge({ count, color = T.live }) {
  if (!count || count < 1) return null;

  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: 4,
        right: 2,
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: 10,
        background: color,
        border: "2px solid #fff",
        color: "#fff",
        fontSize: 10.5,
        fontWeight: 800,
        lineHeight: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
