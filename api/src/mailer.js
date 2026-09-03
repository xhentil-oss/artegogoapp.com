const nodemailer = require("nodemailer");

/**
 * ═══════════════════════════════════════════════════════════════
 *  DËRGIMI I EMAIL-EVE
 * ═══════════════════════════════════════════════════════════════
 *
 * Përdoret vetëm për rivendosjen e fjalëkalimit — pra për një veprim që
 * përdoruesi e kërkon vetë dhe e pret.
 *
 * ⚠️  DËSHTON I MBYLLUR. Pa `SMTP_HOST` dhe `SMTP_USER`, `send()` kthen
 *     `not_configured` dhe NUK pretendon sukses.
 *
 *     Kjo ka pasojë të drejtpërdrejtë te siguria: rruga `/auth/forgot` e
 *     krijon token-in vetëm PASI email-i të jetë dërguar. Po të kthente
 *     "sukses" pa dërguar, do të mbeteshin token-a të vlefshëm që nuk i marrë
 *     kush — dhe përdoruesi do të pritej pa fund një email që nuk vjen.
 *
 * KONFIGURIMI TE cPANEL (Setup Node.js App → Environment variables):
 *   SMTP_HOST     `localhost` te cPanel, ose `mail.drartegogo.com`
 *   SMTP_PORT     `465` (SSL) ose `587` (STARTTLS)
 *   SMTP_USER     një adresë e vërtetë, p.sh. `noreply@drartegogo.com`
 *   SMTP_PASSWORD fjalëkalimi i saj
 *   MAIL_FROM     `Arte Gogo <noreply@drartegogo.com>`
 */

function configured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

let transport = null;

function getTransport() {
  if (transport || !configured()) return transport;

  const port = Number(process.env.SMTP_PORT || 465);
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    /* 465 është SSL i drejtpërdrejtë; 587 nis i pastër dhe kalon te TLS. */
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    /*
     * Serverët e cPanel-it shpesh kanë certifikatë për hostname-in e serverit,
     * jo për domenin. Kur dërgojmë te `localhost`, verifikimi dështon pa arsye
     * — lidhja mbetet brenda të njëjtës makinë.
     */
    tls: { rejectUnauthorized: process.env.SMTP_HOST !== "localhost" },
  });
  return transport;
}

/**
 * Dërgon një email.
 *
 * @returns {Promise<{ok:boolean, reason?:string}>} nuk hedh kurrë
 */
async function send({ to, subject, text, html }) {
  const mailer = getTransport();
  if (!mailer) return { ok: false, reason: "not_configured" };

  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (err) {
    /* Mesazhi i plotë shkon te log-u; thirrësi merr vetëm një shenjë. */
    console.error("[artegogo/mail]", err?.message);
    return { ok: false, reason: "send_failed" };
  }
}

/**
 * Email-i i rivendosjes.
 *
 * ⚠️  Teksti i thjeshtë dërgohet bashkë me HTML-në: disa klientë email-i, dhe
 *     shumë filtra spam-i, refuzojnë mesazhet vetëm-HTML.
 *
 *     Link-u shkruhet i plotë edhe te teksti, sepse te klientët pa HTML një
 *     "shtyp këtu" nuk çon askund.
 */
function resetEmail({ name, link, minutes }) {
  const hello = name ? `Përshëndetje, ${name}.` : "Përshëndetje.";

  return {
    subject: "Rivendos fjalëkalimin — Arte Gogo",
    text: [
      hello,
      "",
      "Ke kërkuar të rivendosësh fjalëkalimin te Arte Gogo.",
      "Hape këtë link:",
      link,
      "",
      `Link-u vlen ${minutes} minuta dhe mund të përdoret vetëm një herë.`,
      "",
      "Nëse nuk e ke kërkuar ti, shpërfille këtë email — fjalëkalimi mbetet i njëjti.",
      "",
      "— Arte Gogo",
    ].join("\n"),
    html: `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1b1630;max-width:520px">
  <p>${hello}</p>
  <p>Ke kërkuar të rivendosësh fjalëkalimin te <strong>Arte Gogo</strong>.</p>
  <p style="margin:26px 0">
    <a href="${link}"
       style="background:#7C5CE0;color:#fff;text-decoration:none;padding:13px 24px;border-radius:999px;font-weight:700;display:inline-block">
      Rivendos fjalëkalimin
    </a>
  </p>
  <p style="color:#6b6480;font-size:13px">
    Link-u vlen ${minutes} minuta dhe përdoret vetëm një herë.<br>
    Nëse nuk e ke kërkuar ti, shpërfille këtë email — fjalëkalimi mbetet i njëjti.
  </p>
  <p style="color:#9a94ad;font-size:12px;word-break:break-all">${link}</p>
</div>`.trim(),
  };
}

module.exports = { send, configured, resetEmail };
