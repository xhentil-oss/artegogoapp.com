import { INTENTIONS, INTENT_FREQUENCY } from "../data/intentions.js";

/**
 * Kërkon meta-të e një qëllimi. Kthen gjithmonë një objekt të vlefshëm —
 * asnjë ekran nuk duhet të dështojë për një `intent` të panjohur.
 */
export const intentMeta = (id) => INTENTIONS.find((i) => i.id === id) ?? INTENTIONS[0];

/** Frekuenca e tonit për një qëllim (Hz). */
export const freqFor = (id) => INTENT_FREQUENCY[id] ?? 120;

/** Gradienti i qëllimit, si çift ngjyrash. */
export const intentColors = (id) => intentMeta(id).g;
