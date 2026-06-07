"use client";

import { bobbaTheme } from "../theme-metadata";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const BobbaTheme = createScopedThemeComponent(bobbaTheme);
const uiTheme = bobbaTheme;

export { BobbaTheme, bobbaTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-metadata";
export type { ScopedThemeProps as BobbaThemeProps };
