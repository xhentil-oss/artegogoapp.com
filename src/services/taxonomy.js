import { TECHNIQUES } from "../data/techniques.js";
import { CATEGORIES } from "../data/categories.js";

/**
 * URA MES SLUG-VE TË SERVERIT DHE ID-VE TË APLIKACIONIT.
 *
 * Databaza i identifikon teknikat dhe kategoritë me `slug` (`meditime-per-
 * trupin`), ndërsa aplikacioni me id të shkurtra (`t_body`). Të dyja listat
 * ndjekin të njëjtin rend të specifikimit, por hartimi shkruhet **shprehimisht**
 * dhe jo sipas pozicionit: një kategori e shtuar në mes te njëra anë do t'i
 * zhvendoste në heshtje të gjitha të tjerat, dhe meditimet do të shfaqeshin nën
 * etiketa të gabuara pa asnjë gabim të dukshëm.
 */

export const TECHNIQUE_BY_SLUG = {
  "meditime-per-trupin": "t_body",
  "meditime-per-zemren": "t_heart",
  "meditime-per-trurin": "t_brain",
  "meditim-ne-ecje": "t_walk",
  "meditime-manifestimi": "t_manifest",
  "meditime-riprogramimi": "t_reprog",
  "rigjenerim-dhe-sherim": "t_heal",
  frymemarrje: "t_breath",
  "eft-tapping": "t_eft",
  "teknika-somatike": "t_somatic",
  "teknika-energjetike": "t_energy",
  hipnoterapi: "t_hypno",
  vizualizim: "t_visual",
  afirmime: "t_affirm",
};

export const CATEGORY_BY_SLUG = {
  emocionet: "c_emocionet",
  "zemra-plot": "c_zemra",
  vetebesim: "c_vetebesim",
  "tru-i-fuqizuar": "c_tru",
  gjumi: "c_gjumi",
  "energji-e-larte": "c_energji",
  manifestim: "c_manifestim",
  stres: "c_stres",
  "ankth-panik": "c_ankth",
  marredheniet: "c_marredhenie",
  varesite: "c_varesi",
  fokus: "c_fokus",
  shendeti: "c_shendeti",
  qetesim: "c_qetesim",
  "vetja-e-ardhme": "c_vetja",
  "shero-te-kaluaren": "c_kaluara",
  "jeta-ideale": "c_jeta",
  falja: "c_falja",
  "dashuria-vetes": "c_dashuria",
  intuita: "c_intuita",
  bolleku: "c_bolleku",
  situata: "c_situata",
  emergjence: "c_emergjence",
  "femijet-0-7": "c_femije_0_7",
  "femijet-8-12": "c_femije_8_12",
  adoleshentet: "c_adoleshentet",
  mengjes: "c_mengjes",
  mbremje: "c_mbremje",
};

/**
 * Kontroll i plotësisë, i kryer një herë kur ngarkohet moduli.
 *
 * ⚠️  Një id lokale që nuk përmendet në hartë do të thoshte se ajo teknikë ose
 *     kategori nuk do të mbushej kurrë nga serveri — folderi do të dukej bosh,
 *     pa asnjë gabim. Këtu dështon me zë, dhe në zhvillim shihet menjëherë.
 */
function verify(label, map, list) {
  const mapped = new Set(Object.values(map));
  const missing = list.map((x) => x.id).filter((id) => !mapped.has(id));
  if (missing.length > 0) {
    throw new Error(`Harta e ${label} nuk mbulon: ${missing.join(", ")}`);
  }
}

verify("teknikave", TECHNIQUE_BY_SLUG, TECHNIQUES);
verify("kategorive", CATEGORY_BY_SLUG, CATEGORIES);

/** `intent` përcakton vetëm gradientin; merret nga kategoria e meditimit. */
const INTENT_BY_CATEGORY_ID = new Map(CATEGORIES.map((c) => [c.id, c.intent]));

export const intentForCategory = (categoryId) =>
  INTENT_BY_CATEGORY_ID.get(categoryId) ?? "calm";
