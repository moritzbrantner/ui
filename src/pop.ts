"use client";

import { popTheme } from "./themes";

export * from "./index";
export { PopTheme, UiTheme, popTheme, themeConfig } from "./themes";
export type { UiThemeConfig, UiThemeName, UiThemeProps } from "./themes";

const uiTheme = popTheme;

export { uiTheme };
