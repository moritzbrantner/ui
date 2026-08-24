import { describe, expect, test } from "vitest";

import { scholiaThemeManifest, uiThemeManifests } from "./manifests";

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
});
