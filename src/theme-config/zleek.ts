import type { UiThemeConfig } from "./types";

const zleekTheme = {
  name: "zleek",
  className: "zleek",
  dataAttribute: { "data-ui-theme": "zleek" },
} as const satisfies UiThemeConfig<"zleek">;

export { zleekTheme };
