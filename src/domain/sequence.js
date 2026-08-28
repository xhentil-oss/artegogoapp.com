import { BLOCKS, PHASES } from "../data/blocks.js";
import { MEDITATIONS } from "./classification.js";

/**
 * SEKUENCA = lista e mini-meditimeve që luan player-i.
 *
 * Çdo element mban një `uid` unik brenda sesionit, i nevojshëm si React key
 * dhe për të hequr një element nga ndërtuesi kur i njëjti bllok është shtuar
 * dy herë. Numëratori është më i sigurt se `Date.now()`, që përsërisej kur
 * shtoheshin shumë elemente në të njëjtin milisekondë.
 */
let counter = 0;
const nextUid = () => `u${++counter}`;

/** Vesh një bllok me `uid`. */
export const withUid = (block) => ({ ...block, uid: nextUid() });

/** Kthen një bllok ose listë blloqesh në sekuencë të luajtshme. */
export const toSequence = (blockOrList) =>
  (Array.isArray(blockOrList) ? blockOrList : [blockOrList]).map(withUid);

export const totalMinutes = (sequence) => sequence.reduce((sum, b) => sum + b.dur, 0);
export const totalSeconds = (sequence) => totalMinutes(sequence) * 60;

/** Sekondat e kaluara përpara bllokut me indeksin `index`. */
export const secondsBefore = (sequence, index) => totalSeconds(sequence.slice(0, index));

/** Sa hapa korpi lejohen — mbi këtë, seanca bëhet listë detyrash. */
const MAX_CORE_STEPS = 8;

/** Sa minuta saktësi jepen për të ruajtur hapjen dhe mbylljen. */
const FRAME_TOLERANCE_MIN = 2;

/**
 * Monton një seancë që ZGJAT sa u kërkua.
 *
 * Versioni i mëparshëm PRISTE hapat sa të hynin nën kufi, pa i mbushur kurrë:
 * "Qetësim 20 minuta" jepte 6 minuta, sepse ndër 15 blloqet nuk kishte asnjë
 * korp me atë qëllim. Tani zgjedhja bëhet nga i gjithë katalogu, dhe hapat
 * shtohen derisa totali t'i afrohet objektivit.
 *
 * Struktura mbetet Hapje → Korp → Mbyllje: hapja dhe mbyllja janë të vetmet
 * që kanë faza, dhe pa to seanca nis e mbaron befas.
 *
 * @param {{ intent: string, maxMinutes: number }} options
 * @returns {object[]} blloqe pa `uid` — kaloji nga `toSequence()`.
 */
export function buildGuidedSequence({ intent, maxMinutes }) {
  const target = Math.max(1, maxMinutes);
  const pool = coreFor(intent);

  const opening = shortestWithPhase(PHASES.OPENING);
  const closing = shortestWithPhase(PHASES.CLOSING);
  const frame = (opening?.dur ?? 0) + (closing?.dur ?? 0);

  /*
   * Ndërtohen dy variante dhe fiton ai më afër objektivit.
   *
   * Korniza është e dëshirueshme, por jo me çdo kusht: te "Transformim" copa
   * më e shkurtër është 9 minuta, ndaj për një kërkesë 10-minutëshe korniza
   * e çonte totalin në 15. Pa të, seanca del 9 — shumë më besnike ndaj asaj
   * që kërkoi përdoruesi. Kur të dyja janë njësoj afër, fiton ajo me kornizë:
   * një seancë që nis dhe mbaron butësisht është më e mirë.
   */
  const framed = target > frame ? [opening, ...fill(pool, target - frame), closing].filter(Boolean) : [];
  const bare = fill(pool, target);

  if (framed.length === 0) return bare.length > 0 ? bare : [opening, closing].filter(Boolean);
  if (bare.length === 0) return framed;

  const framedOff = Math.abs(totalMinutes(framed) - target);
  const bareOff = Math.abs(totalMinutes(bare) - target);

  /*
   * Korniza mbahet edhe kur varianti pa të bie pak më afër.
   *
   * Pa këtë tolerancë, "Qetësim 20" zgjidhte dy meditime 10-minutëshe — total
   * i saktë, por seanca niste befas me një meditim të gjatë dhe mbaronte po
   * ashtu. Një minutë ose dy dallim nuk i ndihen përdoruesit; hapja dhe
   * mbyllja ndihen.
   */
  return framedOff <= bareOff + FRAME_TOLERANCE_MIN ? framed : bare;
}

/** Blloku më i shkurtër i një faze — korniza duhet të lërë vend për korpin. */
function shortestWithPhase(phase) {
  return BLOCKS.filter((b) => b.phase === phase).sort((a, b) => a.dur - b.dur)[0];
}

/**
 * Kandidatët e korpit për një qëllim: i gjithë katalogu, jo vetëm 15 blloqet.
 * Meditimet e katalogut janë të gjitha `Korpi`, ndaj hyjnë të tëra.
 */
function coreFor(intent) {
  const fromBlocks = BLOCKS.filter((b) => b.intent === intent && b.phase === PHASES.CORE);
  const fromCatalog = MEDITATIONS.filter((m) => m.intent === intent);
  const pool = [...fromBlocks, ...fromCatalog];

  /* Fallback: një qëllim pa përmbajtje nuk duhet të japë seancë boshe. */
  return pool.length > 0 ? pool : BLOCKS.filter((b) => b.phase === PHASES.CORE);
}

/**
 * Zgjedh hapat që e afrojnë totalin sa më shumë te `budget`.
 *
 * Zgjedhja e thjeshtë "merr më të madhin që hyn" nuk mjafton: me copëza 5, 6
 * dhe 10 minuta dhe një buxhet 14, ajo ndalet te 10 dhe lë 4 minuta hendek,
 * sepse asnjë hap nuk hyn më. Rezultati për "20 minuta" ishte 16.
 *
 * Prandaj kërkohen TË GJITHA shumat e arritshme deri në `budget + SLACK` dhe
 * merret ajo më e afërt — edhe nëse e kalon pak. Një seancë 21-minutëshe për
 * një kërkesë 20-minutëshe është shumë më e mirë se një 16-minutëshe.
 *
 * Kostoja është e vogël: shumat janë nën 50 dhe hapat nën 50, pra disa mijëra
 * krahasime — pa u ndier.
 */
const SLACK_MIN = 3;

function fill(pool, budget) {
  if (pool.length === 0) return [];

  const items = rotate(pool);
  const cap = budget + SLACK_MIN;

  /* shuma → hapat e parë që e arrijnë atë shumë */
  const reach = new Map([[0, []]]);

  for (const item of items) {
    for (const [sum, chosen] of [...reach]) {
      const next = sum + item.dur;
      if (next > cap || chosen.length >= MAX_CORE_STEPS) continue;
      if (!reach.has(next)) reach.set(next, [...chosen, item]);
    }
  }

  let best = null;
  for (const [sum, chosen] of reach) {
    if (chosen.length === 0) continue;
    const off = Math.abs(sum - budget);
    /* Në barazim distancash, fitojnë më pak hapa: një seancë me tre pjesë
       lexohet më mirë se e njëjta kohë e ndarë në gjashtë. */
    if (!best || off < best.off || (off === best.off && chosen.length < best.chosen.length)) {
      best = { off, chosen };
    }
  }

  /* Asgjë nuk hyri as me tolerancë — merr më të shkurtrin, që të mos dalë bosh. */
  if (!best) {
    const smallest = [...items].sort((a, b) => a.dur - b.dur)[0];
    return smallest ? [smallest] : [];
  }

  return best.chosen;
}

/**
 * Rrotullon listën një hap në çdo thirrje.
 *
 * Kur disa meditime kanë të njëjtën kohëzgjatje, kërkimi do të zgjidhte
 * gjithmonë të njëjtin — dhe "Gjenero" i shtypur dy herë do të jepte saktësisht
 * të njëjtën seancë. Rrotullimi e ndryshon renditjen pa e prekur totalin.
 */
let rotation = 0;
function rotate(pool) {
  rotation = (rotation + 1) % Math.max(1, pool.length);
  return [...pool.slice(rotation), ...pool.slice(0, rotation)];
}

/** Zhvendos një element brenda sekuencës (drag & drop në ndërtues). */
export function reorder(sequence, from, to) {
  if (from === to || from == null || to == null) return sequence;
  const next = [...sequence];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
