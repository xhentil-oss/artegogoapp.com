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
}
