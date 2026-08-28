const mysql = require("mysql2/promise");

/**
 * LIDHJA ME MYSQL
 *
 * Pool, jo lidhje e vetme: cPanel-i i kufizon lidhjet e njëkohshme, dhe një
 * lidhje e vetme e ndarë do të bllokohej sapo dy kërkesa të vinin bashkë.
 *
 * ⚠️  Kredencialet vijnë VETËM nga variablat e mjedisit, të vendosura te
 *     cPanel → Setup Node.js App → Environment variables. Kurrë në kod:
 *     çdo gjë brenda `api/` mund të përfundojë në git, dhe një fjalëkalim
 *     databaze i futur në histori mbetet aty përgjithmonë.
 */
/*
 * Lidhja: prizë Unix ose TCP.
 *
 * ⚠️  Disa serverë cPanel/CloudLinux nuk e ekspozojnë fare MySQL-në mbi TCP te
 *     llogaria — vetëm përmes një prize (socket). Aty çdo host jep
 *     `ECONNREFUSED`, sado i saktë të jetë fjalëkalimi.
 *
 *     Nëse `DB_SOCKET` është vendosur, përdoret ajo dhe `host` shpërfillet.
 *     Rruga e zakonshme është `/var/lib/mysql/mysql.sock`.
 *
 *     Preferohet `127.0.0.1` ndaj `localhost`: i dyti mund të përkthehet së
 *     pari në `::1` (IPv6), ku MySQL-ja shpesh nuk dëgjon.
 */
const socketPath = process.env.DB_SOCKET || undefined;

const pool = mysql.createPool({
  ...(socketPath ? { socketPath } : { host: process.env.DB_HOST || "127.0.0.1" }),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL || 5),
  queueLimit: 0,
  /* Shqip me ë dhe ç — pa këtë, hosting-u me `latin1` i prish në heshtje. */
  charset: "utf8mb4",
  timezone: "Z",
  /* Datat kthehen si varg, jo si `Date`: `DATETIME` te MySQL nuk mban zonë
     kohore, dhe konvertimi automatik do t'i zhvendoste sipas orës së serverit. */
  dateStrings: true,
});

/**
 * Ekzekuton një query me parametra.
 *
 * `pool.execute` përdor prepared statements — vlerat nuk ngjiten kurrë te
 * teksti i SQL-së. Ky është i vetmi funksion që lejohet të prekë databazën,
 * pikërisht që asnjë rrugë të mos ndërtojë SQL me bashkim vargjesh.
 */
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/** Rreshti i parë ose null. */
async function one(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

/** Kontroll lidhjeje — përdoret nga `/health`. */
async function ping() {
  const row = await one("SELECT 1 AS ok");
  return row?.ok === 1;
}

module.exports = { pool, query, one, ping };
