import { BLOCKS } from "../data/blocks.js";
import { INTENTIONS } from "../data/intentions.js";
import { MEDITATIONS } from "./classification.js";
import { intentMeta } from "./intent.js";

/**
 * KËRKIMI NË KATALOG
 *
 * Kërkon në të 259 zërat — 15 mini-blloqet plus 244 meditimet e katalogut.
 * Më parë shikonte vetëm blloqet, ndaj "Gjumë" kthente një rezultat në vend
 * të gjashtëmbëdhjetëve që ekzistojnë.
 *
 * Logjikë e pastër: pa DOM, pa React — dhe zëvendësohet me një endpoint
 * `/search` kur të vijë backend-i, pa prekur asnjë ekran.
 */

/** Sa rezultate kthehen më së shumti. */
const MAX_RESULTS = 80;

/**
 * Sa mirë përputhet një meditim — numri më i vogël del më lart.
 *
 * Renditja ka rëndësi kur kërkimi prek qindra zëra: pa të, "Gjumë" do të
 * nxirrte i pari një meditim ku fjala shfaqet diku në përshkrim, ndërsa
 * "Shtegu i Gjumit" do të humbte poshtë.
 *
 * @returns {number|null} null kur nuk përputhet fare
 */
function score(item, query) {
  const title = item.title.toLowerCase();
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (title.includes(query)) return 2;

  /* Nën-tema është etiketë e vërtetë përmbajtjeje ("Gjumi", "Ankthi"), ndaj
     peshon më shumë se teksti i lirë i përshkrimit. */
  if (item.subTheme?.toLowerCase().includes(query)) return 3;
  if (intentMeta(item.intent).label.toLowerCase().includes(query)) return 4;
  if (item.desc?.toLowerCase().includes(query)) return 5;

  return null;
}

/**
 * @returns {{ blocks: {block: object, index: number}[], intents: object[], total: number }}
 */
export function searchContent(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return { blocks: [], intents: [], total: 0 };

  /* Blloqet para meditimeve: në barazim pikësh, një bllok i shkurtër i
     ndërtuesit është përgjigjja më e dobishme. */
  const pool = [...BLOCKS, ...MEDITATIONS];

  const hits = [];
  for (const item of pool) {
    const rank = score(item, query);
    if (rank !== null) hits.push({ item, rank });
  }

  hits.sort((a, b) => a.rank - b.rank);

  const blocks = hits
    .slice(0, MAX_RESULTS)
    /* `index` ushqen vlerësimin dhe autorin vend-mbajtës te kartela; mbetet
       pozicioni në listën e rezultateve, si më parë. */
    .map(({ item }, index) => ({ block: item, index }));

  const intents = INTENTIONS.filter((i) => i.label.toLowerCase().includes(query));

  return { blocks, intents, total: hits.length };
}
