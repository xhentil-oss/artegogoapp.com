/**
 * NDËRTON `mysql/08_pools.sql` NGA `src/data/slotPools.js`.
 *
 * Pool-et e prototipit janë shkruar si "koleksion/nën-grup" (`col_med/Energjia`),
 * ndërsa databaza i njeh meditimet me teknikë dhe `subgroup`. Ura mes tyre
 * është e njëjta hartë që përdor importi i katalogut — prandaj rrjedh nga
 * `build-meditations-sql.mjs` dhe jo nga një kopje e dytë që do të devijonte.
 *
 * Rregji: `node scripts/build-pools-sql.mjs`
 */
import { readFileSync, writeFileSync } from "node:fs";
import { SLOT_POOLS } from "../src/data/slotPools.js";
import { COLLECTIONS } from "../src/data/collections.js";

/*
 * Harta koleksion→teknikë lexohet nga vetë gjeneruesi i katalogut.
 *
 * ⚠️  Kopjimi i saj këtu do të thoshte dy të vërteta: sapo njëra ndryshonte,
 *     pool-et do të tregonin te meditime që s'ekzistojnë më nën atë teknikë,
 *     dhe njoftimi i mëngjesit do të dilte bosh pa asnjë shenjë.
 */
const source = readFileSync(new URL("./build-meditations-sql.mjs", import.meta.url), "utf8");
const block = source.slice(source.indexOf("const TECHNIQUE = {"), source.indexOf("/* ─── Kategoria"));
const TECHNIQUE = new Function(`${block}; return TECHNIQUE;`)();

const techniqueFor = (collectionId, group) =>
  TECHNIQUE[`${collectionId}/${group}`] ?? TECHNIQUE[collectionId];

/** Nën-grupet që ekzistojnë vërtet te katalogu — mbrojtje nga çelësa të vjetruar. */
const known = new Set(
  COLLECTIONS.flatMap((c) => c.groups.map((g) => `${c.id}/${g.name}`))
);

const esc = (v) => `'${String(v).replace(/'/g, "''")}'`;
const rows = [];
const missing = [];

for (const [slot, keys] of Object.entries(SLOT_POOLS)) {
  for (const key of keys) {
    if (!known.has(key)) {
      missing.push(key);
      continue;
    }
    const [collectionId, group] = key.split("/");
    const technique = techniqueFor(collectionId, group);
    if (!technique) {
      missing.push(key);
      continue;
    }
    rows.push({ slot, technique, group });
  }
}

if (missing.length > 0) {
  throw new Error(`Çelësa pool-i që nuk gjenden te katalogu: ${missing.join(", ")}`);
}

const values = rows
  .map((r) => `  (${esc(r.slot)}, ${esc(r.technique)}, ${esc(r.group)})`)
  .join(",\n");

const sql = `-- ═══════════════════════════════════════════════════════════════
--  POOL-ET E NJOFTIMEVE — mëngjes / drekë / darkë (seksioni 9)
--  Prodhuar nga: scripts/build-pools-sql.mjs — mos e redakto me dorë.
--
--  Anëtarësia ruhet PËR MEDITIM, jo për nën-grup: klientja duhet të mund të
--  heqë një meditim të vetëm nga pool-i i mëngjesit pa hequr gjithë grupin.
--  Nën-grupet këtu janë vetëm mënyra e mbushjes fillestare.
--
--  ⚠️  Përzgjedhja e përditshme NUK bëhet këtu dhe as te aplikacioni — bëhet
--      te serveri (\`/me/reminders/today\`), sepse njoftimi duhet të dërgohet
--      edhe kur aplikacioni është i mbyllur.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS notification_pools (
  slot          ENUM('morning','noon','evening') NOT NULL,
  meditation_id CHAR(36) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slot, meditation_id),
  KEY idx_pool_meditation (meditation_id),
  CONSTRAINT fk_pool_meditation FOREIGN KEY (meditation_id)
    REFERENCES meditations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TEMPORARY TABLE IF EXISTS tmp_pool_groups;
CREATE TEMPORARY TABLE tmp_pool_groups (
  slot           ENUM('morning','noon','evening') NOT NULL,
  technique_slug VARCHAR(80)  NOT NULL,
  subgroup       VARCHAR(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_pool_groups (slot, technique_slug, subgroup) VALUES
${values};

-- Mbushja fillestare. \`INSERT IGNORE\` që ri-ekzekutimi të mos dyfishojë, dhe
-- që zgjedhjet e mëvonshme të klientes të mos fshihen nga një rregji e re.
INSERT IGNORE INTO notification_pools (slot, meditation_id)
SELECT g.slot, m.id
  FROM tmp_pool_groups g
  JOIN techniques t  ON t.slug = g.technique_slug
  JOIN meditations m ON m.technique_id = t.id
                    AND m.subgroup = g.subgroup
                    AND m.is_block = 0
                    AND m.published_at IS NOT NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_pool_groups;

-- Kontroll: të tre pool-et duhet të kenë përmbajtje.
SELECT slot, COUNT(*) AS meditime FROM notification_pools GROUP BY slot;
`;

writeFileSync("mysql/08_pools.sql", sql, "utf8");

console.log(`${rows.length} nën-grupe në tre pool-e`);
for (const slot of Object.keys(SLOT_POOLS)) {
  const list = rows.filter((r) => r.slot === slot);
  console.log(`  ${slot.padEnd(8)} ${list.length} grupe`);
}
