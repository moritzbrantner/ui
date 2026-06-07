"use client";

import { studioTheme } from "../theme-metadata";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const StudioTheme = createScopedThemeComponent(studioTheme);
const uiTheme = studioTheme;

export { StudioTheme, studioTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-metadata";
export type { ScopedThemeProps as StudioThemeProps };
