import { T, nav } from "../../theme/tokens.js";

/**
 * IKONAT E NAVIGIMIT
 *
 * Specifikimi: kur tab-i është aktiv, tri ngjyrat e brand-it — rozë, e verdhë,
 * blu — shpërndahen nëpër elementet e ikonës. Kur nuk është aktiv, e gjithë
 * ikona bie në një gri të vetme.
 *
 * Çdo ikonë ndjek përshkrimin e tabelës:
 *   Komunitet · trekëndësh rozë, zemër verdhë, rreth blu, katror rozë
 *   Meditime  · lotus (petal verdhë + rozë + blu)
 *   Programe  · dy shirita + diagonal
 *   Profili   · kokë verdhë + trup rozë
 *   Krijo     · figurë meditative mbi gradient violet — vizatohet te `BottomNav`
 */
export function NavIcon({ icon, active }) {
  /** Ngjyra e elementit: e brand-it kur aktiv, gri kur jo. */
  const c = (brandColor) => (active ? brandColor : T.faint);

  switch (icon) {
    case "community":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M6.2 3.4 L9.6 9.2 H2.8 Z" fill={c(nav.pink)} />
          <path
            d="M17.8 9.4c-1.1-1-2.6-.6-3.1.5-.5-1.1-2-1.5-3.1-.5-1.2 1.1-.7 2.8 3.1 5.1 3.8-2.3 4.3-4 3.1-5.1z"
            fill={c(nav.yellow)}
          />
          <circle cx="6.2" cy="17.6" r="3.5" fill={c(nav.blue)} />
          <rect x="13.8" y="14.1" width="7" height="7" rx="1.4" fill={c(nav.pink)} />
        </svg>
      );

    case "library":
      /* lotus: petal qendror + dy anësorë + baza */
      return (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <path d="M12 3.2c2.4 2.6 2.4 6.6 0 9.4-2.4-2.8-2.4-6.8 0-9.4z" fill={c(nav.yellow)} />
          <path d="M4.1 8.6c3.4.6 6 3.6 6.4 7.4-3.6-.7-6.1-3.7-6.4-7.4z" fill={c(nav.pink)} />
          <path d="M19.9 8.6c-.3 3.7-2.8 6.7-6.4 7.4.4-3.8 3-6.8 6.4-7.4z" fill={c(nav.blue)} />
          <path
            d="M3.4 14.6c2.4 3.9 5.2 5.8 8.6 5.8s6.2-1.9 8.6-5.8"
            stroke={c(nav.pink)}
            strokeWidth="1.9"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    case "programs":
      /* dy shirita + diagonal */
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3.4" y="8.5" width="3.4" height="12" rx="1.7" fill={c(nav.yellow)} />
          <rect x="9.6" y="4" width="3.4" height="16.5" rx="1.7" fill={c(nav.pink)} />
          <path d="M16.4 19.6 L21.2 6.2" stroke={c(nav.blue)} strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      );

    case "profile":
      /* kokë e verdhë + trup rozë */
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="7.4" r="4.1" fill={c(nav.yellow)} />
          <path d="M3.9 21c0-4.3 3.6-7.2 8.1-7.2s8.1 2.9 8.1 7.2z" fill={c(nav.pink)} />
        </svg>
      );

    default:
      return <div style={{ width: 24, height: 24 }} />;
  }
}
