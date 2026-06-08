"use client";

import { pulseTheme } from "./themes";

export * from "./index";
export { PulseTheme, UiTheme, pulseTheme, themeConfig } from "./themes";
export type { UiThemeConfig, UiThemeName, UiThemeProps } from "./themes";

const uiTheme = pulseTheme;

export { uiTheme };
