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
