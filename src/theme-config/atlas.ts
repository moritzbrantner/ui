import type { UiThemeConfig } from "./types";

const atlasTheme = {
  name: "atlas",
  className: "atlas",
  dataAttribute: { "data-ui-theme": "atlas" },
} as const satisfies UiThemeConfig<"atlas">;

export { atlasTheme };
