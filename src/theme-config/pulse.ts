import type { UiThemeConfig } from "./types";

const pulseTheme = {
  name: "pulse",
  className: "pulse",
  dataAttribute: { "data-ui-theme": "pulse" },
} as const satisfies UiThemeConfig<"pulse">;

export { pulseTheme };
