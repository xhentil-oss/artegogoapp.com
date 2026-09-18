/**
 * RUAJTJE E VENDOSSHME (key–value).
 *
 * Kodi origjinal thërriste `window.storage`, një API që ekziston vetëm brenda
 * artifact-eve të Claude-it — jashtë tij thirrjet dështonin në heshtje dhe
 * zakonet/gjendjet nuk ruheshin. Këtu përdoret `localStorage`.
 *
 * API-ja është *async* me qëllim: kur ruajtja të kalojë në backend
 * (`GET/PUT /me/tracking`), ndryshon vetëm brendësia e këtij skedari —
 * asnjë komponent.
 */

const PREFIX = "artegogo:";
const key = (name) => `${PREFIX}${name}`;

/** A është `localStorage` i përdorshëm (mund të bllokohet nga browser-i). */
function available() {
  try {
    const probe = `${PREFIX}__probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const isAvailable = typeof window !== "undefined" && available();

export const storage = {
  /**
   * @template T
   * @param {string} name
   * @param {T} fallback kthehet kur nuk ka vlerë ose ruajtja nuk lexohet
   * @returns {Promise<T>}
   */
  async get(name, fallback = null) {
    if (!isAvailable) return fallback;
    try {
      const raw = window.localStorage.getItem(key(name));
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  async set(name, value) {
    if (!isAvailable) return false;
    try {
      window.localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch {
      /* kuota e mbushur ose modalitet privat — mos e rrëzo UI-në */
      return false;
    }
  },

  async remove(name) {
    if (!isAvailable) return;
    try {
      window.localStorage.removeItem(key(name));
    } catch {
      /* pa pasojë */
    }
  },

  /**
   * Fshin ÇDO çelës të aplikacionit nga kjo pajisje.
   *
   * ⚠️  Vetëm ata me prefiksin `artegogo:`. Një `localStorage.clear()` do të
   *     fshinte edhe çelësat e çdo gjëje tjetër te i njëjti origjin.
   *
   * ⚠️  Përdoret VETËM te fshirja e llogarisë, jo te dalja. Zakonet, gjendjet
   *     dhe të preferuarat ruhen pa ndarje sipas llogarie — pra pas një
   *     fshirjeje, pa këtë, llogaria e radhës te e njëjta pajisje do t'i
   *     gjente ato të dikujt tjetër.
   */
  async clearAll() {
    if (!isAvailable) return 0;
    try {
      /* Emrat mblidhen të parët: heqja gjatë përsëritjes i zhvendos indekset
         dhe do të linte gjysmën pa fshirë. */
      const emrat = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(PREFIX)) emrat.push(k);
      }
      emrat.forEach((k) => window.localStorage.removeItem(k));
      return emrat.length;
    } catch {
      return 0;
    }
  },
};

/** Emrat e çelësave — të mbledhur, që të mos shkruhen si literale nëpër kod. */
export const STORAGE_KEYS = {
  habits: "habits",
  moods: "moods",
  history: "history",
  session: "session",
  /** Seancat që përdoruesi ndërton vetë dhe i ruan me emër. */
  customSessions: "custom-sessions",
  /** Emri + oraret e kujtesave, nga onboarding-u. */
  onboarding: "onboarding",
  /** Abonimi: plani, data e nisjes, prova, anulimi. */
  subscription: "subscription",
  /** Meditimet e shënuara me bookmark. */
  favorites: "favorites",
  /** Meditimet e shkarkuara për dëgjim jashtë linje. */
  downloads: "downloads",
  /**
   * Postimet e komunitetit që përdoruesi ka pëlqyer — `{ postId: data }`.
   *
   * Vetëm id-të: numri i pëlqimeve vjen nga serveri, ku e mban trigger-i.
   */
  postLikes: "post-likes",
  /**
   * Postimet e ruajtura, ME përmbajtjen — `{ postId: { at, post } }`.
   *
   * ⚠️  Ruhet edhe postimi, jo vetëm id-ja: feed-i kthen 50 të fundit, ndaj një
   *     postim i ruajtur më parë nuk gjendet dot më atje. Pa përmbajtjen,
   *     lista e të ruajturave do të kishte rreshta bosh pa asnjë shpjegim.
   */
  postSaves: "post-saves",
  /** Ndryshimet e bëra nga paneli i admin-it (klasifikim, pool-e, programe…). */
  admin: "admin",
  /** Llogaria: vetëm email-i. Fjalëkalimi nuk ruhet — shih `services/auth.js`. */
  account: "account",
  /**
   * Token-i JWT i hyrjes, i lëshuar nga `/auth/login`.
   *
   * ⚠️  Ruhet i ndarë nga llogaria me qëllim: shkëputja e fshin token-in
   *     patjetër, edhe nëse diçka tjetër dështon. Një token që mbijeton
   *     shkëputjen do të lejonte hyrje pa fjalëkalim te e njëjta pajisje.
   */
  token: "token",
  /** Kërkimet e fundit të përdoruesit. */
  recentSearches: "recent-searches",
  /** Rrugëtimi aktiv dhe ditët e kryera për çdo program. */
  journey: "journey",
  /**
   * Streak-u dhe medaljet, siç i kthen serveri.
   *
   * Kujtesë e ndërmjetme, jo burim: pa të, profili shfaqte "Ende pa medalje"
   * për një çast para se përgjigjja të mbërrinte — dhe njëmbëdhjetë medalje
   * dukeshin si zero.
   */
  rewards: "rewards",
};
