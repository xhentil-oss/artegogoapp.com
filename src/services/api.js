import { storage, STORAGE_KEYS } from "./storage.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  KLIENTI I API-së
 * ═══════════════════════════════════════════════════════════════
 *
 * I vetmi vend ku aplikacioni prek rrjetin. Çdo modul tjetër thërret
 * `api.get` / `api.post`, dhe nuk di as adresën, as token-in, as formën e
 * gabimeve.
 *
 * ⚠️  BAZA ËSHTË RELATIVE (`/api`) me qëllim.
 *
 *     Në prodhim faqja shërbehet nga `app.drartegogo.com`, ku edhe API-ja
 *     ndodhet te `/api` — pra e njëjta origjinë, dhe CORS-i nuk hyn fare në
 *     lojë. Në zhvillim, Vite-ja e përcjell `/api` te serveri (shih
 *     `vite.config.js`); përcjellja ndodh te Node-i, jo te shfletuesi, ndaj
 *     as aty nuk ka CORS.
 *
 *     Një adresë absolute do të kërkonte që `APP_ORIGIN` te cPanel të njihte
 *     edhe `localhost:5173` — pra konfigurim prodhimi i zgjeruar për hir të
 *     zhvillimit.
 */

/* `?.` sepse `import.meta.env` ekziston vetëm nën Vite; pa të, çdo provë
   e këtij moduli jashtë shfletuesit rrëzohet para se të nisë. */
const BASE = import.meta.env?.VITE_API_URL ?? "/api";

/** Sa pritet një përgjigje para se të dorëzohemi. */
const TIMEOUT_MS = 15000;

/*
 * Token-i mbahet edhe në kujtesë, jo vetëm te `localStorage`.
 *
 * `storage` është asinkron, ndaj një `await` para çdo kërkese do të shtonte
 * një cikël të panevojshëm. Kujtesa është burimi i shpejtë; disku është ai që
 * mbijeton rifreskimin.
 */
let token = null;

/** Lexon token-in e ruajtur — thirret një herë, në nisje. */
export async function loadToken() {
  token = await storage.get(STORAGE_KEYS.token, null);
  return token;
}

export async function setToken(value) {
  token = value;
  await storage.set(STORAGE_KEYS.token, value);
}

export async function clearToken() {
  token = null;
  await storage.remove(STORAGE_KEYS.token);
}

export const hasToken = () => Boolean(token);

/**
 * Gabim me kod statusi — që thirrësi të dallojë "pa abonim" (402) nga
 * "sesioni skadoi" (401) pa lexuar tekstin e mesazhit.
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Mesazhe për rastet ku serveri nuk arrihet fare. */
const OFFLINE = "Nuk u lidhëm me serverin. Kontrollo internetin.";
const SLOW = "Serveri nuk u përgjigj në kohë.";

async function request(path, { method = "GET", body, auth = true } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (err) {
    throw new ApiError(err?.name === "AbortError" ? SLOW : OFFLINE, 0);
  } finally {
    clearTimeout(timer);
  }

  /*
   * Një token i skaduar hiqet menjëherë. Pa këtë, çdo kërkesë e mëpasme do të
   * dërgonte të njëjtin token të pavlefshëm dhe do të merrte 401 — dhe
   * aplikacioni do të dukej i prishur në vend që thjesht i shkëputur.
   */
  if (response.status === 401 && auth) await clearToken();

  if (response.status === 204) {
    /* Rrjedha mbyllet kur ekziston — higjienë, që lidhja të lirohet menjëherë.
       (Chromium-i i shënon gjithsesi këto përgjigje pa trup si `ERR_ABORTED`
       te paneli i rrjetit; kjo është artefakt i tij, jo dështim: statusi është
       204 dhe të dhënat mbërrijnë te databaza.) */
    await response.body?.cancel?.().catch?.(() => {});
    return null;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    /* Përgjigje pa JSON — p.sh. faqja e gabimit e Passenger-it. */
  }

  if (!response.ok) {
    throw new ApiError(payload?.error ?? `Gabim ${response.status}.`, response.status);
  }
  return payload;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
