"use client";

import * as React from "react";

import { cn } from "./lib/cn";
import {
  atlasTheme,
  bobbaTheme,
  builtInUiThemeNames,
  createUiTheme,
  customTheme,
  defaultUiThemeName,
  paperTheme,
  studioTheme,
  themeConfig,
  uiThemeLabels,
  uiThemeNames,
  uiTokenNames,
  zleekTheme,
  type BuiltInUiThemeName,
  type UiThemeConfig,
  type UiThemeName,
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

export {
  AtlasTheme,
  BobbaTheme,
  PaperTheme,
  StudioTheme,
  UiTheme,
  ZleekTheme,
  atlasTheme,
  bobbaTheme,
  builtInUiThemeNames,
  createUiTheme,
  customTheme,
  defaultUiThemeName,
  paperTheme,
  studioTheme,
  themeConfig,
  uiThemeLabels,
  uiThemeNames,
  uiTokenNames,
  zleekTheme,
};
export type {
  BuiltInUiThemeName,
  UiThemeConfig,
  UiThemeName,
  UiThemeProps,
  UiThemeTokens,
  UiTokenName,
};
