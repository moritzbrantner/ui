"use client";

import { scholiaTheme } from "../theme-config/scholia";
import { createScopedThemeComponent, type ScopedThemeProps } from "./scoped-theme";

const ScholiaTheme = createScopedThemeComponent(scholiaTheme);
const uiTheme = scholiaTheme;

export { ScholiaTheme, scholiaTheme, uiTheme };
export type { UiThemeConfig, UiThemeName } from "../theme-config";
export type { ScopedThemeProps as ScholiaThemeProps };
