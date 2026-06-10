import "@moritzbrantner/ui/scholia/styles.css";

import { ScholiaTheme, uiTheme } from "@moritzbrantner/ui/scholia";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ScholiaTheme>
      <main data-theme-name={uiTheme.name}>Scholia theme fixture</main>
    </ScholiaTheme>
  </StrictMode>,
);
