"use client";

import { popTheme } from "../theme-metadata";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const PopTheme = createScopedThemeComponent(popTheme);
const uiTheme = popTheme;

export { PopTheme, popTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-metadata";
export type { ScopedThemeProps as PopThemeProps };
