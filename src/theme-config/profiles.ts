import type { BuiltInUiThemeName } from "./types";

type UiThemeProfile = {
  name: BuiltInUiThemeName;
  label: string;
  description: string;
  surface: "neutral" | "glass" | "dense" | "creative" | "document" | "consumer" | "kinetic";
  density: "compact" | "balanced" | "comfortable";
  motion: "quiet" | "standard" | "expressive" | "energetic";
  bestFor: readonly string[];
};

const uiThemeProfiles = {
  bobba: {
    name: "bobba",
    label: "Default package style",
    description: "Neutral, rounded, and product-safe for general platform applications.",
    surface: "neutral",
    density: "balanced",
    motion: "standard",
    bestFor: ["Shared apps", "Admin flows", "Core components"],
  },
  zleek: {
    name: "zleek",
    label: "Glass interface style",
    description: "Sharper translucent surfaces for polished application shells and launch tools.",
    surface: "glass",
    density: "balanced",
    motion: "expressive",
    bestFor: ["Command centers", "Launch screens", "Presentation surfaces"],
  },
  atlas: {
    name: "atlas",
    label: "Dense dashboard style",
    description: "Crisp, compact, and data-forward for maps, tables, charts, and analytics.",
    surface: "dense",
    density: "compact",
    motion: "quiet",
    bestFor: ["Maps", "Tables", "Operational dashboards"],
  },
  studio: {
    name: "studio",
    label: "Creative tooling style",
    description: "Expressive color and stronger emphasis for media and generation workflows.",
    surface: "creative",
    density: "comfortable",
    motion: "expressive",
    bestFor: ["Media tools", "Storytelling", "Image and video workflows"],
  },
  paper: {
    name: "paper",
    label: "Document and research style",
    description: "Serif-led, document-like surfaces for reading, OCR, text, and research tools.",
    surface: "document",
    density: "compact",
    motion: "quiet",
    bestFor: ["OCR", "Linguistics", "Translation and text tools"],
  },
  scholia: {
    name: "scholia",
    label: "Scholarly archive style",
    description:
      "Serif-led, archival, and compact for historical sources, scholarly editions, citations, and research workbenches.",
    surface: "document",
    density: "compact",
    motion: "quiet",
    bestFor: [
      "Historical sources",
      "Scholarly editions",
      "Source atlases",
      "Theology and reference sites",
    ],
  },
  pop: {
    name: "pop",
    label: "Polished Studio style",
    description:
      "Studio's public-facing, colorful, rounded expression for creator onboarding, showcase, and sharing surfaces.",
    surface: "consumer",
    density: "comfortable",
    motion: "expressive",
    bestFor: ["Creator onboarding", "Public creator surfaces", "Showcase flows"],
  },
  pulse: {
    name: "pulse",
    label: "Kinetic interaction style",
    description:
      "Choreographed movement for opening, closing, expansion, collapse, and spatial-feeling selection changes.",
    surface: "kinetic",
    density: "comfortable",
    motion: "energetic",
    bestFor: ["Expandable interfaces", "Open and close flows", "Selection-heavy controls"],
  },
} as const satisfies Record<BuiltInUiThemeName, UiThemeProfile>;

export { uiThemeProfiles };
export type { UiThemeProfile };
