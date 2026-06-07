"use client";

import { atlasTheme } from "../theme-metadata";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const AtlasTheme = createScopedThemeComponent(atlasTheme);
const uiTheme = atlasTheme;

export { AtlasTheme, atlasTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-metadata";
export type { ScopedThemeProps as AtlasThemeProps };
