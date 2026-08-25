/**
 * Shpërndarje dhe kopjim — pa varësi, me rrugëdalje kur API-ja nuk ekziston.
 *
 * Në telefon `navigator.share` hap fletën native të shpërndarjes (WhatsApp,
 * Instagram, mesazhe). Në desktop, ku ajo shpesh mungon, teksti kopjohet.
 */

/** @returns {Promise<"shared"|"copied"|"cancelled"|"failed">} */
export async function shareText({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      /* përdoruesi e mbylli fletën — nuk është gabim */
      if (error?.name === "AbortError") return "cancelled";
    }
  }
  return copyText([text, url].filter(Boolean).join("\n\n"));
}

/** @returns {Promise<"copied"|"failed">} */
export async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return "copied";
  } catch {
    return "failed";
  }
}
