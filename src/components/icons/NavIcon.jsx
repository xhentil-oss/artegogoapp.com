import { T, nav } from "../../theme/tokens.js";

/**
 * IKONAT E NAVIGIMIT
 *
 * Specifikimi: kur tab-i është aktiv, tri ngjyrat e brand-it — rozë, e verdhë,
 * blu — shpërndahen nëpër elementet e ikonës. Kur nuk është aktiv, e gjithë
 * ikona bie në një gri të vetme.
 *
 * Përmasa: 28px (lotusi 29, që petalet e holla të peshojnë njësoj me format e
 * mbushura). U rrit nga 24 me kërkesë — te telefoni ikonat dukeshin të vogla
 * krahas etiketave.
 *
 * Çdo ikonë ndjek përshkrimin e tabelës:
 *   Komunitet · trekëndësh rozë, zemër verdhë, rreth blu, katror rozë (të mbushura)
 *   Meditime  · lotus me vija — petal qendror + dy anësorë, pa kërcell
 *   Krijo     · logoja e hyrjes mbi gradient violet — vizatohet te `BottomNav`
 *   Programe  · tre libra të mbushur e të hollë, i fundit i pjerrët
 *   Profili   · kokë + supe, vetëm vijë
 *   Sot       · diell mbi horizont — jashtë shiritit që nga 16 shtatori
 *
 * ⚠️  Forma e secilës u fiksua nga pamja e klientes (16 shtator 2026): vetëm
 *     "Komunitet" është me forma të mbushura, tri të tjerat janë vija të holla.
 *     Mos e "njëso" stilin pa e pyetur — dallimi është i qëllimshëm.
 */
export function NavIcon({ icon, active }) {
  /** Ngjyra e elementit: e brand-it kur aktiv, gri kur jo. */
  const c = (brandColor) => (active ? brandColor : T.faint);

  switch (icon) {
    case "today":
      /* diell mbi horizont — dita që sapo nis */
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="11.4" r="4.2" fill={c(nav.yellow)} />
          <path
            d="M12 2.6v2.3M4.8 11.4H2.5M21.5 11.4h-2.3M6.6 6 5 4.4M17.4 6 19 4.4"
            stroke={c(nav.pink)}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M3.2 19.4h17.6"
            stroke={c(nav.blue)}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case "community":
      /*
       * Logoja e brand-it: katër forma në një rrjet 2×2 — trekëndësh rozë dhe
       * zemër e verdhë sipër, rreth cian dhe katror rozë poshtë.
       *
       * ⚠️  RRJETI ËSHTË I RREGULLT, dhe këtu qëndron e gjitha (rivizatuar më
       *     8 tetor 2026, sipas logos origjinale që solli klientja).
       *
       *     Çdo formë zë një kuadrat 8.5×8.5, me 2 njësi hapësirë mes tyre:
       *         kolonat  x 2.5–11  dhe  13–21.5
       *         rreshtat y 2.5–11  dhe  13–21.5
       *
       *     Versioni i mëparshëm i kishte format me përmasa të ndryshme dhe
       *     zemërën pesë njësi më poshtë se trekëndëshi, me majën mbi katrorin.
       *     Në 28px ajo lexohej si një zemër e shtrembër, edhe pse forma në
       *     vetvete ishte e rregullt.
       *
       *     Kurbat e zemrës janë pasqyrë e saktë rreth x = 17.25. Po e preke
       *     njërën anë, preke edhe tjetrën — syri e kap menjëherë.
       */
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M6.75 2.6 L11 11 H2.5 Z" fill={c(nav.pink)} />
          <path
            d="M17.25 10.7C13 7.9 13 5.3 14.45 4.2c1.2-.95 2.4-.45 2.8.5.4-.95 1.6-1.45 2.8-.5 1.45 1.1 1.45 3.7-2.8 6.5z"
            fill={c(nav.yellow)}
          />
          <circle cx="6.75" cy="17.25" r="4.25" fill={c(nav.blue)} />
          <rect x="13" y="13" width="8.5" height="8.5" rx="2.4" fill={c(nav.pink)} />
        </svg>
      );

    case "library":
      /* lotus me vija të holla: petali qendror + dy anësorë, pa kërcell */
      return (
        <svg width="29" height="29" viewBox="0 0 24 24" fill="none">
          {/* Lulja zbret 2.6 njësi: pa kërcellin, pesha e saj rrinte shumë
              lart dhe nuk qëndronte në një vijë me ikonat fqinje. */}
          <g transform="translate(0 2.6)">
          <path
            d="M12 3.4c2.3 2.7 2.3 6.5 0 9.2-2.3-2.7-2.3-6.5 0-9.2z"
            stroke={c(nav.yellow)}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M4.4 8.8c3.2.7 5.6 3.5 6 7.1-3.4-.7-5.8-3.5-6-7.1z"
            stroke={c(nav.pink)}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M19.6 8.8c-.2 3.6-2.6 6.4-6 7.1.4-3.6 2.8-6.4 6-7.1z"
            stroke={c(nav.blue)}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          </g>
        </svg>
      );

    case "programs":
      /* tre libra të mbushur e të hollë, i fundit i mbështetur pjerrtas */
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="4.2" y="4.6" width="3.2" height="14.8" rx="1.6" fill={c(nav.yellow)} />
          <rect x="9.6" y="4.6" width="3.2" height="14.8" rx="1.6" fill={c(nav.pink)} />
          <rect
            x="15"
            y="4.6"
            width="3.2"
            height="14.8"
            rx="1.6"
            fill={c(nav.blue)}
            transform="rotate(14 16.6 12)"
          />
        </svg>
      );

    case "profile":
      /* kokë + supe, vetëm vijë */
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8.1" r="3.9" stroke={c(nav.yellow)} strokeWidth="1.7" />
          <path
            d="M4.9 20.4c0-3.8 3.3-6.1 7.1-6.1s7.1 2.3 7.1 6.1"
            stroke={c(nav.pink)}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return <div style={{ width: 24, height: 24 }} />;
  }
}
