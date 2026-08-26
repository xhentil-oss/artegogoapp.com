import { execSync } from "node:child_process";

/**
 * LIRON PORTËN E SERVERIT TË ZHVILLIMIT
 *
 * `vite.config.js` mban `strictPort: true` me qëllim: pa të, Vite kalon në
 * heshtje te 5174 kur 5173 është e zënë, dhe ti mbetesh duke shikuar një tab
 * të shërbyer nga një server i vjetër që nuk ndjek më skedarët.
 *
 * Pasoja është se një server i harruar — shpesh në një terminal të VS Code-it
 * të hapur ditë më parë — bllokon nisjen e një të riu. Ky skript e gjen dhe e
 * mbyll, pa u dashur të kërkosh dritaren.
 *
 * Përdorimi:
 *   node scripts/free-port.mjs 5173           mbyll çfarë e mban portën
 *   node scripts/free-port.mjs 5173 --check   vetëm trego, pa mbyllur
 */

const port = Number(process.argv[2] ?? 5173);
const checkOnly = process.argv.includes("--check");

/** PID-et që dëgjojnë në këtë portë. */
function listeners() {
  try {
    /*
     * PA `-p TCP`.
     *
     * Ai flamur i kufizon rezultatet vetëm te IPv4, ndërsa Vite lidhet te
     * `[::1]:5173` — pra porta dukej e lirë ndërsa serveri punonte. Pa flamur,
     * `netstat -ano` i nxjerr të dyja familjet; rreshtat IPv6 kanë të njëjtin
     * protokoll "TCP", vetëm adresën në kllapa.
     */
    const out = execSync("netstat -ano", { encoding: "utf8" });
    const pids = new Set();

    for (const line of out.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 5 || parts[0] !== "TCP" || parts[3] !== "LISTENING") continue;
      /* Adresa mbaron me ":<porta>" — ":51730" nuk duhet të përputhet. */
      if (!parts[1].endsWith(`:${port}`)) continue;
      const pid = Number(parts[4]);
      if (Number.isInteger(pid) && pid > 0) pids.add(pid);
    }
    return [...pids];
  } catch {
    return [];
  }
}

const found = listeners();

if (found.length === 0) {
  console.log(`✓ Porta ${port} është e lirë.`);
  process.exit(0);
}

/** Emri i procesit, sa për ta njohur para se ta mbyllim. */
const nameOf = (pid) => {
  try {
    const out = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: "utf8" });
    return out.split(",")[0]?.replaceAll('"', "").trim() || "i panjohur";
  } catch {
    return "i panjohur";
  }
};

console.log(`Porta ${port} mbahet nga: ${found.map((p) => `${nameOf(p)} (PID ${p})`).join(", ")}`);

if (checkOnly) {
  console.log("Për ta liruar:  npm run dev:force");
  process.exit(1);
}

for (const pid of found) {
  try {
    /* `/T` mbyll edhe fëmijët: `npm run dev` nis cmd, që nis vite. */
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
    console.log(`✓ U mbyll PID ${pid}`);
  } catch {
    console.log(`✗ PID ${pid} nuk u mbyll — mbylle me dorë ose nis terminalin si Administrator.`);
  }
}

if (listeners().length > 0) {
  console.log(`✗ Porta ${port} është ende e zënë.`);
  process.exit(1);
}

console.log(`✓ Porta ${port} u lirua.`);
