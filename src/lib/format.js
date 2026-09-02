/** Formatues të pastër — pa React, pa varësi. */

/** Sekonda → `m:ss`. */
export const fmt = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
};

/** 1248 → "1.2K". */
export const compactCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

/** Kufizon një numër brenda intervalit. */
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Përqindje e sigurt (0–100) edhe kur `total` është 0. */
export const percent = (value, total) => (total > 0 ? clamp((value / total) * 100, 0, 100) : 0);

/** Ora 19 → "7 PM", ora 5 → "5 AM". */
/**
 * Ora në formatin 12-orësh.
 *
 * ⚠️  Ora 12 është PM, jo AM — mesditë, jo mesnatë. Versioni i mëparshëm
 *     (`hour > 12 ? PM : AM`) e nxirrte hapin e mesditës si "Nga ora 12 AM",
 *     pra tetë orë para se të hapej vërtet. Ora 0 është 12 AM.
 */
export const hourLabel = (hour) => {
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
};

/**
 * "2 orë më parë", "Dje", "3 ditë më parë".
 *
 * ⚠️  Llogaritet në çdo vizatim, nuk ruhet. Një tekst i ruajtur si "Tani" do të
 *     mbetej "Tani" edhe pas një jave — dhe pikërisht kjo ndodhte me postimet e
 *     panelit, që shkruanin etiketën bashkë me përmbajtjen.
 */
export function relativeTime(value, now = new Date()) {
  if (!value) return "";
  /* MySQL kthen "2026-09-01 10:22:33"; `T` e bën ISO për çdo shfletues. */
  const then = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(then.getTime())) return "";

  const minutes = Math.floor((now - then) / 60000);
  if (minutes < 1) return "Tani";
  if (minutes < 60) return `${minutes} min më parë`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "orë" : "orë"} më parë`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Dje";
  if (days < 7) return `${days} ditë më parë`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} ${weeks === 1 ? "javë" : "javë"} më parë`;
  return `${Math.floor(days / 30)} muaj më parë`;
}
