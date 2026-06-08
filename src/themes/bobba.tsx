"use client";

import { bobbaTheme } from "../theme-config/bobba";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const BobbaTheme = createScopedThemeComponent(bobbaTheme);
const uiTheme = bobbaTheme;

export { BobbaTheme, bobbaTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-config";
export type { ScopedThemeProps as BobbaThemeProps };
