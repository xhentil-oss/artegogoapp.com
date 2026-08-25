import { BLOCKS } from "../data/blocks.js";
import { INTENTIONS } from "../data/intentions.js";
import { intentMeta } from "./intent.js";

/**
 * Kërkimi në katalog. Logjikë e pastër — testohet pa DOM,
 * dhe zëvendësohet lehtë me një endpoint `/search` kur vjen backend-i.
 *
 * @returns {{ blocks: {block: object, index: number}[], intents: object[] }}
 */
export function searchContent(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return { blocks: [], intents: [] };

  const blocks = BLOCKS.map((block, index) => ({ block, index })).filter(({ block }) =>
    matchesBlock(block, query)
  );

  const intents = INTENTIONS.filter((i) => i.label.toLowerCase().includes(query));

  return { blocks, intents };
}

function matchesBlock(block, query) {
  const haystack = [block.title, block.desc, intentMeta(block.intent).label];
  return haystack.some((field) => field.toLowerCase().includes(query));
}
