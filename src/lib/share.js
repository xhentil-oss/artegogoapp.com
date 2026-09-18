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
    /* Bie te rruga e vjetër — shih `copyLegacy`. */
    return copyLegacy(value);
  }
}

/**
 * Kopjim me `execCommand`, kur `navigator.clipboard` nuk punon.
 *
 * ⚠️  KJO ËSHTË ARSYEJA PSE "SHPËRNDAJ" DUKEJ I VDEKUR te disa shfletues.
 *
 *     `navigator.clipboard` kërkon kontekst të sigurt — pra `https` ose
 *     `localhost`. Te një faqe `http` ajo mungon fare, dhe te Safari-t e
 *     vjetër hedh kur thirrja nuk vjen drejt nga prekja. Rezultati: `failed`,
 *     dhe përdoruesi shihte "Shpërndarja nuk u krye" pa asnjë shkak të
 *     dukshëm — ndërsa teksti mund të kopjohej fare mirë kështu.
 *
 * `execCommand` është i zhvlerësuar, por punon kudo dhe nuk kërkon leje. Fusha
 * rri jashtë ekranit dhe hiqet menjëherë, ndaj nuk pulson asgjë në pamje.
 */
function copyLegacy(value) {
  try {
    const field = document.createElement("textarea");
    field.value = value;
    /* `readOnly` + pozicion fiks: pa të, iOS-i hap tastierën dhe faqja hidhet. */
    field.readOnly = true;
    field.setAttribute("aria-hidden", "true");
    field.style.cssText = "position:fixed;top:-1000px;left:0;opacity:0;";
    document.body.appendChild(field);

    field.select();
    /* iOS e shpërfill `select()` te një `textarea` — kërkon interval shenjash. */
    field.setSelectionRange(0, value.length);

    const ok = document.execCommand("copy");
    field.remove();
    return ok ? "copied" : "failed";
  } catch {
    return "failed";
  }
}
