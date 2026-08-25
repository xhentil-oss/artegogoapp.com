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
export const hourLabel = (hour) => (hour > 12 ? `${hour - 12} PM` : `${hour} AM`);
