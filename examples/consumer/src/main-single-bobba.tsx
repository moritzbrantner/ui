import "@moritzbrantner/ui/bobba/styles.css";

import { BobbaTheme, uiTheme } from "@moritzbrantner/ui/bobba";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BobbaTheme>
      <main data-theme-name={uiTheme.name}>Bobba theme fixture</main>
    </BobbaTheme>
  </StrictMode>,
);
