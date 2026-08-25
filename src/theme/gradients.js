/**
 * Gradientët e kapakëve. Çdo qëllim (intent) mban një çift ngjyrash `g`,
 * dhe `tile()` e kthen në një CSS gradient të njëtrajtshëm.
 */

/** `tile(["#A8C0FF", "#5478C9"])` → linear-gradient e standardizuar. */
export const tile = ([from, to]) => `linear-gradient(150deg, ${from}, ${to})`;

/** Gradient vertikal për hero-t dhe overlay-t. */
export const veil = (from, to) => `linear-gradient(180deg, ${from}, ${to})`;

/** Overlay i zakonshëm që e bën tekstin të lexueshëm mbi imazh. */
export const readabilityVeil = veil("transparent 20%", "rgba(0,0,0,0.55)");
export const heroVeil = veil("rgba(0,0,0,0.25)", "rgba(0,0,0,0.55)");

/** Sfondi imersiv i player-it / completion-it, sipas qëllimit. */
export const immersiveBackdrop = ([from, to], focusY = "28%") =>
  `radial-gradient(ellipse at 50% ${focusY}, ${from} 0%, ${to} 42%, #1A0E2E 78%, #0A0614 100%)`;

/**
 * Gradienti i brand-it — vetëm ngjyrat e paletës: Violet (fillim → fund)
 * dhe Teksti kryesor si fund i errët. Përdoret te splash-i i login-it dhe
 * kudo ku duhet një sipërfaqe e madhe e markës.
 */
export const brandSplash = `linear-gradient(160deg, ${"#5A8CE0"}, ${"#7C5CE0"} 45%, ${"#0E0E12"})`;

/** Çifti Violet, për sipërfaqe më të vogla (avatar, distinktivë). */
export const brandPair = ["#7C5CE0", "#5A8CE0"];

/** Teksturë e lehtë me rreze, e përdorur mbi kartelat e programeve. */
export const rayTexture =
  "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.05) 0deg 5deg, transparent 5deg 10deg)";
