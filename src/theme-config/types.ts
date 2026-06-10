import type { UiThemeTokens, UiTokenName } from "../token-names";

type BuiltInUiThemeName =
  | "bobba"
  | "zleek"
  | "atlas"
  | "studio"
  | "paper"
  | "scholia"
  | "pop"
  | "pulse";
type UiThemeName = BuiltInUiThemeName | "custom";

type UiThemeConfig<Name extends UiThemeName = UiThemeName> = {
  name: Name;
  className: string;
  dataAttribute: {
    "data-ui-theme": Name;
  };
};

export type { BuiltInUiThemeName, UiThemeConfig, UiThemeName, UiThemeTokens, UiTokenName };
