import type { BuiltInUiThemeName } from "./types";

type UiThemeProfile = {
  name: BuiltInUiThemeName;
  label: string;
  description: string;
  surface: "neutral" | "glass" | "dense" | "creative" | "document" | "consumer" | "realtime";
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
  pop: {
    name: "pop",
    label: "Playful consumer style",
    description: "Colorful, rounded, and motion-forward for polished consumer product surfaces.",
    surface: "consumer",
    density: "comfortable",
    motion: "expressive",
    bestFor: ["Consumer apps", "Creator tools", "Onboarding surfaces"],
  },
  pulse: {
    name: "pulse",
    label: "Energized motion style",
    description:
      "Electric color, responsive scale, and animated affordances for surfaces where interactions should feel active.",
    surface: "realtime",
    density: "comfortable",
    motion: "energetic",
    bestFor: ["Realtime tools", "Launch moments", "High-touch interactions"],
  },
} as const satisfies Record<BuiltInUiThemeName, UiThemeProfile>;

export { uiThemeProfiles };
export type { UiThemeProfile };
