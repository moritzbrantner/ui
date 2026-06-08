import type { UiThemeConfig } from "./types";

const paperTheme = {
  name: "paper",
  className: "paper",
  dataAttribute: { "data-ui-theme": "paper" },
} as const satisfies UiThemeConfig<"paper">;

export { paperTheme };
