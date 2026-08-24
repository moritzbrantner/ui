import type { UiTokenName } from "../token-names";
import type { BuiltInUiThemeName } from "./types";

type UiThemeRegistryItemRole = "theme" | "component" | "block";

type UiThemeRegistryItem = {
  name: string;
  role: UiThemeRegistryItemRole;
  description: string;
  install: string;
};

type UiThemeManifest<Name extends BuiltInUiThemeName = BuiltInUiThemeName> = {
  name: Name;
  intent: string;
  packageStylesheet: string;
  tokenNames: readonly UiTokenName[];
  registry: {
    theme: UiThemeRegistryItem;
    components: readonly UiThemeRegistryItem[];
    blocks: readonly UiThemeRegistryItem[];
  };
};

const scholiaThemeManifest = {
  name: "scholia",
  intent:
    "Source-first scholarly interfaces that keep primary text, translation, apparatus, citation, and interpretation visibly distinct.",
  packageStylesheet: "@moritzbrantner/ui/scholia/styles.css",
  tokenNames: [
    "--font-body-app",
    "--font-heading-app",
    "--document-annotation",
    "--document-highlight",
    "--document-citation",
    "--document-margin-note",
    "--document-selection",
    "--document-ruled-background",
    "--document-grid-background",
    "--document-quote",
    "--document-callout",
  ],
  registry: {
    theme: {
      name: "scholia-theme",
      role: "theme",
      description: "Complete Scholia Tailwind foundation and light/dark token contract.",
      install: "moritzbrantner/ui/scholia-theme",
    },
    components: [
      {
        name: "source-passage",
        role: "component",
        description:
          "Parallel source and translation presentation with locator and highlight slots.",
        install: "moritzbrantner/ui/source-passage",
      },
      {
        name: "apparatus-list",
        role: "component",
        description:
          "Compact critical-apparatus readings with witness, locator, and note semantics.",
        install: "moritzbrantner/ui/apparatus-list",
      },
      {
        name: "scholarly-note",
        role: "component",
        description: "Annotation, commentary, translation, and textual-variant note surface.",
        install: "moritzbrantner/ui/scholarly-note",
      },
    ],
    blocks: [
      {
        name: "scholia-source-workbench",
        role: "block",
        description:
          "Source-first workbench composition for text, translation, apparatus, and notes.",
        install: "moritzbrantner/ui/scholia-source-workbench",
      },
    ],
  },
} as const satisfies UiThemeManifest<"scholia">;

const uiThemeManifests = {
  scholia: scholiaThemeManifest,
} as const satisfies Partial<Record<BuiltInUiThemeName, UiThemeManifest>>;

export { scholiaThemeManifest, uiThemeManifests };
export type { UiThemeManifest, UiThemeRegistryItem, UiThemeRegistryItemRole };
