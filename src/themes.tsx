"use client";

import * as React from "react";

import { cn } from "./lib/cn";
import {
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
  type BuiltInUiThemeName,
  type UiThemeConfig,
  type UiThemeManifest,
  type UiThemeName,
  type UiThemeProfile,
  type UiThemeRegistryItem,
  type UiThemeRegistryItemRole,
  type UiThemeTokens,
  type UiTokenName,
} from "./theme-metadata";

type UiThemeProps = React.ComponentProps<"div"> & {
  /**
   * Selects package theme metadata for this wrapper. Use theme-scopes.css when
   * multiple built-in themes need to coexist in the same document.
   */
  theme: UiThemeName;
};

function UiTheme({ theme, className, ...props }: UiThemeProps) {
  const config = themeConfig[theme];

  return <div data-ui-theme={config.name} className={cn(config.className, className)} {...props} />;
}

function ZleekTheme(props: Omit<UiThemeProps, "theme">) {
  return <UiTheme theme="zleek" {...props} />;
}

function BobbaTheme(props: Omit<UiThemeProps, "theme">) {
  return <UiTheme theme="bobba" {...props} />;
}

function AtlasTheme(props: Omit<UiThemeProps, "theme">) {
  return <UiTheme theme="atlas" {...props} />;
}

function StudioTheme(props: Omit<UiThemeProps, "theme">) {
  return <UiTheme theme="studio" {...props} />;
}

function PaperTheme(props: Omit<UiThemeProps, "theme">) {
  return <UiTheme theme="paper" {...props} />;
}

function ScholiaTheme(props: Omit<UiThemeProps, "theme">) {
  return <UiTheme theme="scholia" {...props} />;
}

function PopTheme(props: Omit<UiThemeProps, "theme">) {
  return <UiTheme theme="pop" {...props} />;
}

function PulseTheme(props: Omit<UiThemeProps, "theme">) {
  return <UiTheme theme="pulse" {...props} />;
}

export {
  AtlasTheme,
  BobbaTheme,
  PaperTheme,
  PopTheme,
  PulseTheme,
  ScholiaTheme,
  StudioTheme,
  UiTheme,
  ZleekTheme,
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
  UiThemeManifest,
  UiThemeName,
  UiThemeProfile,
  UiThemeProps,
  UiThemeRegistryItem,
  UiThemeRegistryItemRole,
  UiThemeTokens,
  UiTokenName,
};
