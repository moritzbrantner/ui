import "@moritzbrantner/ui/paper/styles.css";

import { PaperTheme, uiTheme } from "@moritzbrantner/ui/paper";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PaperTheme>
      <main data-theme-name={uiTheme.name}>Paper theme fixture</main>
    </PaperTheme>
  </StrictMode>,
);
