"use client";

import { paperTheme } from "../theme-config/paper";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const PaperTheme = createScopedThemeComponent(paperTheme);
const uiTheme = paperTheme;

export { PaperTheme, paperTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-config";
export type { ScopedThemeProps as PaperThemeProps };
