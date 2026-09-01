/**
 * ═══════════════════════════════════════════════════════════════
 *  CRON — krijon njoftimet që duhen dërguar
 * ═══════════════════════════════════════════════════════════════
 *
 * Rregji te cPanel → Cron Jobs, çdo 15 minuta:
 *
 *   cd /home2/appdrartegogo/artegogo-api && \
 *     /home2/appdrartegogo/nodevenv/artegogo-api/18/bin/node cron/notify.js
 *
 * Bën dy gjëra për çdo kujtesë: shkruan rreshtin te `notifications` — atë që
 * sheh përdoruesi te zilja — dhe e dërgon si njoftim te pajisja.
 *
 * ⚠️  Të dyja mbeten TË NDARA me qëllim. Rreshti duhet të ekzistojë edhe nëse
 *     dërgimi dështon; nëse do të ishin një gjë e vetme, një abonim i skaduar
 *     do të fshinte edhe historikun. Rezultati i dërgimit shënohet te
 *     `push_sent_at` / `push_result`, që të dallohet "u krijua" nga "u dërgua".
 *
 *     Dërgimi bëhet me Web Push (`src/push.js`). Punon te Android dhe desktop;
 *     te iPhone vetëm nëse aplikacioni është shtuar te Home Screen (iOS 16.4+).
 *
 * I sigurt për t'u rregjur sa herë të duash: `dedupe_key` e ndalon përsëritjen.
 */
const { pool, query } = require("../src/db");
const { pickForSlot, SLOT_BY_REMINDER } = require("../src/routes/notifications");
const push = require("../src/push");

/** Sa minuta prapa shikon çdo rregji. Pak më gjerë se intervali, që një
 *  vonesë e cron-it të mos e humbasë kujtesën fare. */
const WINDOW_MIN = Number(process.env.NOTIFY_WINDOW_MIN || 20);

const WEEKDAY_COLUMN = ["on_sun", "on_mon", "on_tue", "on_wed", "on_thu", "on_fri", "on_sat"];

/** Data dhe ora lokale e përdoruesit — kujtesat janë në orën e TIJ. */
function localParts(timezone) {
  const tz = timezone || "Europe/Tirane";
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return { date, minutes: Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)), weekday };
}

/**
 * Shkruan njoftimin, ose e shpërfill nëse ekziston.
 *
 * `INSERT IGNORE` mbi `uq_notif_dedupe` — kjo është arsyeja pse cron-i mund të
 * rrjedhë çdo 15 minuta pa prodhuar dyzet kujtesa për një mëngjes.
 */
async function createNotification({ userId, title, body, type, relatedId = null, dedupeKey }) {
  const result = await query(
    `INSERT IGNORE INTO notifications (user_id, title, body, type, related_id, dedupe_key)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, title, body, type, relatedId, dedupeKey]
  );
  return result.affectedRows > 0;
}

/**
 * Dërgimi i vërtetë te pajisjet — Web Push.
 *
 * Njoftimi mbërrin edhe kur aplikacioni është i mbyllur, sepse nuk e dorëzon
 * aplikacioni: e dorëzon shërbimi i shfletuesit te një Service Worker.
 *
 * ⚠️  Android dhe desktop punojnë plotësisht. iPhone punon VETËM nëse
 *     aplikacioni është shtuar te Home Screen (iOS 16.4+) — vendim i Apple-it,
 *     jo kufi i kodit. Shih `src/push.js`.
 */
async function sendPush(userId, notification) {
  return push.sendToUser(userId, {
    title: notification.title ?? "Arte Gogo",
    body: notification.body ?? "",
    tag: notification.tag ?? "reminder",
    meditationId: notification.meditationId ?? null,
  });
}

/* ═══════════════ 1. KUJTESAT DITORE ═══════════════ */

async function runReminders() {
  const rows = await query(
    `SELECT r.user_id, r.reminder_type, r.time_of_day, r.on_mon, r.on_tue, r.on_wed,
            r.on_thu, r.on_fri, r.on_sat, r.on_sun, u.timezone, u.name
       FROM reminders r
       JOIN users u ON u.id = r.user_id
      WHERE r.is_enabled = 1`
  );

  let made = 0;
  for (const row of rows) {
    const { date, minutes, weekday } = localParts(row.timezone);
    if (!row[WEEKDAY_COLUMN[weekday]]) continue;

    const [h, m] = String(row.time_of_day).split(":");
    const due = Number(h) * 60 + Number(m);

    /* Brenda dritares së kaluar. Kujtesat e së ardhmes presin rregjinë e tyre;
       ato shumë të vjetra nuk dërgohen më — një njoftim "koha për meditim" në
       mesnatë për orën 7:00 është më keq se asnjë. */
    if (due > minutes || minutes - due > WINDOW_MIN) continue;

    const slot = SLOT_BY_REMINDER[row.reminder_type];
    const meditation = await pickForSlot(row.user_id, slot, date);
    if (!meditation) continue;

    const created = await createNotification({
      userId: row.user_id,
      title: "Koha për meditim",
      body: `${meditation.title} · ${Math.round(meditation.duration_sec / 60)} min`,
      type: "reminder",
      relatedId: meditation.id,
      dedupeKey: `reminder:${row.reminder_type}:${date}`,
    });

    if (created) {
      made += 1;
      const result = await sendPush(row.user_id, {
        title: "Koha për meditim",
        body: `${meditation.title} · ${Math.round(meditation.duration_sec / 60)} min`,
        meditationId: meditation.id,
      });
      /* Rezultati shkruhet te njoftimi: pa të, nuk dihet nëse ai u DËRGUA apo
         vetëm u krijua — dhe pikërisht ai dallim duhet kur klientja thotë
         "nuk më erdhi njoftimi i mëngjesit". */
      await query(
        `UPDATE notifications SET push_sent_at = NOW(), push_result = ?
          WHERE user_id = ? AND dedupe_key = ?`,
        [result.sent > 0 ? `dërguar te ${result.sent}` : (result.reason ?? "dështoi"),
         row.user_id, `reminder:${row.reminder_type}:${date}`]
      );
      if (result.sent === 0) console.log(`  push i padërguar (${result.reason ?? result.failed + " dështime"})`);
    }
  }
  return made;
}

/* ═══════════════ 2. PROVA PO MBARON ═══════════════ */

/**
 * Seksioni 8: njoftim para ditës 3 të provës falas.
 *
 * Dërgohet kur mbeten nën 24 orë dhe përdoruesi nuk ka anuluar — kush ka
 * anuluar tashmë e di se nuk do të tarifohet, dhe një kujtesë do të ishte
 * shqetësim pa qëllim.
 */
async function runTrialEnding() {
  const rows = await query(
    `SELECT id, name, timezone, subscription_end_at
       FROM users
      WHERE subscription_status = 'trial'
        AND cancelled_at IS NULL
        AND subscription_end_at IS NOT NULL
        AND subscription_end_at > NOW()
        AND subscription_end_at <= DATE_ADD(NOW(), INTERVAL 24 HOUR)`
  );

  let made = 0;
  for (const row of rows) {
    const ends = String(row.subscription_end_at).slice(0, 10);
    const created = await createNotification({
      userId: row.id,
      title: "Prova falas po mbaron",
      body: "Abonimi fillon nesër. Anulo kurdo nga Cilësimet → Abonimet, të paktën 24 orë para.",
      type: "trial",
      dedupeKey: `trial_ending:${ends}`,
    });
    if (created) {
      made += 1;
      await sendPush(row.id, {
        title: "Prova falas po mbaron",
        body: "Abonimi fillon nesër. Anulo kurdo nga Cilësimet → Abonimet.",
        tag: "trial",
      });
    }
  }
  return made;
}

/* ═══════════════ 3. PROVA QË SKADUAN ═══════════════ */

/**
 * Kalon te 'expired' abonimet që kanë mbaruar.
 *
 * Pa këtë, `subscription_status` do të mbetej 'trial' përgjithmonë. Aksesi
 * ndalet gjithsesi — `hasPremium()` krahason datën — por statusi i ngecur do
 * ta bënte të pamundur leximin e gjendjes së vërtetë te paneli.
 */
async function runExpiries() {
  const result = await query(
    `UPDATE users
        SET is_premium = 0, subscription_status = 'expired'
      WHERE is_premium = 1
        AND subscription_end_at IS NOT NULL
        AND subscription_end_at <= NOW()`
  );
  return result.affectedRows ?? 0;
}

async function main() {
  const started = Date.now();
  try {
    const reminders = await runReminders();
    const trials = await runTrialEnding();
    const expired = await runExpiries();
    console.log(
      `[artegogo/cron] kujtesa: ${reminders} · prova që mbarojnë: ${trials} · skaduan: ${expired} · ${Date.now() - started}ms`
    );
  } catch (err) {
    console.error("[artegogo/cron] dështoi:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) main();

module.exports = { runReminders, runTrialEnding, runExpiries, localParts };
