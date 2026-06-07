"use client";

import { paperTheme } from "../theme-metadata";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const PaperTheme = createScopedThemeComponent(paperTheme);
const uiTheme = paperTheme;

export { PaperTheme, paperTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-metadata";
export type { ScopedThemeProps as PaperThemeProps };
