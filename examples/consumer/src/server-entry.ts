import { cn, createUiTheme, themeConfig, type UiThemeName } from "@moritzbrantner/ui/server";

export function getServerThemeClass(theme: UiThemeName = "bobba") {
  return cn("min-h-screen", themeConfig[theme].className);
}

export const serverThemeStyle = createUiTheme({
  "--radius": "0.75rem",
});
