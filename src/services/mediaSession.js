/**
 * ═══════════════════════════════════════════════════════════════
 *  EKRANI I KYÇUR — ÇFARË SHEH NJERIU KUR TELEFONI ËSHTË NË XHEP
 * ═══════════════════════════════════════════════════════════════
 *
 * Gjatë një meditimi, ekrani i kyçur tregon një luajtës me titull, emër dhe
 * figurë. Ato të dhëna i merr nga `navigator.mediaSession`.
 *
 * ⚠️  PA KËTO, SHFLETUESI I ZGJEDH VETË — DHE I ZGJEDH KEQ.
 *
 *     Deri më 24 nëntor 2026 asgjë nuk i vendosej, ndaj Chrome-i binte te
 *     ikonat e manifestit dhe merrte atë 192 pikselëshe, të cilën e zmadhonte
 *     sa gjysma e ekranit. Dilte e turbullt — jo gabim, thjesht figurë e vogël
 *     e shtrirë.
 *
 *     Tani i jepet kopertina e vetë meditimit, që është e madhe dhe e lidhur
 *     me atë që dëgjohet. Ikonat mbeten si rrjetë e dytë, për meditimet pa
 *     kopertinë.
 *
 * ⚠️  `sizes` NUK MATET, DEKLAROHET. Shfletuesi zgjedh figurën më të madhe që
 *     i deklarohet dhe nuk e kontrollon; prandaj kopertina shënohet 512 — jo
 *     për të gënjyer, por që të zgjidhet para ikonës 192.
 */

/** Rrjeta e dytë: ikonat e aplikacionit, kur meditimi s'ka kopertinë. */
const IKONAT = [
  { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
  { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
];

const mbeshtetet = () =>
  typeof navigator !== "undefined" &&
  "mediaSession" in navigator &&
  typeof window !== "undefined" &&
  typeof window.MediaMetadata === "function";

/**
 * Shkruan çfarë po luhet.
 *
 * I sigurt të thirret sa herë: thirrja me të njëjtat vlera thjesht rishkruan
 * të njëjtën gjë, dhe një dështim nuk e prek luajtjen.
 *
 * @param {{title?: string, artist?: string, album?: string, cover?: string|null}} track
 */
export function setNowPlaying({ title, artist = "Arte Gogo", album, cover } = {}) {
  if (!mbeshtetet() || !title) return;

  const artwork = cover
    ? [{ src: cover, sizes: "512x512", type: "image/jpeg" }, ...IKONAT]
    : IKONAT;

  try {
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title,
      artist,
      ...(album ? { album } : {}),
      artwork,
    });
  } catch {
    /* Një ekran i kyçur pa titull nuk është arsye për ta ndalur meditimin. */
  }
}

/** Heq të dhënat — kur luajtja mbaron dhe asgjë nuk po dëgjohet më. */
export function clearNowPlaying() {
  if (!mbeshtetet()) return;
  try {
    navigator.mediaSession.metadata = null;
  } catch {
    /* pa rëndësi */
  }
}
