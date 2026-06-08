import type { UiThemeConfig } from "./types";

const popTheme = {
  name: "pop",
  className: "pop",
  dataAttribute: { "data-ui-theme": "pop" },
} as const satisfies UiThemeConfig<"pop">;

export { popTheme };
