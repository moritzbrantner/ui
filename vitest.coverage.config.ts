import { mergeConfig } from "vitest/config";

import baseConfig from "./vitest.config";

export default mergeConfig(baseConfig, {
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "./coverage",
      include: [
        "src/components/stable/**/*.{ts,tsx}",
        "src/components/patterns/**/*.{ts,tsx}",
        "src/components/data/**/*.{ts,tsx}",
        "src/components/shell/**/*.{ts,tsx}",
        "src/components/social/**/*.{ts,tsx}",
        "src/components/media/**/*.{ts,tsx}",
        "src/components/internal/**/*.{ts,tsx}",
      ],
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx", "src/components/labs/**"],
      thresholds: {
        branches: 30,
        functions: 45,
        lines: 45,
        statements: 45,
      },
    },
  },
});
