"use client";

import { zleekTheme } from "../theme-config/zleek";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const ZleekTheme = createScopedThemeComponent(zleekTheme);
const uiTheme = zleekTheme;

export { ZleekTheme, uiTheme, zleekTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-config";
export type { ScopedThemeProps as ZleekThemeProps };
