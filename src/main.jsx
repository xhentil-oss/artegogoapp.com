import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { injectCssVariables } from "./theme/cssVariables.js";
import { loadAdminState } from "./services/adminStore.js";

import "./styles/global.css";
import "./styles/animations.css";

/* token-et JS → CSS variables, që fletët CSS të ndajnë të njëjtat ngjyra */
injectCssVariables();

/* Ndryshimet e admin-it lexohen para render-it të parë; nëse vonohen, pamja
   do të pulsonte nga klasifikimi bazë te ai i redaktuar. Dështimi nuk e ndal
   nisjen — pa mbishkrime, aplikacioni thjesht tregon përmbajtjen bazë. */
loadAdminState().catch(() => {});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
