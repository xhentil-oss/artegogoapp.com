import { api } from "./api.js";
import { hydrateCatalog } from "./catalog.js";
import { listMeditations, listSubGroups } from "./contentRepository.js";
import { isDatabaseId } from "../lib/ids.js";
import { subKey } from "../data/classification.js";
import { TECHNIQUE_SLUG_BY_ID, CATEGORY_SLUG_BY_ID } from "./taxonomy.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  PANELI I ADMIN-IT → DATABAZA
 * ═══════════════════════════════════════════════════════════════
 *
 * Deri tani paneli shkruante vetëm te `localStorage`: ndryshimet i shihte një
 * shfletues i vetëm, humbeshin me pastrimin e të dhënave, dhe telefoni i
 * klientes nuk merrte vesh asgjë. Këtu ato shkojnë te databaza.
 *
 * ⚠️  PAS SHKRIMIT, KATALOGU RILEXOHET.
 *
 *     Përndryshe do të ekzistonin dy të vërteta: ajo e databazës dhe një
 *     mbivendosje lokale mbi të. Sapo të devijonin, folderi do të tregonte
 *     "9 meditime" dhe brenda do të kishte 8 — pa asnjë mënyrë për të kuptuar
 *     cila anë kishte të drejtë.
 */

/**
 * Meditimet e një nën-grupi, si id të databazës.
 *
 * Çelësi është `teknikë/nën-grup`. Filtrohen id-të lokale (`b1`, `c1001`): kur
 * katalogu lexohet nga fallback-u offline, ato nuk ekzistojnë te serveri dhe
 * shkrimi do të dështonte i tëri për shkak të një prej tyre.
 */
function idsForGroup(groupKey) {
  return listMeditations()
    .filter((m) => subKey(m.collectionId, m.subTheme) === groupKey)
    .map((m) => m.id)
    .filter(isDatabaseId);
}

/**
 * Ruan klasifikimin e një nën-grupi te databaza.
 *
 * @param {string} groupKey
 * @param {{techniqueId?: string, categoryId?: string}} patch
 * @returns {Promise<{ok:boolean, updated?:number, error?:string}>}
 */
export async function saveClassification(groupKey, patch) {
  const meditationIds = idsForGroup(groupKey);
  if (meditationIds.length === 0) {
    return { ok: false, error: "Ky grup nuk ka meditime te databaza." };
  }

  const body = { meditationIds };
  if (patch.techniqueId) {
    const slug = TECHNIQUE_SLUG_BY_ID[patch.techniqueId];
    if (!slug) return { ok: false, error: "Teknikë e panjohur." };
    body.techniqueSlug = slug;
  }
  if (patch.categoryId) {
    const slug = CATEGORY_SLUG_BY_ID[patch.categoryId];
    if (!slug) return { ok: false, error: "Kategori e panjohur." };
    body.categorySlug = slug;
  }

  try {
    const result = await api.put("/admin/meditations/classification", body);
    /* Rileximi është pjesë e veprimit, jo shtojcë — shih shënimin lart. */
    await hydrateCatalog();
    return { ok: true, updated: result?.updated ?? meditationIds.length };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Ruajtja dështoi." };
  }
}

/**
 * Zëvendëson përmbajtjen e një pool-i njoftimesh.
 *
 * @param {"morning"|"noon"|"evening"} slot
 * @param {string[]} groupKeys nën-grupet e zgjedhura
 */
export async function savePool(slot, groupKeys) {
  const meditationIds = [...new Set(groupKeys.flatMap(idsForGroup))];

  try {
    const result = await api.put(`/admin/pools/${slot}`, { meditationIds });
    return { ok: true, count: result?.count ?? meditationIds.length };
  } catch (err) {
    return { ok: false, error: err?.message ?? "Ruajtja dështoi." };
  }
}

/** Përmbajtja e pool-eve sipas databazës — jo sipas pajisjes. */
export async function fetchPools() {
  try {
    return await api.get("/content/pools", { auth: false });
  } catch {
    return null;
  }
}

/**
 * Nën-grupet që përmbajnë të paktën një meditim të databazës.
 *
 * Paneli i tregon të gjitha; kjo listë thotë cilat mund të ruhen vërtet. Pa
 * këtë dallim, klientja do të redaktonte grupe që dështojnë në heshtje.
 */
export const savableGroups = () =>
  new Set(listSubGroups().map((g) => g.key).filter((key) => idsForGroup(key).length > 0));
