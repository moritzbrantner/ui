import "@moritzbrantner/ui/atlas/styles.css";

import { AtlasTheme, uiTheme } from "@moritzbrantner/ui/atlas";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AtlasTheme>
      <main data-theme-name={uiTheme.name}>Atlas theme fixture</main>
    </AtlasTheme>
  </StrictMode>,
);
