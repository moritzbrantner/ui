import type * as React from "react";

import { uiTokenNames, type UiThemeTokens, type UiTokenName } from "./token-names";

const builtInUiThemeNames = ["bobba", "zleek", "atlas", "studio", "paper", "pop", "pulse"] as const;
const uiThemeNames = [...builtInUiThemeNames, "custom"] as const;

type UiThemeName = (typeof uiThemeNames)[number];
type BuiltInUiThemeName = (typeof builtInUiThemeNames)[number];

const defaultUiThemeName = "bobba" as const satisfies BuiltInUiThemeName;

const uiThemeLabels = {
  bobba: "Bobba",
  zleek: "Zleek",
  atlas: "Atlas",
  studio: "Studio",
  paper: "Paper",
  pop: "Pop",
  pulse: "Pulse",
  custom: "Custom",
} as const satisfies Record<UiThemeName, string>;

const uiTokenNameSet = new Set<string>(uiTokenNames);

type UiThemeConfig = {
  name: UiThemeName;
  className: string;
  dataAttribute: {
    "data-ui-theme": UiThemeName;
  };
};

const zleekTheme = {
  name: "zleek",
  className: "zleek",
  dataAttribute: { "data-ui-theme": "zleek" },
} as const satisfies UiThemeConfig;

const bobbaTheme = {
  name: "bobba",
  className: "bobba",
  dataAttribute: { "data-ui-theme": "bobba" },
} as const satisfies UiThemeConfig;

const atlasTheme = {
  name: "atlas",
  className: "atlas",
  dataAttribute: { "data-ui-theme": "atlas" },
} as const satisfies UiThemeConfig;

const studioTheme = {
  name: "studio",
  className: "studio",
  dataAttribute: { "data-ui-theme": "studio" },
} as const satisfies UiThemeConfig;

const paperTheme = {
  name: "paper",
  className: "paper",
  dataAttribute: { "data-ui-theme": "paper" },
} as const satisfies UiThemeConfig;

const popTheme = {
  name: "pop",
  className: "pop",
  dataAttribute: { "data-ui-theme": "pop" },
} as const satisfies UiThemeConfig;

const pulseTheme = {
  name: "pulse",
  className: "pulse",
  dataAttribute: { "data-ui-theme": "pulse" },
} as const satisfies UiThemeConfig;

const customTheme = {
  name: "custom",
  className: "custom",
  dataAttribute: { "data-ui-theme": "custom" },
} as const satisfies UiThemeConfig;

const themeConfig = {
  zleek: zleekTheme,
  bobba: bobbaTheme,
  atlas: atlasTheme,
  studio: studioTheme,
  paper: paperTheme,
  pop: popTheme,
  pulse: pulseTheme,
  custom: customTheme,
} as const satisfies Record<UiThemeName, UiThemeConfig>;

function createUiTheme(tokens: UiThemeTokens): React.CSSProperties {
  const style: Record<string, string> = {};

  for (const [tokenName, value] of Object.entries(tokens)) {
    if (uiTokenNameSet.has(tokenName) && typeof value === "string") {
      style[tokenName] = value;
    }
  }

  return style as React.CSSProperties;
}

export {
  atlasTheme,
  bobbaTheme,
  builtInUiThemeNames,
  createUiTheme,
  customTheme,
  defaultUiThemeName,
  paperTheme,
  popTheme,
  pulseTheme,
  studioTheme,
  themeConfig,
  uiThemeLabels,
  uiThemeNames,
  uiTokenNames,
  zleekTheme,
};
export type { BuiltInUiThemeName, UiThemeConfig, UiThemeName, UiThemeTokens, UiTokenName };
