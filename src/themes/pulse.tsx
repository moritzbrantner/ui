"use client";

import { pulseTheme } from "../theme-metadata";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const PulseTheme = createScopedThemeComponent(pulseTheme);
const uiTheme = pulseTheme;

export { PulseTheme, pulseTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-metadata";
export type { ScopedThemeProps as PulseThemeProps };
