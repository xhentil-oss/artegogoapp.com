import { api, hasToken } from "./api.js";
import { MEDAL_TIERS } from "../domain/medals.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  SHPËRBLIMET — streak-u dhe medaljet, nga databaza
 * ═══════════════════════════════════════════════════════════════
 *
 * ⚠️  MEDALJET NUK LLOGARITEN TE KLIENTI.
 *
 *     Ato jepen nga një trigger brenda MySQL-së, që fiton sa herë
 *     `current_streak` kalon një shumëfish të 3-shit, 7-shit ose 21-shit. Kjo
 *     ka dy pasoja që llogaritja te klienti nuk i jep:
 *
 *     1. Medaljet MBETEN kur streak-u prishet. Ato janë rreshta te tabela
 *        `medals`, të mbrojtura nga një çelës unik — pra as nuk humbin, as nuk
 *        dyfishohen. Llogaritja nga ditët e meditimit do t'i rindërtonte sa
 *        herë, dhe një ditë e humbur nga sinkronizimi do të hiqte një medalje
 *        të fituar me punë tri javësh.
 *
 *     2. Nuk falsifikohen. Një numër te `localStorage` ndryshohet me dy klikime.
 *
 *     `domain/medals.js` mbetet për fallback-un offline dhe për tekstin "edhe N
 *     ditë deri te…", që është llogaritje pamore, jo dhënie shpërblimi.
 */

const EMPTY_COUNTS = MEDAL_TIERS.reduce((acc, tier) => ({ ...acc, [tier.id]: 0 }), {});

/**
 * Numëron medaljet sipas renditjes.
 *
 * Serveri kthen një rresht për medalje të fituar; aplikacioni pret
 * `{ bronze: 7, silver: 3, gold: 1 }` — pulla "×N" mbi ikonë.
 */
function countByTier(rows = []) {
  return rows.reduce(
    (counts, row) => {
      const id = row.medal_type;
      if (id in counts) counts[id] += 1;
      return counts;
    },
    { ...EMPTY_COUNTS }
  );
}

/**
 * Lexon gjendjen e shpërblimeve.
 *
 * @returns {Promise<null|{streak:number,record:number,medals:object,list:Array,
 *                         totalSessions:number,totalMinutes:number}>}
 *          `null` kur nuk ka hyrje ose serveri nuk arrihet — thirrësi mbetet
 *          me llogaritjen lokale.
 */
export async function fetchRewards() {
  if (!hasToken()) return null;

  try {
    const [streak, medals] = await Promise.all([
      api.get("/me/streak"),
      api.get("/me/medals"),
    ]);

    const list = Array.isArray(medals) ? medals : [];
    return {
      /* Një përdorues i re nuk ka rresht streak-u — dhe kjo është 0, jo gabim. */
      streak: Number(streak?.current_streak) || 0,
      record: Number(streak?.best_streak) || 0,
      totalSessions: Number(streak?.total_sessions) || 0,
      totalMinutes: Math.round((Number(streak?.total_seconds) || 0) / 60),
      medals: countByTier(list),
      list,
    };
  } catch {
    return null;
  }
}
