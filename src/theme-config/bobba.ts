import type { UiThemeConfig } from "./types";

const bobbaTheme = {
  name: "bobba",
  className: "bobba",
  dataAttribute: { "data-ui-theme": "bobba" },
} as const satisfies UiThemeConfig<"bobba">;

export { bobbaTheme };
