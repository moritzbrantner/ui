import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "tsup";

const packageRoot = fileURLToPath(new URL("./", import.meta.url));
const componentsDir = path.join(packageRoot, "src/components");
const componentTiers = ["stable", "patterns", "data", "shell", "social", "media", "labs"] as const;
const componentEntries = Object.fromEntries(
  componentTiers.flatMap((tier) => {
    const tierDir = path.join(componentsDir, tier);

    return readdirSync(tierDir)
      .filter(
        (fileName) =>
          /\.(ts|tsx)$/.test(fileName) &&
          !fileName.endsWith(".stories.tsx") &&
          !fileName.endsWith(".test.ts") &&
          !fileName.endsWith(".test.tsx"),
      )
      .sort((left, right) => left.localeCompare(right))
      .map((fileName) => {
        const entryName = fileName.replace(/\.(ts|tsx)$/, "");

        return [`components/${tier}/${entryName}`, path.join(tierDir, fileName)] as const;
      });
  }),
);

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: "src/index.ts",
    server: "src/server.ts",
    client: "src/client.ts",
    stable: "src/stable.ts",
    patterns: "src/patterns.ts",
    data: "src/data.ts",
    shell: "src/shell.ts",
    social: "src/social.ts",
    media: "src/media.ts",
    labs: "src/labs.ts",
    zleek: "src/zleek.ts",
    "zleek/server": "src/zleek-server.ts",
    bobba: "src/bobba.ts",
    "bobba/server": "src/bobba-server.ts",
    atlas: "src/atlas.ts",
    "atlas/server": "src/atlas-server.ts",
    studio: "src/studio.ts",
    "studio/server": "src/studio-server.ts",
    paper: "src/paper.ts",
    "paper/server": "src/paper-server.ts",
    pop: "src/pop.ts",
    "pop/server": "src/pop-server.ts",
    themes: "src/themes.tsx",
    "themes/zleek": "src/themes/zleek.tsx",
    "themes/bobba": "src/themes/bobba.tsx",
    "themes/atlas": "src/themes/atlas.tsx",
    "themes/studio": "src/themes/studio.tsx",
    "themes/paper": "src/themes/paper.tsx",
    "themes/pop": "src/themes/pop.tsx",
    "lib/cn": "src/lib/cn.ts",
    ...componentEntries,
  },
  format: ["esm"],
  minify: true,
  outDir: "dist",
  target: "es2022",
});
