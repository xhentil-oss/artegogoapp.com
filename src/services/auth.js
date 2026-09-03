import { storage, STORAGE_KEYS } from "./storage.js";
import { api, setToken, clearToken } from "./api.js";

/**
 * LLOGARIA E PËRDORUESIT — kufiri me shërbimin e vërtetetimit.
 *
 * Fjalëkalimi verifikohet te serveri, siç duhet: `POST /auth/login` e krahason
 * me `users.password_hash` (bcrypt) dhe kthen një token JWT. Këtu ai vetëm
 * kalon — **nuk ruhet askund**, as i hash-uar, as i kriptuar.
 *
 * ⚠️  Kontrollet më poshtë (`validate`) janë vetëm mirësjellje ndaj
 *     përdoruesit: kursejnë një kërkesë rrjeti kur email-i është dukshëm i
 *     gabuar. Ato NUK janë siguri — kushdo që hap DevTools i anashkalon. I
 *     vetmi kontroll që vlen është ai i serverit, dhe ai bëhet gjithsesi.
 *
 * Serveri kthen `{ token, user }`. Token-i shkon te `services/api.js`, që e
 * vendos te çdo kërkesë e mëpasme; nga `user` mbahet vetëm sa i duhet
 * aplikacionit për të ditur kush është.
 */

/** Sa i gjatë duhet të jetë fjalëkalimi. Kufiri i vërtetë vendoset te serveri. */
export const MIN_PASSWORD = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (value) => EMAIL_RE.test((value ?? "").trim());

/**
 * Verifikon fushat përpara se të prekim shërbimin.
 * @returns {string|null} mesazhi i gabimit, ose null kur është në rregull
 */
export function validate({ email, password }) {
  if (!isEmail(email)) return "Shkruaj një email të vlefshëm.";
  if ((password ?? "").length < MIN_PASSWORD) {
    return `Fjalëkalimi duhet të ketë së paku ${MIN_PASSWORD} shenja.`;
  }
  return null;
}

/** Llogaria e ruajtur, ose null. */
export const currentAccount = () => storage.get(STORAGE_KEYS.account, null);

/**
 * Krijon llogari të re.
 * @returns {Promise<{ ok: true, account: object } | { ok: false, error: string }>}
 */
/**
 * Ruan token-in dhe llogarinë pas një përgjigjeje të suksesshme.
 *
 * Nga `user` mbahen vetëm fushat që i duhen aplikacionit. Kopjimi i gjithë
 * objektit do të linte te `localStorage` gjendjen e abonimit — dhe ajo lexohet
 * gjithmonë nga serveri, sepse aty nuk redaktohet dot.
 */
async function establish({ token, user }, fallbackEmail) {
  const account = {
    id: user?.id ?? null,
    email: user?.email ?? fallbackEmail,
    name: user?.name ?? null,
    /*
     * ⚠️  E drejta e admin-it vjen NGA SERVERI (`users.is_admin`), jo nga një
     *     ndërprerës te pajisja. Ruhet vetëm që ekrani të dijë çfarë të
     *     tregojë; vendimin e vërtetë e merr `requireAdmin` te çdo shkrim,
     *     ndaj një vlerë e ndryshuar me dorë nuk jep asnjë të drejtë.
     */
    isAdmin: Boolean(user?.is_admin),
    createdAt: user?.created_at ?? new Date().toISOString(),
  };
  await setToken(token);
  await storage.set(STORAGE_KEYS.account, account);
  return { ok: true, account };
}

export async function signUp({ email, password }) {
  const problem = validate({ email, password });
  if (problem) return { ok: false, error: problem };

  const clean = email.trim().toLowerCase();
  try {
    const data = await api.post("/auth/register", { email: clean, password }, { auth: false });
    return await establish(data, clean);
  } catch (err) {
    /* Serveri e formulon vetë mesazhin — përfshirë "Kjo llogari ekziston". */
    return { ok: false, error: err.message };
  }
}

/**
 * Hyrje në një llogari.
 *
 * ⚠️  Kur kredencialet janë të gabuara, serveri kthen të njëjtin mesazh për
 *     një email që nuk ekziston dhe për një fjalëkalim të gabuar. Kjo është e
 *     qëllimshme dhe nuk duhet "përmirësuar": mesazhe të ndryshme do t'i
 *     tregonin kujtdo se cilat email-e janë të regjistruara.
 */
export async function signIn({ email, password }) {
  const problem = validate({ email, password });
  if (problem) return { ok: false, error: problem };

  const clean = email.trim().toLowerCase();
  try {
    const data = await api.post("/auth/login", { email: clean, password }, { auth: false });
    return await establish(data, clean);
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Shkëputje — heq token-in dhe llogarinë, por RUAN progresin në pajisje.
 *
 * Token-i hiqet i pari: nëse diçka dështon në mes, më mirë të mbetet një
 * llogari pa token (që thjesht kërkon hyrje) sesa një token pa llogari.
 */
export async function signOut() {
  await clearToken();
  await storage.remove(STORAGE_KEYS.account);
  /* Shpërblimet e llogarisë së mëparshme hiqen: përndryshe hyrja e radhës do
     të shihte për një çast medaljet e dikujt tjetër. */
  await storage.remove(STORAGE_KEYS.rewards);
}

/* ─────────────── rivendosja e fjalëkalimit ─────────────── */

/**
 * Kërkon një link rivendosjeje.
 *
 * ⚠️  Serveri kthen TË NJËJTËN përgjigje edhe kur email-i nuk ekziston, dhe
 *     ekrani duhet ta respektojë atë: një "kjo llogari nuk ekziston" do t'i
 *     tregonte kujtdo se cilat email-e janë të regjistruara. Prandaj mesazhi
 *     vjen nga serveri, dhe klienti nuk shton asnjë përfundim të vetin.
 *
 * @returns {Promise<{ok:boolean, message?:string, error?:string, notConfigured?:boolean}>}
 */
export async function requestReset(email) {
  if (!isEmail(email)) return { ok: false, error: "Shkruaj një email të vlefshëm." };

  try {
    const data = await api.post("/auth/forgot", { email: email.trim().toLowerCase() }, { auth: false });
    return { ok: true, message: data?.message };
  } catch (err) {
    if (err?.status === 501) return { ok: false, notConfigured: true, error: err.message };
    return { ok: false, error: err?.message ?? "Kërkesa dështoi." };
  }
}

/**
 * Vendos fjalëkalimin e re me token-in nga email-i.
 *
 * Pas suksesit përdoruesi HYN menjëherë — serveri kthen token-in bashkë me
 * llogarinë. Ai sapo provoi identitetin përmes email-it; një ekran hyrjeje pas
 * kësaj do të ishte hap i kotë.
 */
export async function resetPassword({ token, password }) {
  if ((password ?? "").length < MIN_PASSWORD) {
    return { ok: false, error: `Fjalëkalimi duhet të ketë së paku ${MIN_PASSWORD} shenja.` };
  }

  try {
    const data = await api.post("/auth/reset", { token, password }, { auth: false });
    return await establish(data, data?.user?.email);
  } catch (err) {
    return { ok: false, error: err?.message ?? "Rivendosja dështoi." };
  }
}

/**
 * Token-i i rivendosjes nga adresa, nëse është.
 *
 * Aplikacioni nuk ka rrugëzim; link-u i email-it është `/?reset=<token>`, dhe
 * ekrani i hyrjes e lexon që andej.
 */
export function resetTokenFromUrl() {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("reset");
  return value && value.length === 64 ? value : null;
}

/**
 * Heq `?reset=` nga adresa pa rifreskuar faqen.
 *
 * ⚠️  Duhet patjetër pas rivendosjes: përndryshe token-i mbetet te shiriti i
 *     adresës, hyn te historiku i shfletuesit, dhe kopjohet bashkë me link-un
 *     kur përdoruesi e ndan faqen.
 */
export function clearResetFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("reset");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}
