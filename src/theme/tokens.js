/**
 * DESIGN TOKENS — burimi i vetëm i së vërtetës për pamjen e aplikacionit.
 *
 * Ndrysho një vlerë këtu dhe ndryshon çdo ekran. Të njëjtat token-e
 * injektohen edhe si CSS variables (shih `cssVariables.js`), kështu që
 * fletët CSS dhe stilet inline nuk devijojnë nga njëra-tjetra.
 */

/**
 * Paleta bazë. `T` = Theme — përdoret gjerësisht në stile inline.
 *
 * Kolona e dytë e komenteve është roli sipas specifikimit të brand-it
 * ("Identiteti vizual dhe dizajni"). Mos i ndrysho këto hex pa specifikimin.
 */
export const T = {
  /* sfonde */
  bg: "#FFFFFF",        // Sfondi — sfondi kryesor i të gjitha ekraneve
  bg2: "#F7F7F9",       // Sfond dytësor — kartat, kutitë, fushat
  /** Toni i mesit i shkëlqimit gjatë ngarkimit — Vija/kufij. */
  bgSkeleton: "#ECECF0",
  /** Sfondi jashtë kornizës në ekrane më të gjera se telefoni. */
  canvas: "#F7F7F9",    // Sfond dytësor

  /* tekst */
  ink: "#0E0E12",       // Teksti kryesor — tituj dhe teksti kryesor
  sub: "#6B6B76",       // Teksti dytësor — përshkrimet
  faint: "#9A9AA4",     // Teksti i zbehtë — etiketat, meta

  /* strukturë */
  line: "#ECECF0",      // Vija/kufij — ndarëset, kufijtë e kartave

  /* aksente */
  /** Theksi i titujve. Violet sipas paletës — më parë ishte teal jashtë saj. */
  accent: "#7C5CE0",    // Violet (fillim)
  gold: "#E0A93C",      // Ari (Premium) — kurora, medaljet e arta, theksime
  eve1: "#7C5CE0",      // Violet (Eve/aksent, fillim) — butoni qendror, gradiente
  eve2: "#5A8CE0",      // Violet (Eve/aksent, fund)

  /* semantike */
  success: "#2BB673",
  successSoft: "#7BC97B",
  live: "#FF5A6E",
  /** Verifikimi dhe pëlqimi — Violet (fund), në vend të një blu jashtë palete. */
  info: "#5A8CE0",
  like: "#E0457E",
};

/** Rrumbullakimet — përdor emrat, jo numrat, nëpër komponentë. */
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 22,
  sheet: 28,
  pill: 30,
  round: "50%",
};

export const shadows = {
  soft: "0 1px 4px rgba(0,0,0,0.07)",
  raised: "0 2px 10px rgba(0,0,0,0.06)",
  card: "0 4px 16px rgba(0,0,0,0.12)",
  cardSmall: "0 4px 14px rgba(0,0,0,0.12)",
  lifted: "0 8px 28px rgba(0,0,0,0.25)",
  immersive: "0 18px 60px rgba(0,0,0,0.5)",
};

/**
 * TIPOGRAFIA sipas specifikimit:
 *   · `body`    — sans geometrik (Poppins) për ndërfaqen e përgjithshme
 *   · `display` — serif (Playfair/Georgia) për tituj hero dhe momente të
 *                 veçanta: emri i programit, ekrani i përmbylljes
 *
 * Fontet ngarkohen te `index.html`. Fallback-et e sistemit vijnë menjëherë
 * pas tyre, ndaj teksti lexohet edhe nëse Google Fonts nuk arrihet.
 */
export const fonts = {
  body: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif",
  display: "'Playfair Display', Georgia, 'Times New Roman', serif",
};

/**
 * NGJYRAT E NAVIGIMIT — shpërndahen nëpër elementet e secilës ikonë kur
 * tab-i është aktiv. Kur nuk është aktiv, e gjithë ikona bie në `T.faint`,
 * ndaj ngjyra shënon vetëm gjendjen aktive.
 */
export const nav = {
  pink: "#FF1F9B",
  yellow: "#F5C400",
  blue: "#00B0EA",
};

/**
 * NGJYRAT E MEDALJEVE — materiale, jo role.
 *
 * Bronzi dhe argjendi nuk gjenden te paleta e brand-it sepse aty ka role
 * (tekst, sfond, sukses), jo metale; ashtu si `nav`, ky grup qëndron veçmas
 * dhe nuk përzihet me `T`. Ari është pikërisht `T.gold` i paletës, që medalja
 * më e lartë të flasë të njëjtën gjuhë me Premium-in.
 */
export const medal = {
  bronze: "#C87A3C",
  bronzeSoft: "#F4E2D2",
  silver: "#93A0AE",
  silverSoft: "#E6EAEF",
  gold: "#E0A93C",
  goldSoft: "#FAEBCC",
};

/** Përmasat e strukturës së faqes. */
export const layout = {
  /**
   * Gjerësia e kornizës së aplikacionit.
   *
   * Arte Gogo është aplikacion mobil: në ekrane më të gjera se kjo, e gjithë
   * korniza — përfshi nav-in dhe fletët `position: fixed` — centrohet dhe
   * jashtë saj shfaqet sfond neutral. Ndrysho VETËM këtë numër për të
   * ngushtuar/zgjeruar aplikacionin në desktop.
   */
  frameWidth: 480,
  /** Gjerësia maksimale e përmbajtjes brenda player-it/fletëve. */
  sheetMaxWidth: 460,
  gutter: 18,
  /* lartësia e nav-it poshtë — përdorur për padding-un e fundit të faqes */
  navHeight: 78,
  pageBottomPad: 100,
};

/**
 * AURORA — shenja vizuale e brand-it.
 *
 * Specifikimi: "Në krye të çdo ekrani ka një aurorë shumë të zbehtë
 * (turkez/lejla/blu) që shkrihet në të bardhë brenda ~420px."
 *
 * Opaciteti mbahet i ulët me qëllim: aurora duhet të ndihet, jo të shihet —
 * sfondi mbetet i bardhë dhe teksti i errët ruan kontrastin.
 */
export const aurora = {
  height: 420,
  turquoise: "rgba(26, 140, 140, 0.13)",
  lilac: "rgba(124, 92, 224, 0.14)",
  blue: "rgba(90, 140, 224, 0.12)",
};

/** Ngjyra mbi sfonde të errët (player, completion). */
export const onDark = {
  strong: "#FFFFFF",
  primary: "rgba(255,255,255,0.85)",
  secondary: "rgba(255,255,255,0.7)",
  muted: "rgba(255,255,255,0.55)",
  hairline: "rgba(255,255,255,0.4)",
  fill: "rgba(255,255,255,0.12)",
  fillStrong: "rgba(255,255,255,0.22)",
};
