import { api, hasToken } from "./api.js";
import { STORAGE_KEYS } from "./storage.js";
import { findMeditation } from "./contentRepository.js";
import { isDatabaseId } from "../lib/ids.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  TË DHËNAT E PËRDORUESIT — nga shfletuesi te databaza
 * ═══════════════════════════════════════════════════════════════
 *
 * Zakonet, gjendjet, historiku, të preferuarat dhe shkarkimet shkruheshin te
 * `localStorage`. Tani shkruhen te serveri, dhe `localStorage` mbetet vetëm
 * kujtesë e ndërmjetme — që aplikacioni të hapet edhe pa internet.
 *
 * ⚠️  SERVERI ËSHTË BURIMI I VËRTETË, JO SHFLETUESI.
 *     Prandaj `load()` e mbishkruan gjendjen lokale kur përgjigjet: nëse
 *     përdoruesi ka meditutar te telefoni, historiku duhet të shfaqet edhe te
 *     kompjuteri. E kundërta — të mbetej lokalja — do të thoshte dy realitete
 *     paralele që nuk pajtohen kurrë.
 *
 * Çdo çelës ka dy funksione:
 *   `load()`           — sjell gjendjen e plotë nga serveri, në formën lokale
 *   `write(prev, next)` — nxjerr NDRYSHIMIN dhe dërgon vetëm atë
 *
 * `write` punon me ndryshimin, jo me gjendjen e plotë, sepse endpoint-et janë
 * të tipizuara (`PUT /favorites/:id`, `DELETE /favorites/:id`) — nuk ka asnjë
 * rrugë që pranon "ja e gjithë lista". Kjo është zgjedhje e serverit dhe e
 * saktë: dërgimi i listës së plotë do të lejonte një klient të fshinte pa
 * dashje gjithçka me një kërkesë të cunguar.
 */

/* ─────────────── ndihmësa ─────────────── */

/** Çelësat e shtuar dhe të hequr mes dy objektesh. */
function diffKeys(prev = {}, next = {}) {
  const added = Object.keys(next).filter((k) => !(k in prev));
  const removed = Object.keys(prev).filter((k) => !(k in next));
  return { added, removed };
}

const MONTHS = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gsh", "Sht", "Tet", "Nën", "Dhj"];

/** `2026-08-31` → `Sot` ose `31 Gsh`. */
function dayLabel(isoDate, today) {
  if (isoDate === today) return "Sot";
  const [, m, d] = isoDate.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ""}`.trim();
}

/** Data e sotme sipas orës së pajisjes — vetëm për etiketa, kurrë për shkrim. */
const todayLocal = () => new Intl.DateTimeFormat("en-CA").format(new Date());

/* ─────────────── zakonet ─────────────── */

/*
 * Serveri kthen rreshta `{date, habit_type, value}`; aplikacioni pret
 * `{ "2026-08-31": { water: true } }`. Përkthimi bëhet vetëm këtu.
 */
const habits = {
  async load() {
    const rows = await api.get("/me/habits?days=365");
    const map = {};
    for (const row of rows ?? []) {
      (map[row.date] ??= {})[row.habit_type] = Number(row.value) > 0;
    }
    return map;
  },

  async write(prev, next) {
    const today = todayLocal();
    const before = prev[today] ?? {};
    const after = next[today] ?? {};

    /* Vetëm dita e sotme shkruhet — serveri e refuzon gjithsesi çdo datë
       tjetër, sepse e llogarit vetë nga zona kohore e përdoruesit. */
    const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
      (id) => Boolean(before[id]) !== Boolean(after[id])
    );

    await Promise.all(
      changed.map((id) => api.put(`/me/habits/${encodeURIComponent(id)}`, { value: after[id] ? 1 : 0 }))
    );
  },
};

/* ─────────────── gjendja emocionale ─────────────── */

const moods = {
  async load() {
    const rows = await api.get("/me/moods?days=365");
    return Object.fromEntries((rows ?? []).map((row) => [row.date, Number(row.mood_score)]));
  },

  async write(prev, next) {
    const today = todayLocal();
    if (prev[today] === next[today] || next[today] == null) return;
    await api.put("/me/moods", { mood_score: Number(next[today]) });
  },
};

/* ─────────────── historiku i seancave ─────────────── */

const history = {
  async load() {
    const rows = await api.get("/me/sessions?limit=200");
    const today = todayLocal();
    const map = {};

    for (const row of rows ?? []) {
      /*
       * `intent` nuk ruhet te databaza — nxirret nga vetë meditimi, që ngjyra e
       * grafikut të mbetet e njëjtë edhe kur kategoria e tij ndryshon më vonë.
       */
      const meditation = row.meditation_id ? findMeditation(row.meditation_id) : null;
      (map[row.local_date] ??= []).push({
        id: row.id,
        date: dayLabel(row.local_date, today),
        min: Math.max(1, Math.round(row.duration_sec / 60)),
        intent: meditation?.intent ?? "calm",
        title: row.meditation_title ?? meditation?.title ?? null,
        mood: row.mood_after ?? undefined,
      });
    }
    return map;
  },

  /**
   * Vetëm seancat e reja dërgohen.
   *
   * ⚠️  Njihen nga mungesa e `id`: një seancë e ardhur nga serveri e ka, një
   *     e sapokrijuar jo. Pa këtë shenjë, çdo shkrim do të ridërgonte gjithë
   *     ditën — dhe historiku do të dyfishohej me çdo etiketë gjendjeje.
   */
  async write(prev, next) {
    const today = todayLocal();
    const fresh = (next[today] ?? []).filter((entry) => !entry.id && !entry.sent);

    for (const entry of fresh) {
      /* Shënohet para dërgimit: nëse dy shkrime ndodhin njëri pas tjetrit,
         i dyti nuk e përsërit atë që sapo u nis. */
      entry.sent = true;
      const saved = await api.post("/me/sessions", {
        meditation_id: entry.meditationId ?? null,
        duration_sec: Math.round((entry.min ?? 0) * 60),
        completed: true,
        source: entry.source ?? "library",
        mood_after: entry.mood ?? null,
      });
      entry.id = saved?.id ?? null;
    }
  },
};

/* ─────────────── të preferuarat dhe shkarkimet ─────────────── */

/** Të dyja kanë të njëjtën formë: `{ meditationId: dataISO }`. */
function idListStore(path) {
  return {
    async load() {
      const rows = await api.get(`/me/${path}`);
      return Object.fromEntries((rows ?? []).map((row) => [row.id, row.created_at]));
    },

    async write(prev, next) {
      const { added, removed } = diffKeys(prev, next);
      /* Mini-blloqet lokale nuk ekzistojnë te databaza — shih `lib/ids.js`.
         Ato mbeten te `localStorage` dhe nuk dërgohen fare. */
      await Promise.all([
        ...added.filter(isDatabaseId).map((id) => api.put(`/me/${path}/${encodeURIComponent(id)}`)),
        ...removed.filter(isDatabaseId).map((id) => api.del(`/me/${path}/${encodeURIComponent(id)}`)),
      ]);
    },
  };
}

/* ─────────────── seancat e ndërtuara (Krijo) ─────────────── */

/*
 * Forma lokale: `{ [id]: { id, name, blockIds, createdAt } }`.
 * Serveri: `creations` + `creation_steps`, me radhën e hapave të ruajtur.
 *
 * ⚠️  Hapat i referohen `meditations` me çelës të huaj — prandaj edhe të 15
 *     mini-blloqet e ndërtuesit jetojnë atje (`is_block = 1`). Pa këtë,
 *     çdo seancë me një hapje ose mbyllje do të refuzohej, dhe pothuajse çdo
 *     seancë e ndërtuar i ka.
 */
const creations = {
  async load() {
    const rows = await api.get("/me/creations");
    return Object.fromEntries(
      (rows ?? []).map((row) => [
        row.id,
        {
          id: row.id,
          name: row.name,
          blockIds: (row.steps ?? []).sort((a, b) => a.order - b.order).map((s) => s.meditation_id),
          createdAt: row.created_at,
          /* Shenjë se ky rresht ekziston tashmë te serveri — shih `write`. */
          saved: true,
        },
      ])
    );
  },

  async write(prev, next) {
    const { added, removed } = diffKeys(prev, next);

    /* Fshirjet i pari: një seancë e hequr nuk duhet të mbetet te serveri edhe
       nëse ruajtja e një tjetre dështon. */
    await Promise.all(
      removed
        .filter((id) => prev[id]?.saved || isDatabaseId(id))
        .map((id) => api.del(`/me/creations/${encodeURIComponent(id)}`))
    );

    for (const key of added) {
      const item = next[key];
      /* Ato që erdhën nga serveri nuk ridërgohen. */
      if (!item || item.saved) continue;

      const steps = (item.blockIds ?? [])
        .map((id) => findMeditation(id))
        .filter((m) => m && isDatabaseId(m.id))
        .map((m) => ({ meditation_id: m.id, duration_sec: (m.dur ?? 0) * 60 }));

      if (steps.length === 0) continue;

      const saved = await api.post("/me/creations", {
        name: item.name,
        generation_type: item.generated ? "ai_generated" : "manual",
        steps,
      });

      /*
       * Id-ja lokale (`s1788…`) zëvendësohet nga ajo e databazës.
       *
       * Objekti ndryshohet në vend sepse `next` është tashmë gjendja e re; pa
       * këtë, fshirja e mëvonshme do të dërgonte id-në lokale, që serveri nuk
       * e njeh, dhe seanca do të mbetej aty përgjithmonë.
       */
      if (saved?.id) {
        item.id = saved.id;
        item.saved = true;
      }
    }
  },
};

/* ─────────────── regjistri ─────────────── */

const REMOTE = {
  [STORAGE_KEYS.habits]: habits,
  [STORAGE_KEYS.moods]: moods,
  [STORAGE_KEYS.history]: history,
  [STORAGE_KEYS.favorites]: idListStore("favorites"),
  [STORAGE_KEYS.downloads]: idListStore("downloads"),
  [STORAGE_KEYS.customSessions]: creations,
};

/**
 * Përshtatësi për një çelës, ose `null`.
 *
 * `null` kur përdoruesi nuk ka hyrë ende (nuk ka ku të shkruhet) ose kur
 * çelësi nuk ka barasvlerës te serveri. Në të dyja rastet mbetet `localStorage`.
 */
export const remoteFor = (storageKey) => (hasToken() ? REMOTE[storageKey] ?? null : null);
