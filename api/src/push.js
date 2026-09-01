const webpush = require("web-push");
const { query } = require("./db");

/**
 * ═══════════════════════════════════════════════════════════════
 *  DËRGIMI I NJOFTIMEVE — Web Push
 * ═══════════════════════════════════════════════════════════════
 *
 * Njoftimi mbërrin edhe kur aplikacioni është i mbyllur, sepse nuk e dorëzon
 * aplikacioni: e dorëzon shërbimi i shfletuesit (Google, Mozilla, Apple), te
 * një Service Worker që rrjedh pa faqe të hapur.
 *
 * ⚠️  KUFIRI I VËRTETË, I THËNË HAPUR:
 *
 *     Android dhe desktop — punon plotësisht.
 *     iPhone — punon VETËM nëse përdoruesi e ka shtuar aplikacionin te Home
 *     Screen (iOS 16.4+). Safari te skeda e zakonshme nuk pranon push. Ky nuk
 *     është defekt i kodit dhe nuk ndreqet me kod; është vendim i Apple-it.
 *     Për një aplikacion të vërtetë te App Store duhet paketim nativ dhe APNs.
 *
 *     Kur ai aplikacion të vijë, NDRYSHON VETËM KY SKEDAR — cron-i, tabelat
 *     dhe njoftimet mbeten të njëjtat.
 *
 * ⚠️  Trupi kriptohet me çelësat e vetë pajisjes. Serveri nuk mund ta lexojë
 *     atë që dërgon; kjo është pjesë e standardit. Prandaj teksti i njoftimit
 *     ruhet edhe te tabela `notifications` — përndryshe historiku i ziles do
 *     të mbetej bosh.
 */

/** A janë vendosur çelësat VAPID? */
function configured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

let ready = false;

/**
 * Vendos çelësat një herë.
 *
 * `VAPID_SUBJECT` duhet të jetë `mailto:` ose një URL — shërbimet e refuzojnë
 * kërkesat pa të, që të kenë ku të lajmërojnë kur diçka shkon keq.
 */
function init() {
  if (ready || !configured()) return configured();
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  ready = true;
  return true;
}

/** Statuset që tregojnë se abonimi ka vdekur përgjithmonë. */
const GONE = new Set([404, 410]);

/**
 * Dërgon një njoftim te të gjitha pajisjet e një përdoruesi.
 *
 * @returns {Promise<{sent:number, failed:number, reason?:string}>}
 */
async function sendToUser(userId, payload) {
  if (!init()) {
    return { sent: 0, failed: 0, reason: "VAPID nuk është konfiguruar" };
  }

  const subs = await query(
    "SELECT id, endpoint, p256dh, auth_key FROM push_subscriptions WHERE user_id = ? AND is_active = 1",
    [userId]
  );
  if (subs.length === 0) return { sent: 0, failed: 0, reason: "pa pajisje të regjistruara" };

  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        body,
        /* Sa gjatë e mban shërbimi njoftimin kur pajisja është offline. Një
           kujtesë e mëngjesit nuk ka kuptim të mbërrijë pasnesër. */
        { TTL: 3600 }
      );
      sent += 1;
      await query("UPDATE push_subscriptions SET last_sent_at = NOW(), last_error = NULL WHERE id = ?", [
        sub.id,
      ]);
    } catch (err) {
      failed += 1;
      const status = err?.statusCode ?? 0;

      /*
       * 404/410 = abonimi ka skaduar (shfletuesi u pastrua, aplikacioni u
       * hoq). Çaktivizohet, që dërguesi të mos e provojë pa fund.
       */
      if (GONE.has(status)) {
        await query(
          "UPDATE push_subscriptions SET is_active = 0, last_error = ? WHERE id = ?",
          [`skaduar (${status})`, sub.id]
        );
      } else {
        await query("UPDATE push_subscriptions SET last_error = ? WHERE id = ?", [
          String(err?.message ?? status).slice(0, 160),
          sub.id,
        ]);
      }
    }
  }

  return { sent, failed };
}

module.exports = { sendToUser, configured, publicKey: () => process.env.VAPID_PUBLIC_KEY ?? null };
