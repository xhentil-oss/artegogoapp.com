import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { injectCssVariables } from "./theme/cssVariables.js";
import { loadAdminState } from "./services/adminStore.js";
import { loadToken } from "./services/api.js";
import { hydrateCatalog } from "./services/catalog.js";
import { registerWorker } from "./services/push.js";

import "./styles/global.css";
import "./styles/animations.css";

/* token-et JS → CSS variables, që fletët CSS të ndajnë të njëjtat ngjyra */
injectCssVariables();

/**
 * NISJA
 *
 * Të tria hapat kryhen PARA render-it të parë, dhe rendi mes tyre nuk ka
 * rëndësi — prandaj shkojnë bashkë.
 *
 * ⚠️  Pse pritet katalogu në vend që të vizatohet menjëherë: përndryshe ekrani
 *     do të shfaqte 244 meditimet lokale dhe pastaj do t'i zëvendësonte me ato
 *     të serverit — një pulsim i dukshëm, dhe numra që ndryshojnë nën sy.
 *     Katalogu është nën 150 KB; pritja është e shkurtër dhe ndodh një herë.
 *
 *     Asnjëri hap nuk e rrëzon nisjen. Nëse serveri nuk arrihet, mbetet
 *     `data/collections.js` — fallback-u offline për të cilin u shkrua.
 */
async function boot() {
  const [, catalog] = await Promise.all([
    loadToken().catch(() => null),
    hydrateCatalog(),
    loadAdminState().catch(() => {}),
  ]);

  if (!catalog.ok) {
    console.warn(`[artegogo] katalogu lokal (${catalog.error}) — serveri nuk u lexua.`);
  }

  /*
   * Service Worker-i regjistrohet pa u pritur.
   *
   * ⚠️  Ai është hallka që merr njoftimin kur aplikacioni është i mbyllur, ndaj
   *     duhet të ekzistojë para se përdoruesi të shtypë "Ndizi njoftimet".
   *     Por regjistrimi nuk duhet ta vonojë nisjen: dështimi i tij nuk e prek
   *     asgjë tjetër, dhe një shfletues pa mbështetje thjesht kthen `null`.
   */
  registerWorker().catch(() => {});

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();
