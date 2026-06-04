import React from "react";
// import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { createRoot } from "react-dom/client";
import App from "./App";
import { APP_FONT_SANS_STACK } from "./shared-core/theme/typography";

const container = document.getElementById("root");
const root = createRoot(container!);

document.documentElement.style.setProperty("--app-font-sans", APP_FONT_SANS_STACK);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// serviceWorkerRegistration.register();
