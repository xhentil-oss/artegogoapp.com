/**
 * NDËRTON `mysql/04_meditations.sql` NGA KATALOGU I APLIKACIONIT.
 *
 * Katalogu (`src/data/collections.js`) ndahet në 15 koleksione → 43 nën-grupe.
 * Databaza ka taksonomi tjetër: 14 teknika ("SI") × 28 kategori ("PËR ÇFARË").
 * Ky skedar është ura mes tyre, dhe ajo urë është vendim redaksional — prandaj
 * qëndron këtu, e dukshme dhe e ndryshueshme, jo e fshehur brenda një query-je.
 *
 * Rregji: `node scripts/build-meditations-sql.mjs`
 */
import { writeFileSync } from "node:fs";
import { COLLECTIONS } from "../src/data/collections.js";

/* ─── Teknika: sipas koleksionit, ose sipas nën-grupit kur koleksioni ndahet ─── */
const TECHNIQUE = {
  "col_med/Emocione": "meditime-riprogramimi",
  "col_med/Zemra": "meditime-per-zemren",
  "col_med/Vetëbesimi": "meditime-riprogramimi",
  "col_med/Truri": "meditime-per-trurin",
  "col_med/Gjumi": "meditime-per-trupin",
  "col_med/Energjia": "meditime-per-trupin",
  "col_med/Manifestimi": "meditime-manifestimi",
  /* Ecja është teknikë më vete te specifikimi; këtu janë praktikat në lëvizje. */
  "col_somatic/Tokëzim & Lëvizje": "meditim-ne-ecje",
  col_eft: "eft-tapping",
  col_breath: "frymemarrje",
  col_somatic: "teknika-somatike",
  col_energy: "teknika-energjetike",
  col_visual: "vizualizim",
  col_affirm: "afirmime",
  col_hypno: "hipnoterapi",
  col_health: "rigjenerim-dhe-sherim",
  col_challenge: "meditime-riprogramimi",
  col_rel: "meditime-per-zemren",
  col_biz: "meditime-per-trurin",
  col_moment: "meditime-per-trupin",
  /* Kriza akute trajtohet me frymëmarrje — kjo është teknika, jo qëllimi. */
  col_emergency: "frymemarrje",
  col_kids: "meditime-per-trupin",
};

/* ─── Kategoria: parazgjedhje sipas `intent`, e mbivendosur nga nën-grupi ─── */
const BY_INTENT = {
  stress: "stres",
  heart: "zemra-plot",
  energy: "energji-e-larte",
  focus: "fokus",
  sleep: "gjumi",
  abundance: "bolleku",
  heal: "shendeti",
  calm: "qetesim",
  transform: "shero-te-kaluaren",
  selflove: "dashuria-vetes",
};

const BY_GROUP = {
  "col_med/Emocione": "emocionet",
  "col_med/Vetëbesimi": "vetebesim",
  "col_med/Truri": "tru-i-fuqizuar",
  "col_med/Manifestimi": "manifestim",
  "col_eft/Ankthi": "ankth-panik",
  "col_eft/Marrëdhënie": "marredheniet",
  "col_eft/Varësi": "varesite",
  "col_eft/Biznes": "fokus",
  "col_breath/Manifestim": "manifestim",
  "col_visual/Vetja": "vetja-e-ardhme",
  "col_visual/Jeta ideale": "jeta-ideale",
  "col_emergency/Krizë akute": "emergjence",
  "col_rel/Lidhjet": "marredheniet",
  "col_rel/Brenda vetes": "dashuria-vetes",
  "col_kids/Për fëmijë": "femijet-8-12",
  "col_kids/Familje": "marredheniet",
  "col_breath/Qetësim": "stres",
  "col_moment/Mëngjes": "mengjes",
  /* "Për situata të veçanta" — pikërisht kjo është ajo që mbulon ky koleksion. */
  "col_moment/Në makinë": "situata",
  "col_moment/Në punë": "situata",
  "col_moment/Në shtëpi": "mbremje",
  "col_affirm/Zhvillim personal": "dashuria-vetes",
  "col_affirm/Role": "energji-e-larte",
  "col_biz/Mendësia": "fokus",
  "col_biz/Aftësi": "fokus",
  "col_challenge/Sfidat": "varesite",
  "col_energy/Aura & Mbrojtje": "qetesim",
};

/* Disa tituj e emërtojnë vetë kategorinë më saktë se nën-grupi i tyre. */
const BY_TITLE = [
  [/^Fal |^Falja$|^Falje$/i, "falja"],
  [/Intuit/i, "intuita"],
  [/veten e ardhshme|Versioni më i mirë/i, "vetja-e-ardhme"],
  [/^Adoleshent/i, "adoleshentet"],
];

/*
 * ⚠️  ASNJË MEDITIM FALAS (vendim i klientes, 3 shtator 2026).
 *
 *     Më parë tre meditime hynin me `is_premium = 0`. Modeli ndryshoi: i
 *     gjithë katalogu është i kyçur, dhe e vetmja rrugë është prova 3-ditore.
 *     Lista u hoq — mbajtja e saj bosh do të linte dyshim se rregulli vlen.
 */
const FREE = new Set();

const SLUG_MAP = { "ë": "e", "Ë": "E", "ç": "c", "Ç": "C" };
const slug = (s) =>
  s
    .replace(/[ëËçÇ]/g, (c) => SLUG_MAP[c])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const esc = (v) =>
  v === null || v === undefined
    ? "NULL"
    : "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";

const rows = [];
const seen = new Set();

for (const collection of COLLECTIONS) {
  for (const group of collection.groups) {
    const key = collection.id + "/" + group.name;
    const technique = TECHNIQUE[key] ?? TECHNIQUE[collection.id];
    if (!technique) throw new Error("Pa teknikë: " + key);

    for (const item of group.items) {
      const byTitle = BY_TITLE.find(([re]) => re.test(item.title))?.[1];
      const category = byTitle ?? BY_GROUP[key] ?? BY_INTENT[item.intent];
      if (!category) throw new Error("Pa kategori: " + key + "/" + item.title);

      /* Rruga e audios është e parashikueshme: kur skedarët të ngarkohen me
         këtë strukturë, asgjë te databaza nuk ndryshon. */
      const base = "meditime/" + technique + "/" + slug(item.title);
      let path = base + ".mp3";
      /* Të njëjtët tituj përsëriten mes grupeve (p.sh. "Manifesto bollëk"); pa
         këtë, dy meditime do të tregonin te i njëjti skedar. */
      let n = 1;
      while (seen.has(path)) path = base + "-" + ++n + ".mp3";
      seen.add(path);

      rows.push({
        title: item.title,
        subgroup: group.name,
        technique,
        category,
        duration_sec: item.dur * 60,
        audio_url: path,
        description: item.desc,
        is_premium: FREE.has(key + "/" + item.title) ? 0 : 1,
      });
    }
  }
}

const values = rows
  .map(
    (r) =>
      "  (" +
      [esc(r.title), esc(r.subgroup), esc(r.technique), esc(r.category)].join(", ") +
      ", " + r.duration_sec + ", " + esc(r.audio_url) + ", " + esc(r.description) +
      ", " + r.is_premium + ")"
  )
  .join(",\n");

const free = rows.filter((r) => !r.is_premium).length;

const sql = `-- ═══════════════════════════════════════════════════════════════
--  MEDITIMET — ${rows.length} rreshta, të gjeneruara nga katalogu
--  Prodhuar nga: scripts/build-meditations-sql.mjs — mos e redakto me dorë.
--
--  ⚠️  Hyjnë si TË PUBLIKUARA, me një rrugë audio të planifikuar. Skedarët
--      nuk ekzistojnë ende, ndaj luajtja dështon derisa të ngarkohen te
--      meditime/<teknika>/<titulli>.mp3. Metadata, drynat dhe rrugëtimi
--      punojnë që tani.
--
--      Për t'i fshehur derisa audio të jetë gati:
--        UPDATE meditations SET published_at = NULL;
--
--  Falas janë ${free}: një për ankthin, një për zemrën, një për trurin.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

-- Tabela e përkohshme mban slug-un e teknikës dhe të kategorisë; id-të e vërteta
-- gjenden me JOIN, sepse janë UUID të krijuara gjatë importit të skemës.
DROP TEMPORARY TABLE IF EXISTS tmp_meditations;
CREATE TEMPORARY TABLE tmp_meditations (
  title          VARCHAR(200) NOT NULL,
  subgroup       VARCHAR(120) NOT NULL,
  technique_slug VARCHAR(80)  NOT NULL,
  category_slug  VARCHAR(80)  NOT NULL,
  duration_sec   INT          NOT NULL,
  audio_url      VARCHAR(255) NOT NULL,
  description    TEXT         NULL,
  is_premium     TINYINT(1)   NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_meditations
  (title, subgroup, technique_slug, category_slug, duration_sec, audio_url, description, is_premium)
VALUES
${values};

INSERT INTO meditations
  (title, subgroup, technique_id, category_id, duration_sec,
   audio_url, description, is_premium, narrator, published_at)
SELECT t.title, t.subgroup, tec.id, cat.id, t.duration_sec,
       t.audio_url, t.description, t.is_premium, 'Arte Gogo', NOW()
  FROM tmp_meditations t
  JOIN techniques tec ON tec.slug = t.technique_slug
  JOIN categories cat ON cat.slug = t.category_slug;

DROP TEMPORARY TABLE IF EXISTS tmp_meditations;

-- Kontroll: duhet të kthejë ${rows.length} dhe ${free}.
SELECT COUNT(*) AS meditime, SUM(is_premium = 0) AS falas FROM meditations;
`;

writeFileSync("mysql/04_meditations.sql", sql, "utf8");

/* ─── Përmbledhja, për shqyrtim ─── */
const tally = (k) => rows.reduce((m, r) => m.set(r[k], (m.get(r[k]) ?? 0) + 1), new Map());
console.log(rows.length + " meditime · " + free + " falas\n");
console.log("TEKNIKA");
for (const [k, v] of [...tally("technique")].sort((a, b) => b[1] - a[1])) {
  console.log(String(v).padStart(6) + "  " + k);
}
console.log("\nKATEGORI");
for (const [k, v] of [...tally("category")].sort((a, b) => b[1] - a[1])) {
  console.log(String(v).padStart(6) + "  " + k);
}
