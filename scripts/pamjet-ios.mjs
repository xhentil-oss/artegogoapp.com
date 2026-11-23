/**
 * ═══════════════════════════════════════════════════════════════
 *  PAMJET E EKRANIT PËR APP STORE — 1179 × 2556 px
 * ═══════════════════════════════════════════════════════════════
 *
 * Apple i pranon pamjet vetëm në katër përmasa të sakta. Një pamje e marrë
 * nga telefoni Android ka raport tjetër dhe do të duhej shtrirë ose prerë —
 * pra do të dilte e shtrembëruar ose e gjymtuar.
 *
 * Ky skedar hap një dritare me përmasat e saktë të iPhone 16 (393 × 852 pikë,
 * me dendësi 3×) dhe ruan pikërisht atë që duket. Asnjë përshtatje më pas.
 *
 * ⚠️  HYRJEN E BËN NJERIU, JO SKEDARI. Fjalëkalimet nuk shkruhen askund këtu
 *     dhe nuk i kërkon kush. Dritarja hapet, ti hyn vetë, dhe skedari vetëm
 *     pret urdhrin për të fotografuar.
 *
 * Përdorimi:
 *     npm run pamjet
 *
 * Pastaj: hyr te llogaria, shko te ekrani që do, kthehu te terminali dhe
 * shtyp ENTER. Përsërite sa herë të duash. Në fund shkruaj `q` dhe ENTER.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";

const DOSJA = path.join(
  process.env.USERPROFILE || process.env.HOME,
  "Desktop",
  (process.argv[2] || "iphone").toLowerCase() === "ipad" ? "pamjet-ipad" : "pamjet-ios"
);
const ADRESA = "https://app.drartegogo.com";

/**
 * Pajisjet, me përmasat që Apple i pranon.
 *
 * ⚠️  NUMRAT NUK JANË TË ZGJEDHUR, JANË TË DHËNË. App Store Connect i refuzon
 *     pamjet që nuk bien saktësisht te një nga madhësitë e veta. Pikët
 *     shumëzuar me dendësinë japin pikselët:
 *
 *       iPhone 16      393 × 852   × 3  =  1179 × 2556
 *       iPad Pro 13"  1032 × 1376  × 2  =  2064 × 2752
 */
const PAJISJET = {
  iphone: {
    emri: "iPhone 16 — 1179 × 2556",
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 " +
      "(KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  },
  ipad: {
    emri: 'iPad Pro 13" — 2064 × 2752',
    viewport: { width: 1032, height: 1376 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 " +
      "(KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  },
};

/* `npm run pamjet` → iPhone;  `npm run pamjet -- ipad` → iPad. */
const zgjedhja = (process.argv[2] || "iphone").toLowerCase();
const PAJISJA = PAJISJET[zgjedhja];
if (!PAJISJA) {
  console.error(`Pajisje e panjohur: ${zgjedhja}. Pritet: iphone ose ipad.`);
  process.exit(1);
}

mkdirSync(DOSJA, { recursive: true });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext(PAJISJA);
const page = await context.newPage();
await page.goto(ADRESA, { waitUntil: "domcontentloaded" });

console.log("\n────────────────────────────────────────────────");
console.log(`  Dritarja u hap: ${PAJISJA.emri}`);
console.log("");
console.log("  1. Hyr te llogaria brenda asaj dritareje");
console.log("  2. Shko te ekrani që do të fotografosh");
console.log("  3. Kthehu këtu dhe shtyp ENTER");
console.log("");
console.log("  Në fund: shkruaj  q  dhe ENTER");
console.log(`  Pamjet ruhen te: ${DOSJA}`);
console.log("────────────────────────────────────────────────\n");

const rl = createInterface({ input: process.stdin, output: process.stdout });
let numri = 0;

const pyet = () =>
  new Promise((resolve) => rl.question("ENTER për të fotografuar (q = mbaro): ", resolve));

for (;;) {
  const pergjigje = (await pyet()).trim().toLowerCase();
  if (pergjigje === "q") break;

  numri += 1;
  const emri = path.join(DOSJA, `pamja-${String(numri).padStart(2, "0")}.png`);
  /* `fullPage: false` me qëllim: duam pikërisht dritaren, jo faqen e gjatë. */
  await page.screenshot({ path: emri, fullPage: false });
  const { width, height } = PAJISJA.viewport;
  const dnd = PAJISJA.deviceScaleFactor;
  console.log(`   ✓ u ruajt  ${path.basename(emri)}  (${width * dnd} × ${height * dnd})
`);
}

rl.close();
await browser.close();
console.log(`\nMbaruan ${numri} pamje te ${DOSJA}\n`);
