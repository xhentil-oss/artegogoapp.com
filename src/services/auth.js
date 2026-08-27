import { storage, STORAGE_KEYS } from "./storage.js";

/**
 * LLOGARIA E PËRDORUESIT — kufiri me shërbimin e vërtetetimit.
 *
 * ⚠️  KUFIZIM I DEKLARUAR
 *     Ky prototip NUK e verifikon fjalëkalimin. Nuk mundet: verifikimi ndodh
 *     te serveri, dhe një kontroll brenda shfletuesit do të mund t'i
 *     anashkalohej nga kushdo që hap DevTools. Ndaj fjalëkalimi kërkohet,
 *     kalon nga këtu, dhe **nuk ruhet askund** — as i hash-uar, as i kriptuar.
 *     Ruhet vetëm email-i, që aplikacioni të dijë kush është.
 *
 * Kur të vijë backend-i, ndryshojnë vetëm trupat e `signUp`/`signIn`:
 * `POST /auth/register` dhe `POST /auth/login`, që kthejnë një token JWT.
 * Asnjë ekran nuk prek gjë.
 *
 * Databaza është MySQL te cPanel (shih `mysql/README.md`), pra vërtetimin e
 * bën API-ja jonë, jo një shërbim i gatshëm. Fjalëkalimi ruhet te
 * `users.password_hash` i hash-uar me **bcrypt** ose **argon2id** — kurrë MD5,
 * kurrë SHA1, kurrë i pastër.
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
export async function signUp({ email, password }) {
  const problem = validate({ email, password });
  if (problem) return { ok: false, error: problem };

  const existing = await currentAccount();
  if (existing && existing.email === email.trim().toLowerCase()) {
    return { ok: false, error: "Kjo llogari ekziston. Hyr me fjalëkalimin tënd." };
  }

  /* PROD: krijim te serveri, pastaj email verifikimi. */
  const account = {
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };
  await storage.set(STORAGE_KEYS.account, account);
  return { ok: true, account };
}

/**
 * Hyrje në një llogari.
 *
 * Fjalëkalimi kontrollohet vetëm për gjatësi — shih shënimin lart. Nëse në
 * pajisje ruhet një email tjetër, ai zëvendësohet: një pajisje demo mban një
 * llogari të vetme.
 */
export async function signIn({ email, password }) {
  const problem = validate({ email, password });
  if (problem) return { ok: false, error: problem };

  /* PROD: POST /auth/login → token; gabimi "kredenciale të pasakta" vjen aty. */
  const account = {
    email: email.trim().toLowerCase(),
    createdAt: (await currentAccount())?.createdAt ?? new Date().toISOString(),
  };
  await storage.set(STORAGE_KEYS.account, account);
  return { ok: true, account };
}

/** Shkëputje — heq llogarinë, por RUAN progresin në pajisje. */
export async function signOut() {
  await storage.remove(STORAGE_KEYS.account);
}
