const crypto = require("crypto");

/**
 * ═══════════════════════════════════════════════════════════════
 *  STRIPE — klient i vogël, pa varësi
 * ═══════════════════════════════════════════════════════════════
 *
 * ⚠️  PA `npm install stripe`, ME QËLLIM.
 *
 *     Serveri rri te cPanel-i dhe ngarkohet si zip; `node_modules` shkon aty
 *     ashtu siç është. Paketa zyrtare e Stripe-it sjell varësi të tjera dhe
 *     disa megabajtë, dhe çdo ndryshim do të kërkonte "Run NPM Install" te
 *     paneli — hapi pikërisht që harrohet, dhe që e lë serverin të rrëzuar pa
 *     asnjë shenjë te faqja.
 *
 *     API-ja e Stripe-it është HTTP me `application/x-www-form-urlencoded`.
 *     Gjithçka që na duhet hyn te ky skedar: `fetch` (Node 18+, i njëjti kusht
 *     që ka tashmë `package.json`) dhe `crypto` i vetë Node-it.
 *
 * ⚠️  ÇELËSI RRI TE VARIABLAT E MJEDISIT, KURRË TE KODI.
 *
 *     cPanel → Setup Node.js App → Environment variables:
 *       `STRIPE_SECRET_KEY`      — `sk_live_…` (ose `sk_test_…` gjatë provave)
 *       `STRIPE_PUBLISHABLE_KEY` — `pk_live_…`, shkon te shfletuesi
 *       `STRIPE_WEBHOOK_SECRET`  — `whsec_…`, nga Developers → Webhooks
 *       `STRIPE_PRICE_MONTH`     — `price_…` për 24 €/muaj
 *       `STRIPE_PRICE_YEAR`      — `price_…` për 228 €/vit
 *
 *     `STRIPE_PUBLISHABLE_KEY` nuk është sekret dhe i dërgohet çdo shfletuesi
 *     që hap paywall-in — pa të, arka nuk vizatohet dot brenda faqes. Rri
 *     bashkë me të tjerët te mjedisi vetëm që të ndërrohet në një vend të
 *     vetëm kur kalojmë nga sandbox-i te llogaria e vërtetë.
 *
 *     Depoja është publike (shih `.gitignore`). Një `sk_live_` i shkruar te
 *     kodi lexohet nga kushdo brenda sekondash dhe jep të drejtë të plotë mbi
 *     paratë e llogarisë.
 */

const BASE = "https://api.stripe.com/v1";

const KEY = () => (process.env.STRIPE_SECRET_KEY || "").trim();

/**
 * A është vendosur Stripe-i?
 *
 * Përdoret për të kthyer `501 not_configured` në vend të një gabimi 500: deri
 * sa kompania të regjistrohet dhe çelësi të vijë, pagesat thjesht nuk
 * ekzistojnë — dhe kjo është gjendje e ditur, jo defekt.
 */
const configured = () => /^sk_(test|live)_/.test(KEY());

/** A jemi te çelësi i provave? Ekranet e thonë me zë, që të mos ngatërrohet. */
const isTestMode = () => KEY().startsWith("sk_test_");

/** Çelësi publik — i vetmi që del jashtë serverit. */
const publishableKey = () => (process.env.STRIPE_PUBLISHABLE_KEY || "").trim();

/**
 * A mund të shfaqen fushat e kartës?
 *
 * ⚠️  TË DY ÇELËSAT, JO VETËM SEKRETI.
 *
 *     Arka vizatohet brenda faqes nga `stripe.js`, dhe ai niset me çelësin
 *     publik. Me vetëm sekretin, serveri e krijon seancën pa gabim por ekrani
 *     mbetet bosh — dhe përdoruesi ka shtypur tashmë butonin. Prandaj ekrani
 *     e pyet këtë, jo `configured()`.
 */
const ready = () => configured() && /^pk_(test|live)_/.test(publishableKey());

/* ─────────────── kodimi i parametrave ─────────────── */

/**
 * `{ a: { b: 1 }, c: [2, 3] }` → `a[b]=1&c[0]=2&c[1]=3`
 *
 * Stripe nuk pranon JSON te trupi i kërkesës: formati është ai i formularëve,
 * me kllapa katrore për thellësinë. `undefined` dhe `null` nuk shkruhen fare —
 * te Stripe një fushë e dërguar bosh ka kuptim tjetër nga një fushë që mungon.
 */
function encode(params, prefix = "", out = []) {
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;

    if (Array.isArray(value)) {
      value.forEach((item, i) =>
        item !== null && typeof item === "object"
          ? encode(item, `${name}[${i}]`, out)
          : out.push(`${encodeURIComponent(`${name}[${i}]`)}=${encodeURIComponent(item)}`)
      );
    } else if (typeof value === "object") {
      encode(value, name, out);
    } else {
      out.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
    }
  }
  return out.join("&");
}

/** Gabim i Stripe-it, me kodin e tij — që thirrësi të dallojë shkakun. */
class StripeError extends Error {
  constructor(message, { status, code, type } = {}) {
    super(message);
    this.name = "StripeError";
    this.status = status;
    this.code = code;
    this.type = type;
  }
}

/**
 * Një thirrje te API-ja e Stripe-it.
 *
 * @param {"GET"|"POST"} method
 * @param {string} path p.sh. `/customers`
 * @param {object} params
 * @param {{ idempotencyKey?: string }} options
 *
 * ⚠️  `idempotencyKey` NUK ËSHTË ZBUKURIM te `POST`-et që krijojnë diçka.
 *     Pa të, një rrjet i ngadaltë ku klienti e provon dy herë hap dy abonime
 *     te e njëjta kartë. Me të, Stripe e kthen të parin dhe nuk krijon asgjë.
 */
async function call(method, path, params = {}, options = {}) {
  if (!configured()) {
    throw new StripeError("Pagesat nuk janë konfiguruar ende.", {
      status: 501,
      code: "not_configured",
    });
  }

  const body = method === "POST" ? encode(params) : null;
  const url = method === "GET" && Object.keys(params).length > 0
    ? `${BASE}${path}?${encode(params)}`
    : `${BASE}${path}`;

  const headers = {
    Authorization: `Bearer ${KEY()}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  let response;
  try {
    response = await fetch(url, { method, headers, body });
  } catch (err) {
    /* Rrjeti ra. Kurrë nuk supozohet se veprimi nuk ndodhi — mund të ketë
       ndodhur dhe përgjigjja të jetë humbur. Thirrësi NUK duhet ta përsërisë
       pa `idempotencyKey`. */
    throw new StripeError(`Nuk u arrit Stripe: ${err?.message ?? "rrjet"}`, {
      status: 502,
      code: "network",
    });
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const e = payload?.error ?? {};
    throw new StripeError(e.message || `Stripe ktheu ${response.status}.`, {
      status: response.status,
      code: e.code || e.decline_code || "stripe_error",
      type: e.type,
    });
  }

  return payload;
}

/* ─────────────── veprimet që na duhen ─────────────── */

const customers = {
  create: (params, options) => call("POST", "/customers", params, options),
  retrieve: (id) => call("GET", `/customers/${encodeURIComponent(id)}`),
};

const checkout = {
  createSession: (params, options) => call("POST", "/checkout/sessions", params, options),
  retrieveSession: (id) =>
    call("GET", `/checkout/sessions/${encodeURIComponent(id)}`, {
      "expand[0]": "subscription",
    }),
};

const subscriptions = {
  retrieve: (id) => call("GET", `/subscriptions/${encodeURIComponent(id)}`),
  update: (id, params) => call("POST", `/subscriptions/${encodeURIComponent(id)}`, params),
  /** Anulim i menjëhershëm — përdoret vetëm nga admini, kurrë nga ekrani. */
  cancel: (id) => call("DELETE", `/subscriptions/${encodeURIComponent(id)}`),
};

const billingPortal = {
  createSession: (params) => call("POST", "/billing_portal/sessions", params),
};

/* ─────────────── leximi i abonimit ─────────────── */

/**
 * Fundi i periudhës së tanishme, si `Date`.
 *
 * ⚠️  LEXOHET NGA DY VENDE, me qëllim. Deri te versioni `2025-03` i API-së,
 *     `current_period_end` rrinte te vetë abonimi. Nga `2025-04` e tutje ai u
 *     zhvendos te zërat e tij (`items.data[].current_period_end`), sepse një
 *     abonim mund të ketë zëra me cikle të ndryshme.
 *
 *     Versioni nuk e fiksojmë ne — e vendos llogaria te Stripe. Pra kodi duhet
 *     t'i njohë të dyja format, përndryshe data e mbarimit do të dalë `null`
 *     dhe aksesi do të pritej menjëherë pas pagesës.
 */
function periodEnd(subscription) {
  const direct = subscription?.current_period_end;
  if (Number.isFinite(direct)) return new Date(direct * 1000);

  const fromItem = subscription?.items?.data?.[0]?.current_period_end;
  if (Number.isFinite(fromItem)) return new Date(fromItem * 1000);

  return null;
}

/** Fundi i provës, ose `null` kur abonimi nuk është në provë. */
const trialEnd = (subscription) =>
  Number.isFinite(subscription?.trial_end) ? new Date(subscription.trial_end * 1000) : null;

/** `price_…` i zërit të parë — me të dallohet plani mujor nga vjetori. */
const priceId = (subscription) => subscription?.items?.data?.[0]?.price?.id ?? null;

/* ─────────────── webhook-u ─────────────── */

/** Sa larg në kohë pranohet një njoftim — mbrojtje ndaj ripërdorimit. */
const TOLERANCE_SEC = 300;

/**
 * Verifikon nënshkrimin e një njoftimi dhe kthen ngjarjen.
 *
 * ⚠️  TRUPI DUHET TË JETË I PAPREKUR (`Buffer`), jo objekt i analizuar.
 *     Nënshkrimi llogaritet mbi bajtët e saktë që dërgoi Stripe; `JSON.parse`
 *     e ndjekur nga `JSON.stringify` ndryshon hapësirat dhe radhën, dhe
 *     nënshkrimi nuk përputhet më. Prandaj rruga e webhook-ut montohet me
 *     `express.raw`, PARA `express.json` te `app.js`.
 *
 * ⚠️  PA VERIFIKIM, KJO RRUGË ËSHTË DERË E HAPUR. Kushdo mund të dërgonte një
 *     `customer.subscription.updated` të sajuar dhe t'i jepte vetes akses të
 *     përjetshëm, pa paguar asgjë. Prandaj mungesa e `STRIPE_WEBHOOK_SECRET`
 *     e refuzon kërkesën — kurrë nuk e kalon pa kontroll.
 *
 * @param {Buffer} rawBody
 * @param {string} header vlera e `Stripe-Signature`
 * @returns {object} ngjarja e Stripe-it
 * @throws {StripeError} kur nënshkrimi mungon, nuk përputhet ose ka vjetruar
 */
function constructEvent(rawBody, header) {
  const secret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    throw new StripeError("`STRIPE_WEBHOOK_SECRET` nuk është vendosur.", {
      status: 501,
      code: "not_configured",
    });
  }
  if (!Buffer.isBuffer(rawBody)) {
    throw new StripeError("Trupi i kërkesës nuk erdhi i papërpunuar.", {
      status: 400,
      code: "raw_body_missing",
    });
  }

  /* `t=1700000000,v1=abc…,v1=def…` — mund të ketë disa `v1` gjatë rrotullimit
     të çelësit, dhe mjafton që njëri të përputhet. */
  const parts = String(header ?? "").split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));

  if (!timestamp || signatures.length === 0) {
    throw new StripeError("Nënshkrimi mungon.", { status: 400, code: "signature_missing" });
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SEC) {
    throw new StripeError("Njoftimi ka vjetruar.", { status: 400, code: "signature_expired" });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");

  /*
   * `timingSafeEqual`, jo `===`.
   *
   * Krahasimi i zakonshëm i vargjeve ndalon te bajti i parë i ndryshëm, ndaj
   * koha e përgjigjes tregon sa shkronja u gjetën — dhe nënshkrimi zbulohet
   * shkronjë pas shkronje. Kërkon gjatësi të njëjtë, prandaj filtrohen të
   * tjerat para krahasimit.
   */
  const expectedBuf = Buffer.from(expected, "utf8");
  const ok = signatures.some((candidate) => {
    const buf = Buffer.from(candidate, "utf8");
    return buf.length === expectedBuf.length && crypto.timingSafeEqual(buf, expectedBuf);
  });

  if (!ok) {
    throw new StripeError("Nënshkrimi nuk përputhet.", { status: 400, code: "signature_invalid" });
  }

  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new StripeError("Njoftimi nuk ishte JSON.", { status: 400, code: "bad_payload" });
  }
}

module.exports = {
  StripeError,
  configured,
  isTestMode,
  publishableKey,
  ready,
  call,
  customers,
  checkout,
  subscriptions,
  billingPortal,
  periodEnd,
  trialEnd,
  priceId,
  constructEvent,
};
