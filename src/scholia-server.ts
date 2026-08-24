import { scholiaTheme } from "./theme-config/scholia";
import { scholiaThemeManifest } from "./theme-config/manifests";

const uiTheme = scholiaTheme;

export { scholiaTheme, scholiaThemeManifest, uiTheme };
export type {
  BuiltInUiThemeName,
  UiThemeConfig,
  UiThemeManifest,
  UiThemeName,
} from "./theme-config";
