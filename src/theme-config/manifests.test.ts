import { describe, expect, test } from "vitest";

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

describe("theme manifests", () => {
  test("covers every built-in theme with an explicit installable theme contract", () => {
    expect(Object.keys(uiThemeManifests)).toEqual([
      "bobba",
      "zleek",
      "atlas",
      "studio",
      "paper",
      "scholia",
      "pop",
      "pulse",
    ]);
    expect(uiThemeManifests.bobba).toBe(bobbaThemeManifest);
    expect(uiThemeManifests.zleek).toBe(zleekThemeManifest);
    expect(uiThemeManifests.atlas).toBe(atlasThemeManifest);
    expect(uiThemeManifests.studio).toBe(studioThemeManifest);
    expect(uiThemeManifests.paper).toBe(paperThemeManifest);
  });

  test("connects specialized vocabularies to their theme semantics", () => {
    expect(atlasThemeManifest.registry.components.map((item) => item.name)).toEqual([
      "atlas-operations",
    ]);
    expect(atlasThemeManifest.tokenNames).toContain("--map-layer-critical");

    expect(studioThemeManifest.registry.components.map((item) => item.name)).toEqual([
      "studio-tools",
    ]);
    expect(studioThemeManifest.tokenNames).toContain("--editor-playhead");

    expect(paperThemeManifest.registry.components.map((item) => item.name)).toEqual([
      "paper-documents",
    ]);
    expect(zleekThemeManifest.registry.components.map((item) => item.name)).toEqual([
      "zleek-shells",
    ]);
    expect(bobbaThemeManifest.registry.components).toEqual([]);
  });

  test("connects Scholia tokens to source-first components and a block", () => {
    expect(uiThemeManifests.scholia).toBe(scholiaThemeManifest);
    expect(scholiaThemeManifest.packageStylesheet).toBe("@moritzbrantner/ui/scholia/styles.css");
    expect(scholiaThemeManifest.tokenNames).toContain("--document-citation");
    expect(scholiaThemeManifest.registry.components.map((item) => item.name)).toEqual([
      "source-passage",
      "apparatus-list",
      "scholarly-note",
      "scholia-research",
    ]);
    expect(scholiaThemeManifest.registry.blocks.map((item) => item.name)).toEqual([
      "scholia-source-workbench",
    ]);
  });

  test("connects Pop and Pulse to explicit Motion profiles and extended vocabularies", () => {
    expect(uiThemeManifests.pop).toBe(popThemeManifest);
    expect(uiThemeManifests.pulse).toBe(pulseThemeManifest);
    expect(popThemeManifest.motion).toEqual({
      profile: "pop",
      packageImport: "@moritzbrantner/ui/components/patterns/theme-motion",
      registryItem: "moritzbrantner/ui/theme-motion",
    });
    expect(pulseThemeManifest.motion?.profile).toBe("pulse");
    expect(popThemeManifest.registry.components.map((item) => item.name)).toEqual([
      "theme-motion",
      "pop-rewards",
      "pop-rewards-extended",
    ]);
    expect(pulseThemeManifest.registry.components.map((item) => item.name)).toEqual([
      "theme-motion",
      "pulse-spatial",
    ]);
    expect(pulseThemeManifest.tokenNames).toContain("--ui-motion-ease-emphasized");
  });
});
