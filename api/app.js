const express = require("express");
const cors = require("cors");

const { ping } = require("./src/db");
const authRoutes = require("./src/routes/auth");
const contentRoutes = require("./src/routes/content");
const meRoutes = require("./src/routes/me");
const audioRoutes = require("./src/routes/audio");
const subscriptionRoutes = require("./src/routes/subscription");
const notify = require("./src/routes/notifications");

/**
 * Ngarkim tolerant për veçoritë opsionale.
 *
 * ⚠️  Një `require` i drejtpërdrejtë e vret GJITHË serverin kur një skedar i
 *     vetëm mungon. Ndodhi vërtet: `app.js` u ngarkua para skedarëve të Web
 *     Push-it, dhe API-ja kthente 503 — pra hyrja, katalogu dhe abonimi
 *     pushuan për shkak të një veçorie që nuk ishte vendosur ende.
 *
 *     Kufiri është i ngushtë me qëllim: kapet VETËM `MODULE_NOT_FOUND` i vetë
 *     modulit të kërkuar. Një gabim sintakse brenda tij, ose një varësi që
 *     mungon, kalon më tej dhe rrëzon nisjen — sepse ai është defekt, jo
 *     vendosje e paplotë.
 */
function optional(path) {
  try {
    return require(path);
  } catch (err) {
    if (err?.code === "MODULE_NOT_FOUND" && String(err.message).includes(path)) {
      console.warn(`[artegogo] veçori e paongarkuar: ${path} — vazhdohet pa të.`);
      return null;
    }
    throw err;
  }
}

const pushRoutes = optional("./src/routes/push");
const community = optional("./src/routes/community");

/**
 * API-JA E ARTE GOGO-S
 *
 * Kufiri mes aplikacionit dhe MySQL-së. Faqja nuk lidhet dot drejtpërdrejt me
 * databazën — do të thoshte ta vendosje fjalëkalimin e saj në kodin që shkarkon
 * çdo vizitor.
 *
 * NISJA TE cPANEL:
 *   Setup Node.js App → Application startup file: `app.js`
 *   Passenger e ngarkon këtë skedar dhe e mban vetë portën; prandaj
 *   `app.listen()` thirret vetëm kur skedari ekzekutohet drejtpërdrejt.
 *
 * CommonJS, jo ES modules: Passenger-i i cPanel-it e mbështet pa konfigurim
 * shtesë, ndërsa `type: module` kërkon rregullime që ndryshojnë sipas hostit.
 */
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "256kb" }));

/*
 * CORS i kufizuar te origjina e aplikacionit.
 *
 * `*` do të lejonte çdo faqe në internet të thërriste këtë API me token-in e
 * përdoruesit. Vendose `APP_ORIGIN` te variablat e mjedisit, p.sh.
 * `https://artegogo.al`.
 */
app.use(
  cors({
    origin: process.env.APP_ORIGIN || false,
    credentials: false,
  })
);

const api = express.Router();

/**
 * Nxjerr kodin e gabimit të lidhjes.
 *
 * ⚠️  Kthehet VETËM kodi (`ER_ACCESS_DENIED_ERROR`, `ECONNREFUSED`, …), kurrë
 *     mesazhi i plotë: ai përmban emrin e përdoruesit, të databazës dhe të
 *     hostit, dhe `/health` është publik.
 *
 *     Kodi mjafton për të dalluar shkakun, dhe pikërisht ai humbiste: kur
 *     `mysql2` provon disa adresa (IPv6 dhe IPv4) dhe dështojnë të gjitha, jep
 *     një `AggregateError` me `.message` bosh. Përgjigjja dilte
 *     `{"ok":false,"error":""}` — pra kontrolli që duhet të tregonte problemin
 *     nuk tregonte asgjë.
 */
function reason(err) {
  if (err?.code) return err.code;
  const inner = err?.errors?.find((e) => e?.code);
  return inner?.code || err?.name || "UNKNOWN";
}

/**
 * Përshkrimi i konfigurimit — pa asnjë vlerë.
 *
 * ⚠️  Kthen VETËM emra dhe pohime: cila mënyrë lidhjeje është aktive, cilat
 *     variabla mungojnë, dhe cilat kanë hapësira në skaje. Asnjë vlerë, asnjë
 *     gjatësi — `/health` është publik.
 *
 *     `whitespace` ekziston sepse një fjalëkalim i ngjitur te fusha e cPanel-it
 *     merr shpesh një hapësirë ose rresht të ri pas vetes. MySQL-ja e refuzon
 *     njësoj si fjalëkalim krejt të gabuar, dhe në ekran duket identik me atë
 *     të saktin.
 */
const EXPECTED = [
  "DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD",
  "JWT_SECRET", "AUDIO_SECRET", "APP_ORIGIN", "AUDIO_BASE_URL",
];

function config() {
  const present = (k) => (process.env[k] ?? "") !== "";
  return {
    mode: process.env.DB_SOCKET ? "socket" : "tcp",
    missing: EXPECTED.filter((k) => !present(k)),
    whitespace: [...EXPECTED, "DB_SOCKET"]
      .filter(present)
      .filter((k) => process.env[k] !== process.env[k].trim()),
  };
}

api.get("/health", async (_req, res) => {
  try {
    res.json({ ok: await ping(), time: new Date().toISOString(), ...config() });
  } catch (err) {
    console.error("[artegogo] health", err);
    res.status(503).json({ ok: false, error: reason(err), ...config() });
  }
});

api.use("/auth", authRoutes);
api.use("/content", contentRoutes);
/* Para `/me`, që `/me/subscription` të mos kapet nga rrugët e tij. */
api.use("/me/subscription", subscriptionRoutes);
api.use("/me", notify.meRoutes);
if (pushRoutes) api.use("/me", pushRoutes.meRoutes);
api.use("/me", meRoutes);
api.use("/admin", notify.adminRoutes);
if (community) api.use("/admin", community.adminRoutes);
api.use(notify.publicRoutes);
if (pushRoutes) api.use(pushRoutes.publicRoutes);
api.use("/audio", audioRoutes);

/*
 * I njëjti router montohet dy herë — me dhe pa prefiksin `/api`.
 *
 * ⚠️  Passenger-i i cPanel-it NUK e heq gjithmonë bazën e URL-së para se t'ia
 *     kalojë kërkesën aplikacionit. Te ky server nuk e heq: një kërkesë për
 *     `app.drartegogo.com/api/health` arrin te Express si `/api/health`, jo si
 *     `/health` — dhe asnjë rrugë nuk përputhet.
 *
 *     Sjellja ndryshon sipas hostit dhe versionit, ndaj në vend që të varet nga
 *     njëra, montohen të dyja. Rruga e parë që përputhet e trajton kërkesën;
 *     kur baza hiqet, punon `app.use(api)`, kur jo, punon `app.use("/api", api)`.
 */
app.use(api);
app.use("/api", api);

app.use((_req, res) => res.status(404).json({ error: "Rruga nuk ekziston." }));

/**
 * Trajtuesi i gabimeve.
 *
 * ⚠️  Detajet e brendshme nuk dalin te klienti: mesazhet e MySQL-së përmbajnë
 *     emra tabelash dhe kolonash, dhe ato i japin sulmuesit hartën e databazës.
 *     Gabimi i plotë shkon te log-u i serverit, ku e sheh vetëm admini.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[artegogo]", err);

  if (err?.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Ky rekord ekziston tashmë." });
  }
  if (err?.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ error: "Referencë e pavlefshme." });
  }
  res.status(500).json({ error: "Gabim i brendshëm." });
});

/* Ekzekutim i drejtpërdrejtë (`npm start`, ose lokalisht). Nën Passenger,
   `require.main` nuk është ky skedar dhe porta menaxhohet nga hosti. */
if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Arte Gogo API — http://localhost:${port}`));
}

module.exports = app;
