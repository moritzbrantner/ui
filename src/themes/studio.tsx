"use client";

import { studioTheme } from "../theme-config/studio";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const StudioTheme = createScopedThemeComponent(studioTheme);
const uiTheme = studioTheme;

export { StudioTheme, studioTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-config";
export type { ScopedThemeProps as StudioThemeProps };
