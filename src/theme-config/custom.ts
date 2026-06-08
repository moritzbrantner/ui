import type { UiThemeConfig } from "./types";

const customTheme = {
  name: "custom",
  className: "custom",
  dataAttribute: { "data-ui-theme": "custom" },
} as const satisfies UiThemeConfig<"custom">;

export { customTheme };
