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

const zleekThemeManifest = {
  name: "zleek",
  intent:
    "Glass command-center interfaces with translucent depth, polished shells, compact status, and fast context switching.",
  packageStylesheet: "@moritzbrantner/ui/zleek/styles.css",
  tokenNames: [
    "--glass-blur",
    "--glass-reduced-blur",
    "--glass-shadow",
    "--glass-interactive-shadow",
    "--glass-raised-shadow",
    "--glass-surface-tint",
    "--glass-surface-gradient",
    "--glass-overlay-gradient",
    "--live-active",
    "--live-healthy",
    "--live-alert",
  ],
  registry: {
    theme: {
      name: "zleek-theme",
      role: "theme",
      description: "Complete Zleek glass shell foundation and light/dark token contract.",
      install: "moritzbrantner/ui/zleek-theme",
    },
    components: [
      {
        name: "zleek-shells",
        role: "component",
        description:
          "Glass docks, command decks, status capsules, launch cards, switchers, and HUD panels.",
        install: "moritzbrantner/ui/zleek-shells",
      },
    ],
    blocks: [],
  },
} as const satisfies UiThemeManifest<"zleek">;

const bobbaThemeManifest = {
  name: "bobba",
  intent:
    "Neutral product-safe foundations for shared applications, admin flows, and reusable product patterns.",
  packageStylesheet: "@moritzbrantner/ui/bobba/styles.css",
  tokenNames: [
    "--ui-radius-control",
    "--ui-radius-surface",
    "--ui-control-height-md",
    "--ui-surface-padding-md",
    "--ui-surface-gap",
  ],
  registry: {
    theme: {
      name: "bobba-theme",
      role: "theme",
      description: "Complete Bobba default product foundation and light/dark token contract.",
      install: "moritzbrantner/ui/bobba-theme",
    },
    components: [],
    blocks: [],
  },
} as const satisfies UiThemeManifest<"bobba">;

const atlasThemeManifest = {
  name: "atlas",
  intent:
    "Dense operational interfaces that prioritize scan speed, comparative metrics, map state, and table-driven decisions.",
  packageStylesheet: "@moritzbrantner/ui/atlas/styles.css",
  tokenNames: [
    "--data-positive",
    "--data-negative",
    "--data-neutral",
    "--trend-up",
    "--trend-down",
    "--trend-flat",
    "--severity-low",
    "--severity-medium",
    "--severity-high",
    "--severity-critical",
    "--map-layer-base",
    "--map-layer-accent",
    "--map-layer-warning",
    "--map-layer-critical",
    "--ui-table-row-height",
    "--ui-table-cell-padding-x",
  ],
  registry: {
    theme: {
      name: "atlas-theme",
      role: "theme",
      description: "Complete Atlas dense dashboard foundation and operational data tokens.",
      install: "moritzbrantner/ui/atlas-theme",
    },
    components: [
      {
        name: "atlas-operations",
        role: "component",
        description:
          "KPI strips, delta cells, map legends, operational tables, alert rails, and sparklines.",
        install: "moritzbrantner/ui/atlas-operations",
      },
    ],
    blocks: [],
  },
} as const satisfies UiThemeManifest<"atlas">;

const studioThemeManifest = {
  name: "studio",
  intent:
    "Creative editing interfaces that make time, layers, tools, media state, and property inspection directly manipulable.",
  packageStylesheet: "@moritzbrantner/ui/studio/styles.css",
  tokenNames: [
    "--editor-selection",
    "--editor-canvas",
    "--editor-canvas-grid",
    "--editor-timeline",
    "--editor-playhead",
    "--editor-layer",
  ],
  registry: {
    theme: {
      name: "studio-theme",
      role: "theme",
      description: "Complete Studio creative-tooling foundation and editor token contract.",
      install: "moritzbrantner/ui/studio-theme",
    },
    components: [
      {
        name: "studio-tools",
        role: "component",
        description:
          "Media transport, timeline, playhead, scrubber, layers, inspector, tool shelf, and before/after tools.",
        install: "moritzbrantner/ui/studio-tools",
      },
    ],
    blocks: [],
  },
} as const satisfies UiThemeManifest<"studio">;

const paperThemeManifest = {
  name: "paper",
  intent:
    "Quiet document interfaces for reading, OCR correction, translation, page navigation, outline work, and annotation.",
  packageStylesheet: "@moritzbrantner/ui/paper/styles.css",
  tokenNames: [
    "--font-body-app",
    "--font-heading-app",
    "--document-annotation",
    "--document-highlight",
    "--document-selection",
    "--document-ruled-background",
    "--document-grid-background",
    "--document-quote",
    "--document-callout",
  ],
  registry: {
    theme: {
      name: "paper-theme",
      role: "theme",
      description:
        "Complete Paper document and research foundation with light/dark document tokens.",
      install: "moritzbrantner/ui/paper-theme",
    },
    components: [
      {
        name: "paper-documents",
        role: "component",
        description:
          "Document pages, page rails, OCR diffing, translation pairs, outlines, and annotation threads.",
        install: "moritzbrantner/ui/paper-documents",
      },
    ],
    blocks: [],
  },
} as const satisfies UiThemeManifest<"paper">;

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
      {
        name: "scholia-research",
        role: "component",
        description:
          "Marginalia, citation trails, interpretation comparison, passage navigation, witnesses, and lemma anchors.",
        install: "moritzbrantner/ui/scholia-research",
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
      {
        name: "pop-rewards",
        role: "component",
        description:
          "Event-driven reward bursts, success feedback, counters, progress, and collection entry motion for Pop.",
        install: "moritzbrantner/ui/pop-rewards",
      },
      {
        name: "pop-rewards-extended",
        role: "component",
        description:
          "Achievements, streaks, completion rings, reward checklists, share success, and reaction bursts.",
        install: "moritzbrantner/ui/pop-rewards-extended",
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
      {
        name: "pulse-spatial",
        role: "component",
        description:
          "Morphing dialogs, kinetic lists, spatial selection, expanding cards, breadcrumbs, and panel stacks.",
        install: "moritzbrantner/ui/pulse-spatial",
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
  bobba: bobbaThemeManifest,
  zleek: zleekThemeManifest,
  atlas: atlasThemeManifest,
  studio: studioThemeManifest,
  paper: paperThemeManifest,
  scholia: scholiaThemeManifest,
  pop: popThemeManifest,
  pulse: pulseThemeManifest,
} as const satisfies Record<BuiltInUiThemeName, UiThemeManifest>;

export {
  atlasThemeManifest,
  bobbaThemeManifest,
  paperThemeManifest,
  popThemeManifest,
  pulseThemeManifest,
  scholiaThemeManifest,
  studioThemeManifest,
  uiThemeManifests,
  zleekThemeManifest,
};
export type { UiThemeManifest, UiThemeRegistryItem, UiThemeRegistryItemRole };
