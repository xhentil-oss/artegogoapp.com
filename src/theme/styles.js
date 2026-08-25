import { T, radii, shadows, layout } from "./tokens.js";

/**
 * Blloqe stili të riciklueshme.
 *
 * Aplikacioni përdor stile inline (të bashkëvendosura me komponentin).
 * Këtu jetojnë vetëm format që përsëriten në 3+ vende — që të mos
 * kopjohen nëpër skedarë.
 */
export const sx = {
  /* ---------- struktura e faqes ---------- */
  screen: { paddingBottom: 8 },
  /**
   * Kolona kryesore. Padding-u i fundit lë hapësirë për nav-in e fiksuar
   * PLUS shiritin e gjesteve të telefonit.
   */
  page: {
    /* gjerësia vjen nga `.ag-frame` mbi AppShell; këtu vetëm hapësira e fundit */
    paddingBottom: `calc(${layout.pageBottomPad}px + env(safe-area-inset-bottom, 0px))`,
    /* mbi auroren (zIndex 0), që teksti të mos mbulohet prej saj */
    position: "relative",
    zIndex: 1,
  },
  gutter: { padding: `0 ${layout.gutter}px` },

  /**
   * Fletë që mbulon të gjithë ekranin (folder, player, kërkim).
   * Përdore bashkë me `className="ag-fullscreen"` që lartësia të ndjekë
   * viewport-in e vërtetë të mobile-it (100dvh), jo `100vh`.
   */
  fullSheet: { background: T.bg, overflowY: "auto", WebkitOverflowScrolling: "touch" },

  /* ---------- sipërfaqe ---------- */
  /** Kartelë e bardhë me kufi hollak. */
  card: {
    background: T.bg,
    border: `1px solid ${T.line}`,
    borderRadius: radii.lg,
  },
  /** Panel gri i brendshëm (trackerat, ndërtuesi). */
  panel: {
    background: T.bg2,
    border: `1px solid ${T.line}`,
    borderRadius: radii.xl,
    padding: 20,
  },

  /* ---------- pozicionim ---------- */
  center: { display: "flex", alignItems: "center", justifyContent: "center" },
  absoluteFill: { position: "absolute", inset: 0 },
  truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  /** Fleks-fëmijë që lejohet të tkurret pa e shtypur tekstin jashtë. */
  flexText: { flex: 1, minWidth: 0 },

  /* ---------- kontrolle ---------- */
  bareButton: { background: "none", border: "none", cursor: "pointer", padding: 0 },
  /** Kartelë-buton: pa kornizë, gati për `className="ag-card"`. */
  cardButton: {
    width: "100%",
    border: "none",
    padding: 0,
    cursor: "pointer",
    background: "transparent",
  },

  /* ---------- rreshta horizontalë me snap ---------- */
  scrollRow: {
    display: "flex",
    gap: 14,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
  },
  snapItem: { scrollSnapAlign: "start", flexShrink: 0 },
};

/* ---------- ndihmësa të parametrizuar ---------- */

/** Rreth me ikonë në qendër. */
export const circle = (size, background) => ({
  width: size,
  height: size,
  borderRadius: radii.round,
  background,
  ...sx.center,
  flexShrink: 0,
});

/** Kuti me ikonë, rrumbullakim i butë. */
export const iconBox = (size, background, radius = radii.md) => ({
  width: size,
  height: size,
  borderRadius: radius,
  background,
  ...sx.center,
  flexShrink: 0,
});

/** Butoni "pill" — varianti i mbushur ose i zbrazët. */
export const pill = (active, { activeBg = T.ink, bg = T.bg2 } = {}) => ({
  background: active ? activeBg : bg,
  color: active ? "#fff" : T.sub,
  border: `1px solid ${active ? activeBg : T.line}`,
  borderRadius: radii.pill,
  padding: "8px 18px",
  cursor: "pointer",
  fontSize: 13.5,
  fontWeight: 700,
  whiteSpace: "nowrap",
});

/**
 * Kapak me hije kartele.
 *
 * @param size `"square"` → 1:1 · `"22 / 15"` → raport i dhënë · numër → lartësi fikse.
 *   Raportet preferohen: kartelat tani kanë gjerësi fluide, ndaj një lartësi
 *   fikse do t'i deformonte në telefon të ngushtë.
 */
export const cover = (size, radius = radii.xl) => ({
  width: "100%",
  ...aspectOrHeight(size),
  borderRadius: radius,
  position: "relative",
  overflow: "hidden",
  boxShadow: shadows.card,
});

const aspectOrHeight = (size) => {
  if (size === "square") return { aspectRatio: "1 / 1" };
  if (typeof size === "string" && size.includes("/")) return { aspectRatio: size };
  return { height: size };
};
