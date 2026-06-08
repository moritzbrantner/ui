import "@moritzbrantner/ui/studio/styles.css";

import { StudioTheme, uiTheme } from "@moritzbrantner/ui/studio";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StudioTheme>
      <main data-theme-name={uiTheme.name}>Studio theme fixture</main>
    </StudioTheme>
  </StrictMode>,
);
