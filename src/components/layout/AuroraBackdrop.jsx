import { aurora } from "../../theme/tokens.js";

/**
 * AURORA — shiriti i zbehtë turkez/lejla/blu në krye të çdo ekrani, që
 * shkrihet në të bardhë brenda ~420px.
 *
 * Tri elipsa të mbivendosura japin lëvizjen e ngjyrës; maska vertikale bën
 * shkrirjen. Maska preferohet ndaj një gradienti të bardhë sipër, sepse
 * funksionon njësoj kur ekrani poshtë saj nuk është i bardhë (p.sh. fletët).
 *
 * Dekorative: `pointer-events: none` dhe `aria-hidden` — nuk kap prekje dhe
 * nuk lexohet nga screen reader-at.
 */
export function AuroraBackdrop() {
  /* Maska bën shkrirjen përfundimtare: e plotë deri në 40%, e zhdukur në 100%
     (= `aurora.height`). Elipsat më poshtë duhet të mbajnë ngjyrë deri thellë
     në këtë interval, përndryshe zbardhja ndodh shumë më herët se 420px. */
  const fade = "linear-gradient(to bottom, #000 0%, #000 40%, transparent 100%)";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: aurora.height,
        pointerEvents: "none",
        zIndex: 0,
        /* Rrezet vertikale janë > 100% me qëllim: `transparent` te 75–78% e
           rrezes do të thotë se ngjyra shuhet shumë para skajit, ndaj elipsat
           duhen zgjeruar që tinti të mbërrijë deri afër 420px. */
        background: [
          `radial-gradient(ellipse 84% 132% at 12% -10%, ${aurora.turquoise}, transparent 76%)`,
          `radial-gradient(ellipse 78% 124% at 88% -6%, ${aurora.lilac}, transparent 76%)`,
          `radial-gradient(ellipse 112% 118% at 50% -14%, ${aurora.blue}, transparent 78%)`,
        ].join(", "),
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
    />
  );
}
