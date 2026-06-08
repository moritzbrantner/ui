"use client";

import { pulseTheme } from "../theme-config/pulse";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const PulseTheme = createScopedThemeComponent(pulseTheme);
const uiTheme = pulseTheme;

export { PulseTheme, pulseTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-config";
export type { ScopedThemeProps as PulseThemeProps };
