import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { injectCssVariables } from "./theme/cssVariables.js";
import { loadAdminState } from "./services/adminStore.js";
import { loadToken } from "./services/api.js";
import { hydrateCatalog, markCatalogPending } from "./services/catalog.js";
import { registerWorker } from "./services/push.js";

import "./styles/global.css";
import "./styles/animations.css";

/* token-et JS → CSS variables, që fletët CSS të ndajnë të njëjtat ngjyra */
injectCssVariables();

/**
 * Sa pritet katalogu para render-it të parë.
 *
 * ⚠️  KJO VLERË ËSHTË RREGULLIMI I EKRANIT TË BARDHË.
 *
 *     Më parë nisja e pritte katalogun pa kufi, dhe `api.js` ka afat 15
 *     sekonda. Kur serveri nuk përgjigjej — dhe Passenger-i i cPanel-it e fik
 *     aplikacionin kur rri pa punë, ndaj kërkesa e parë pas një pushimi është
 *     pikërisht e ngadalta — faqja qëndronte KREJT E BARDHË për 15 sekonda:
 *     pa shell, pa rrotullim, pa gabim. `#root` bosh dhe asnjë përjashtim te
 *     konsola, ndaj dukej si aplikacion i vdekur.
 *
 *     E matur me Chrome pa dritare: kërkesat e katalogut niseshin te 0,13 s,
 *     ngeceshin deri te 15 s, dhe render-i i parë ndodhte te 15,15 s.
 *
 *     Tani pritja ka kufi. Në rrugën e shpejtë (serveri i zgjuar, nën 2,5 s)
 *     sjellja është si më parë — pa pulsim. Përtej saj vizatohet fallback-u
 *     lokal, dhe katalogu i serverit zë vendin sapo mbërrin.
 */
const BUXHETI_KATALOGUT_MS = 2500;

/**
 * NISJA
 *
 * Hapat lokalë (token-i, gjendja e admin-it) lexohen nga `localStorage` dhe
 * kryhen PARA render-it: janë të menjëhershëm dhe pa rrjet.
 *
 * ⚠️  Pse pritej katalogu fare: përmbajtja shkon te të njëjtat vargje moduli
 *     që lexojnë 23 skedarë sinkron (shih `domain/classification.js`), ndaj
 *     një mbërritje e vonuar nuk rivizaton vetë asgjë. Kjo tani zgjidhet te
 *     `services/catalog.js`, me një version që `Root` e ndjek.
 *
 *     Asnjëri hap nuk e rrëzon nisjen. Nëse serveri nuk arrihet, mbetet
 *     `data/collections.js` — fallback-u offline për të cilin u shkrua.
 */
async function boot() {
  await Promise.all([loadToken().catch(() => null), loadAdminState().catch(() => {})]);

  /* Nis pa `await`: fatin e vendos gara më poshtë, kurrë pritja e plotë. */
  const hydration = hydrateCatalog();
  let iVonuar = false;

  const katalogu = await Promise.race([
    hydration,
    new Promise((resolve) =>
      setTimeout(() => {
        iVonuar = true;
        /* Pamja duhet të thotë menjëherë se po tregon përmbajtje lokale —
           përndryshe hesht deri te afati i `api.js`. */
        markCatalogPending();
        resolve(null);
      }, BUXHETI_KATALOGUT_MS)
    ),
  ]);

  /*
   * Service Worker-i regjistrohet pa u pritur.
   *
   * ⚠️  Ai është hallka që merr njoftimin kur aplikacioni është i mbyllur, ndaj
   *     duhet të ekzistojë para se përdoruesi të shtypë "Ndizi njoftimet".
   *     Por regjistrimi nuk duhet ta vonojë nisjen: dështimi i tij nuk e prek
   *     asgjë tjetër, dhe një shfletues pa mbështetje thjesht kthen `null`.
   */
  registerWorker().catch(() => {});

  /*
   * Vizatohet një herë, dhe një herë të vetme.
   *
   * ⚠️  Katalogu që mbërrin me vonesë NUK trajtohet me një render të dytë
   *     këtu: `hydrateCatalog` rrit versionin e vet, `Root` e lexon me
   *     `useSyncExternalStore` (`useCatalogVersion`), dhe pema ripërpunohet
   *     pa u shkëputur. Kështu gjendja e ekranit — skeda, kategoria e hapur,
   *     player-i — mbetet e paprekur. I njëjti mekanizëm si i admin-it.
   */
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  if (iVonuar) {
    console.warn(
      `[artegogo] katalogu nuk mbërriti brenda ${BUXHETI_KATALOGUT_MS} ms — u vizatua përmbajtja lokale.`
    );
    hydration.then((result) => {
      if (!result?.ok) {
        console.warn(`[artegogo] katalogu lokal (${result?.error}) — serveri nuk u lexua.`);
      }
    });
  } else if (!katalogu.ok) {
    console.warn(`[artegogo] katalogu lokal (${katalogu.error}) — serveri nuk u lexua.`);
  }
}

boot();
