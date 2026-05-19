import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@moritzbrantner/ui": path.resolve(rootDir, "src/index.ts"),
      "@moritzbrantner/ui/atlas": path.resolve(rootDir, "src/atlas.ts"),
      "@moritzbrantner/ui/bobba": path.resolve(rootDir, "src/bobba.ts"),
      "@moritzbrantner/ui/paper": path.resolve(rootDir, "src/paper.ts"),
      "@moritzbrantner/ui/studio": path.resolve(rootDir, "src/studio.ts"),
      "@moritzbrantner/ui/themes": path.resolve(rootDir, "src/themes.tsx"),
      "@moritzbrantner/ui/zleek": path.resolve(rootDir, "src/zleek.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
