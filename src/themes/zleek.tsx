"use client";

import { zleekTheme } from "../theme-metadata";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const ZleekTheme = createScopedThemeComponent(zleekTheme);
const uiTheme = zleekTheme;

export { ZleekTheme, uiTheme, zleekTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-metadata";
export type { ScopedThemeProps as ZleekThemeProps };
