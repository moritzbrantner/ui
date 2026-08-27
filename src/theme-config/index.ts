import type * as React from "react";

import { uiTokenNames, type UiThemeTokens, type UiTokenName } from "../token-names";
import { atlasTheme } from "./atlas";
import { bobbaTheme } from "./bobba";
import { customTheme } from "./custom";
import {
  atlasThemeManifest,
  bobbaThemeManifest,
  paperThemeManifest,
  popThemeManifest,
  pulseThemeManifest,
  scholiaThemeManifest,
  studioThemeManifest,
  uiThemeManifests,
  zleekThemeManifest,
} from "./manifests";
import { paperTheme } from "./paper";
import { popTheme } from "./pop";
import { uiThemeProfiles, type UiThemeProfile } from "./profiles";
import { pulseTheme } from "./pulse";
import { scholiaTheme } from "./scholia";
import { studioTheme } from "./studio";
import type { BuiltInUiThemeName, UiThemeConfig, UiThemeName } from "./types";
import { zleekTheme } from "./zleek";

const builtInUiThemeNames = [
  "bobba",
  "zleek",
  "atlas",
  "studio",
  "paper",
  "scholia",
  "pop",
  "pulse",
] as const;
const uiThemeNames = [...builtInUiThemeNames, "custom"] as const;

const defaultUiThemeName = "bobba" as const satisfies BuiltInUiThemeName;

const uiThemeLabels = {
  bobba: "Bobba",
  zleek: "Zleek",
  atlas: "Atlas",
  studio: "Studio",
  paper: "Paper",
  scholia: "Scholia",
  pop: "Pop",
  pulse: "Pulse",
  custom: "Custom",
} as const satisfies Record<UiThemeName, string>;

const uiTokenNameSet = new Set<string>(uiTokenNames);

const themeConfig = {
  zleek: zleekTheme,
  bobba: bobbaTheme,
  atlas: atlasTheme,
  studio: studioTheme,
  paper: paperTheme,
  scholia: scholiaTheme,
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
  atlasThemeManifest,
  bobbaTheme,
  bobbaThemeManifest,
  builtInUiThemeNames,
  createUiTheme,
  customTheme,
  defaultUiThemeName,
  paperTheme,
  paperThemeManifest,
  popTheme,
  popThemeManifest,
  pulseTheme,
  pulseThemeManifest,
  scholiaTheme,
  scholiaThemeManifest,
  studioTheme,
  studioThemeManifest,
  themeConfig,
  uiThemeLabels,
  uiThemeManifests,
  uiThemeNames,
  uiThemeProfiles,
  uiTokenNames,
  zleekTheme,
  zleekThemeManifest,
};
export type {
  BuiltInUiThemeName,
  UiThemeConfig,
  UiThemeName,
  UiThemeProfile,
  UiThemeTokens,
  UiTokenName,
};
export type { UiThemeManifest, UiThemeRegistryItem, UiThemeRegistryItemRole } from "./manifests";
