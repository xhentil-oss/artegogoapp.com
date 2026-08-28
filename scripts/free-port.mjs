import { execSync } from "node:child_process";

/**
 * LIRON PORTËN E SERVERIT TË ZHVILLIMIT
 *
 * Problemi që zgjidh: një `npm run dev` i harruar — zakonisht në një terminal
 * të VS Code-it të hapur ditë më parë — e mban portën, dhe nisja e re dështon
 * me "Port 5173 is already in use". Dritarja nuk gjendet dot lehtë, sepse
 * terminalet e integruara nuk shfaqen si dritare më vete.
 *
 * ⚠️  MBYLL VETËM SERVERIN E KËTIJ PROJEKTI.
 *     Nëse portën e mban diçka tjetër — një projekt i dytë, një shërbim i
 *     sistemit — skripti e raporton dhe NDALON. Mbyllja e verbër e asaj që
 *     gjendet te një portë është mënyra më e shpejtë për të vrarë punën e
 *     dikujt tjetër.
 *
 * Përdorimi:
 *   node scripts/free-port.mjs 5173           mbyll serverin e këtij projekti
 *   node scripts/free-port.mjs 5173 --check   vetëm trego, pa mbyllur
 */

const port = Number(process.argv[2] ?? 5173);
const checkOnly = process.argv.includes("--check");

/** Rrënja e projektit — çdo shteg brenda saj njihet si i yni. */
const projectRoot = process.cwd().toLowerCase();

/** PID-et që dëgjojnë në këtë portë. */
function listeners() {
  try {
    /*
     * PA `-p TCP`.
     *
     * Ai flamur i kufizon rezultatet vetëm te IPv4, ndërsa Vite lidhet te
     * `[::1]:5173` — pra porta dukej e lirë ndërsa serveri punonte. Pa flamur,
     * `netstat -ano` i nxjerr të dyja familjet e adresave.
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

/** Rreshti i plotë i komandës — nga aty njihet projekti. */
function commandLine(pid) {
  try {
    return execSync(
      `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}').CommandLine"`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
  } catch {
    return "";
  }
}

const found = listeners();

if (found.length === 0) {
  console.log(`✓ Porta ${port} është e lirë.`);
  process.exit(0);
}

const holders = found.map((pid) => {
  const cmd = commandLine(pid);
  return {
    pid,
    cmd,
    /* I yni nëse është vite dhe nis nga kjo dosje. */
    mine: cmd.toLowerCase().includes("vite") && cmd.toLowerCase().includes(projectRoot),
  };
});

for (const h of holders) {
  const who = h.mine ? "serveri i këtij projekti" : "proces TJETËR";
  console.log(`Porta ${port} → PID ${h.pid} · ${who}`);
  if (!h.mine && h.cmd) console.log(`   ${h.cmd.slice(0, 100)}`);
}

const foreign = holders.filter((h) => !h.mine);
if (foreign.length > 0) {
  console.log(`\n✗ Nuk e liroj: portën e mban diçka jashtë këtij projekti.`);
  console.log(`  Mbylle vetë, ose ndrysho portën te vite.config.js.`);
  process.exit(1);
}

if (checkOnly) {
  console.log("\nPër ta liruar:  npm run dev");
  process.exit(1);
}

for (const h of holders) {
  try {
    /* `/T` mbyll edhe fëmijët: `npm run dev` nis cmd, që nis vite. */
    execSync(`taskkill /PID ${h.pid} /T /F`, { stdio: "ignore" });
    console.log(`✓ U mbyll serveri i vjetër (PID ${h.pid})`);
  } catch {
    console.log(`✗ PID ${h.pid} nuk u mbyll — provo terminalin si Administrator.`);
  }
}

if (listeners().length > 0) {
  console.log(`✗ Porta ${port} është ende e zënë.`);
  process.exit(1);
}
