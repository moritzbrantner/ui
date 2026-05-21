import "@moritzbrantner/ui/atlas/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { SubpathApp } from "./SubpathApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SubpathApp />
  </StrictMode>,
);
