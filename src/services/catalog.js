import { api } from "./api.js";
import { PHASES, PHASE_BY_DB, replaceBlocks } from "../data/blocks.js";
import { replaceCatalog } from "../domain/classification.js";
import { TECHNIQUE_BY_SLUG, CATEGORY_BY_SLUG, intentForCategory } from "./taxonomy.js";
import { relativeTime } from "../lib/format.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  MBUSHJA E KATALOGUT NGA SERVERI
 * ═══════════════════════════════════════════════════════════════
 *
 * Thirret një herë, në nisje. Pas saj `contentRepository` mbetet krejt sinkron
 * dhe asnjë ekran nuk ndryshon — sepse përmbajtja shkon te i njëjti varg që
 * ata lexojnë tashmë (shih `domain/classification.js`).
 *
 * Kjo ishte zgjedhja kundrejt alternativës: t'i bëje të 23 skedarët që
 * importojnë `contentRepository` asinkronë, me gjendje ngarkimi te secili.
 * Katalogu është përmbajtje e palëvizshme dhe e vogël (~244 rreshta, nën
 * 150 KB) — nuk fiton asgjë nga ngarkimi me pjesë, dhe humb shumë.
 *
 * ⚠️  Dështimi NUK e ndal aplikacionin. `data/collections.js` mbetet aty si
 *     fallback offline — pikërisht roli që i ishte premtuar në komentin e vet.
 */

/** Serveri i kufizon 100 rreshta për kërkesë; katalogu ka 244. */
const PAGE = 100;

/** Aq faqe sa mbulojnë katalogun edhe kur rritet — pa lak të pafund. */
const MAX_PAGES = 20;

/**
 * Përkthen një rresht të serverit në formën që njohin ekranet.
 *
 * Fushat e databazës janë `snake_case` dhe në sekonda; aplikacioni pret
 * `camelCase` dhe minuta. Përkthimi bëhet vetëm këtu.
 */
function toItem(row) {
  const categoryId = CATEGORY_BY_SLUG[row.category_slug] ?? null;

  return {
    id: row.id,
    title: row.title,
    /* Minuta, të rrumbullakosura lart: një meditim 90-sekondësh është "2 min",
       kurrë "1" — dhe kurrë 0, që do ta bënte të padukshëm te ndërtuesi. */
    dur: Math.max(1, Math.round(row.duration_sec / 60)),
    desc: row.description ?? `${row.title} — praktikë e udhëhequr nga Arte Gogo.`,
    /* Të 244-ta janë korp; vetëm mini-blloqet lokale kanë hapje e mbyllje. */
    phase: PHASES.CORE,
    intent: intentForCategory(categoryId),
    subTheme: row.subgroup ?? "Të tjera",
    /*
     * Serveri nuk ka nocionin e "koleksionit" — ai ndan sipas teknikës. Slug-u
     * i teknikës zë vendin e tij, që çelësat e panelit të admin-it
     * (`subKey(collectionId, subTheme)`) të mbeten të qëndrueshëm.
     */
    collectionId: row.technique_slug ?? "srv",
    techniqueId: TECHNIQUE_BY_SLUG[row.technique_slug] ?? null,
    categoryId,
    /*
     * Abonimi vendoset nga databaza, jo nga një listë te klienti. Prandaj
     * `domain/access.js` e nderon këtë fushë kur ekziston: rregulli i tre
     * meditimeve falas jeton te serveri, ku nuk anashkalohet dot.
     */
    premium: Boolean(row.is_premium),
    narrator: row.narrator ?? null,
    rating: Number(row.average_rating) || 0,
  };
}

/**
 * PROGRAMET
 *
 * Mbahen te një dyqan i thjeshtë modul-nivel dhe lexohen nga
 * `contentRepository.listPrograms()`. E njëjta arsye si te meditimet: ekranet
 * mbeten sinkrone.
 */
let serverPrograms = null;

export const programsFromServer = () => serverPrograms;

/**
 * `theme` te databaza → `intent` te aplikacioni.
 *
 * `intent` përcakton gradientin dhe pishinën e meditimeve nga të cilat
 * ndërtohen ndalesat e rrugëtimit (shih `domain/journey.js`). Pa hartim, çdo
 * program do të binte te e njëjta ngjyrë dhe të njëjtat ndalesa.
 */
const INTENT_BY_THEME = {
  zemra: "heart",
  arketipet: "transform",
  gjumi: "sleep",
  bolleku: "abundance",
};

function toProgram(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    /* Forma që pret UI-ja: "7 ditë · hapje e zemrës". */
    sub: [`${row.total_days} ditë`, row.subtitle].filter(Boolean).join(" · "),
    lessons: row.total_days,
    intent: INTENT_BY_THEME[row.theme] ?? "calm",
    color: row.cover_color ?? null,
    premium: Boolean(row.is_premium),
  };
}

/**
 * MINI-BLLOQET E NDËRTUESIT
 *
 * Rrinë te e njëjta tabelë `meditations` (me `is_block = 1`), sepse
 * `creation_steps` u referohet me çelës të huaj. Këtu marrin id-të e vërteta —
 * pa to, një seancë e ndërtuar me një hapje ose mbyllje nuk ruhet dot.
 */
function toBlock(row) {
  const categoryId = CATEGORY_BY_SLUG[row.category_slug] ?? null;
  return {
    id: row.id,
    title: row.title,
    intent: intentForCategory(categoryId),
    phase: PHASE_BY_DB[row.phase] ?? PHASES.CORE,
    dur: Math.max(1, Math.round(row.duration_sec / 60)),
    desc: row.description ?? "",
    premium: Boolean(row.is_premium),
  };
}

async function fetchBlocks() {
  const rows = await api.get("/content/blocks", { auth: false });
  return Array.isArray(rows) && rows.length > 0 ? rows.map(toBlock) : null;
}

async function fetchPrograms() {
  const rows = await api.get("/content/programs", { auth: false });
  return Array.isArray(rows) && rows.length > 0 ? rows.map(toProgram) : null;
}

/**
 * KOMUNITETI
 *
 * Feed-i lexohet nga serveri, ndaj një postim i botuar nga paneli shihet nga
 * TË GJITHË — jo vetëm nga shfletuesi që e shkroi.
 */
let serverFeed = null;

export const feedFromServer = () => serverFeed;

/** Enum-i i databazës → etiketa që lexon njeriu. */
const POST_LABEL = {
  frymezim: "Frymëzim",
  njoftim: "Njoftim",
  informacion: "Perceptim",
  meditim: "Meditim",
};

function toPost(row) {
  return {
    id: row.id,
    author: row.author_name,
    handle: row.author_role,
    /* Koha llogaritet në lexim, jo ruhet: një "Tani" i ruajtur do të mbetej
       "Tani" edhe pas një jave. */
    time: relativeTime(row.published_at),
    type: POST_LABEL[row.post_type] ?? "Frymëzim",
    verified: Boolean(row.is_verified),
    likes: Number(row.reaction_count) || 0,
    comments: Number(row.comment_count) || 0,
    text: row.text_content,
    /*
     * Meditimi i bashkangjitur.
     *
     * ⚠️  Titulli dhe kohëzgjatja vijnë NGA FEED-I, jo nga katalogu lokal.
     *     Serveri i kthen tashmë me `JOIN`, dhe kërkimi te katalogu do të
     *     dështonte për një meditim të papublikuar — postimi do të tregonte
     *     një bashkëngjitje bosh, pa asnjë shenjë pse.
     */
    meditationId: row.meditation_id ?? null,
    meditationTitle: row.meditation_title ?? null,
    meditationDuration: Number(row.duration_sec) || 0,
    /* Feed-i nuk kthen qëllimin e meditimit të bashkangjitur, ndaj karta
       ngjyroset njësoj për të gjitha — më mirë një ngjyrë e vetme sesa një
       kusht që pretendon të zgjedhë dhe kthen të njëjtën gjë. */
    intent: "heart",
    publishedAt: row.published_at,
  };
}

async function fetchFeed() {
  const rows = await api.get("/content/feed?limit=50", { auth: false });
  return Array.isArray(rows) ? rows.map(toPost) : null;
}

/** Rilexon vetëm feed-in — pas botimit ose fshirjes nga paneli. */
export async function refreshFeed() {
  const fresh = await fetchFeed().catch(() => null);
  if (fresh) serverFeed = fresh;
  return fresh;
}

/** Merr të gjitha faqet e meditimeve. */
async function fetchAllMeditations() {
  const items = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await api.get(
      `/content/meditations?limit=${PAGE}&offset=${page * PAGE}`,
      { auth: false }
    );
    const batch = data?.items ?? [];
    items.push(...batch);

    if (batch.length < PAGE) break;
    if (items.length >= (data?.total ?? 0)) break;
  }

  return items;
}

/**
 * Mbush katalogun nga serveri.
 *
 * @returns {Promise<{ ok: boolean, count: number, error?: string }>}
 *          Nuk hedh kurrë — thirrësi vendos ç'të bëjë, dhe nisja nuk bllokohet.
 */
export async function hydrateCatalog() {
  try {
    /*
     * Programet merren paralelisht, dhe dështimi i tyre NUK e prish katalogun:
     * pa meditime aplikacioni s'ka çfarë të tregojë, pa programe ka.
     */
    const [rows, programs, blocks, feed] = await Promise.all([
      fetchAllMeditations(),
      fetchPrograms().catch(() => null),
      fetchBlocks().catch(() => null),
      fetchFeed().catch(() => null),
    ]);
    serverPrograms = programs;
    serverFeed = feed;
    if (blocks) replaceBlocks(blocks);

    /*
     * Një përgjigje bosh nuk e zëvendëson fallback-un.
     *
     * ⚠️  Pa këtë kusht, një databazë e zbrazët — ose një gabim që kthen `[]` —
     *     do ta linte bibliotekën pa asgjë, dhe do të dukej si difekt i
     *     aplikacionit. Më mirë përmbajtja lokale sesa asnjë.
     */
    if (rows.length === 0) {
      return { ok: false, count: 0, error: "Serveri nuk ktheu asnjë meditim." };
    }

    const items = rows.map(toItem);

    /* Një etiketë që nuk njihet do ta fshihte meditimin nga të dyja pamjet —
       më mirë ta dimë sesa ta numërojmë gabim në heshtje. */
    const orphans = items.filter((m) => !m.techniqueId || !m.categoryId).length;
    if (orphans > 0) {
      console.warn(`[artegogo] ${orphans} meditime me etiketë të panjohur nga serveri.`);
    }

    replaceCatalog(items);
    return { ok: true, count: items.length };
  } catch (err) {
    return { ok: false, count: 0, error: err?.message ?? "Gabim i panjohur." };
  }
}
