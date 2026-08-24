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
  motion?: {
    profile: "pop" | "pulse";
    packageImport: "@moritzbrantner/ui/components/patterns/theme-motion";
    registryItem: "moritzbrantner/ui/theme-motion";
  };
};

const motionTokenNames = [
  "--ui-motion-hover-y",
  "--ui-motion-hover-scale",
  "--ui-motion-press-scale",
  "--ui-motion-duration-fast",
  "--ui-motion-duration-base",
  "--ui-motion-duration-slow",
  "--ui-motion-ease-standard",
  "--ui-motion-ease-emphasized",
  "--ui-motion-enter-y",
  "--ui-motion-overlay-scale",
] as const satisfies readonly UiTokenName[];

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

const popThemeManifest = {
  name: "pop",
  intent:
    "Playful creator-facing interfaces with spring feedback, rounded surfaces, and intentional celebration moments.",
  packageStylesheet: "@moritzbrantner/ui/pop/styles.css",
  tokenNames: motionTokenNames,
  registry: {
    theme: {
      name: "pop-theme",
      role: "theme",
      description: "Complete Pop Tailwind foundation and expressive motion token contract.",
      install: "moritzbrantner/ui/pop-theme",
    },
    components: [
      {
        name: "theme-motion",
        role: "component",
        description: "Motion-enhanced Button, Tabs, and Toast patterns configured for Pop.",
        install: "moritzbrantner/ui/theme-motion",
      },
    ],
    blocks: [],
  },
  motion: {
    profile: "pop",
    packageImport: "@moritzbrantner/ui/components/patterns/theme-motion",
    registryItem: "moritzbrantner/ui/theme-motion",
  },
} as const satisfies UiThemeManifest<"pop">;

const pulseThemeManifest = {
  name: "pulse",
  intent:
    "Kinetic interaction surfaces with faster spatial feedback for selection, expansion, and live state changes.",
  packageStylesheet: "@moritzbrantner/ui/pulse/styles.css",
  tokenNames: motionTokenNames,
  registry: {
    theme: {
      name: "pulse-theme",
      role: "theme",
      description: "Complete Pulse Tailwind foundation and kinetic motion token contract.",
      install: "moritzbrantner/ui/pulse-theme",
    },
    components: [
      {
        name: "theme-motion",
        role: "component",
        description: "Motion-enhanced Button, Tabs, and Toast patterns configured for Pulse.",
        install: "moritzbrantner/ui/theme-motion",
      },
    ],
    blocks: [],
  },
  motion: {
    profile: "pulse",
    packageImport: "@moritzbrantner/ui/components/patterns/theme-motion",
    registryItem: "moritzbrantner/ui/theme-motion",
  },
} as const satisfies UiThemeManifest<"pulse">;

const uiThemeManifests = {
  scholia: scholiaThemeManifest,
  pop: popThemeManifest,
  pulse: pulseThemeManifest,
} as const satisfies Partial<Record<BuiltInUiThemeName, UiThemeManifest>>;

export { popThemeManifest, pulseThemeManifest, scholiaThemeManifest, uiThemeManifests };
export type { UiThemeManifest, UiThemeRegistryItem, UiThemeRegistryItemRole };
