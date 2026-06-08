"use client";

import { atlasTheme } from "../theme-config/atlas";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const AtlasTheme = createScopedThemeComponent(atlasTheme);
const uiTheme = atlasTheme;

export { AtlasTheme, atlasTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-config";
export type { ScopedThemeProps as AtlasThemeProps };
