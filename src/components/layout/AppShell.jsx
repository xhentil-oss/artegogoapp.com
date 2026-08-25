import { T, fonts } from "../../theme/tokens.js";
import { AuroraBackdrop } from "./AuroraBackdrop.jsx";

/**
 * Kanavaca e aplikacionit. `light` = sfond i bardhë (ekranet e brendshme);
 * pa të, sfondi lihet transparent që gradienti i login-it të shihet.
 *
 * Lartësia vjen nga `.ag-viewport` (100dvh me fallback 100vh) — në telefon
 * `100vh` përfshin shiritin e URL-së dhe faqja kërcen kur ai fshihet.
 *
 * `.ag-frame` e mban aplikacionin kolonë sa një telefon në ekrane të gjera.
 *
 * Aurora vendoset një herë këtu, jo në çdo ekran: të pesë skedat ndajnë të
 * njëjtën kanavacë, ndaj shfaqet automatikisht kudo dhe nuk mund të harrohet
 * kur shtohet një ekran i ri.
 */
export function AppShell({ children, light = false }) {
  return (
    <div
      className="ag-viewport ag-frame"
      style={{
        background: light ? T.bg : "transparent",
        fontFamily: fonts.body,
        color: T.ink,
      }}
    >
      {light && <AuroraBackdrop />}
      {children}
    </div>
  );
}
