"use client";

import { popTheme } from "../theme-config/pop";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const PopTheme = createScopedThemeComponent(popTheme);
const uiTheme = popTheme;

export { PopTheme, popTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-config";
export type { ScopedThemeProps as PopThemeProps };
