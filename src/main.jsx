import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { injectCssVariables } from "./theme/cssVariables.js";

import "./styles/global.css";
import "./styles/animations.css";

/* token-et JS → CSS variables, që fletët CSS të ndajnë të njëjtat ngjyra */
injectCssVariables();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
