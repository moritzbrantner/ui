import { describe, expect, test } from "vitest";

import {
  popThemeManifest,
  pulseThemeManifest,
  scholiaThemeManifest,
  uiThemeManifests,
} from "./manifests";

describe("theme manifests", () => {
  test("connects Scholia tokens to installable source components and a block", () => {
    expect(uiThemeManifests.scholia).toBe(scholiaThemeManifest);
    expect(scholiaThemeManifest.packageStylesheet).toBe("@moritzbrantner/ui/scholia/styles.css");
    expect(scholiaThemeManifest.tokenNames).toContain("--document-citation");
    expect(scholiaThemeManifest.registry.theme.name).toBe("scholia-theme");
    expect(scholiaThemeManifest.registry.components.map((item) => item.name)).toEqual([
      "source-passage",
      "apparatus-list",
      "scholarly-note",
    ]);
    expect(scholiaThemeManifest.registry.blocks.map((item) => item.name)).toEqual([
      "scholia-source-workbench",
    ]);
  });

  test("connects Pop and Pulse to explicit Motion profiles and registry source", () => {
    expect(uiThemeManifests.pop).toBe(popThemeManifest);
    expect(uiThemeManifests.pulse).toBe(pulseThemeManifest);
    expect(popThemeManifest.motion).toEqual({
      profile: "pop",
      packageImport: "@moritzbrantner/ui/components/patterns/theme-motion",
      registryItem: "moritzbrantner/ui/theme-motion",
    });
    expect(pulseThemeManifest.motion?.profile).toBe("pulse");
    expect(popThemeManifest.registry.theme.name).toBe("pop-theme");
    expect(pulseThemeManifest.registry.theme.name).toBe("pulse-theme");
    expect(popThemeManifest.registry.components.map((item) => item.name)).toEqual(["theme-motion"]);
    expect(pulseThemeManifest.tokenNames).toContain("--ui-motion-ease-emphasized");
  });
});
