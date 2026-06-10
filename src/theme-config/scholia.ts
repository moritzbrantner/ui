import type { UiThemeConfig } from "./types";

const scholiaTheme = {
  name: "scholia",
  className: "scholia",
  dataAttribute: { "data-ui-theme": "scholia" },
} as const satisfies UiThemeConfig<"scholia">;

export { scholiaTheme };
