import type { UiThemeConfig } from "./types";

const studioTheme = {
  name: "studio",
  className: "studio",
  dataAttribute: { "data-ui-theme": "studio" },
} as const satisfies UiThemeConfig<"studio">;

export { studioTheme };
