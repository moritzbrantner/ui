import { defineConfig, devices } from "@playwright/test";

const consumerDist = process.env.UI_EDITOR_CONSUMER_DIST;
const quotedConsumerDist = consumerDist ? `'${consumerDist.replaceAll("'", "'\\''")}'` : undefined;
// The browser style-performance budgets run only in the dedicated performance job
// (`bun run test:style-performance`), not in the generic visual suite.
const runStylePerformance = process.env.UI_STYLE_PERFORMANCE === "1";

export default defineConfig({
  testDir: "./visual",
  testMatch: consumerDist ? "**/editor-consumer.acceptance.ts" : "**/*.spec.ts",
  testIgnore: runStylePerformance ? undefined : "**/style-performance.spec.ts",
  fullyParallel: true,
  timeout: 45_000,
  workers: 8,
  maxFailures: 1,
  globalSetup: "./visual/global-setup.ts",
  globalTeardown: "./visual/global-teardown.ts",
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://localhost:6007",
    browserName: "chromium",
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: consumerDist
      ? `vite preview --outDir ${quotedConsumerDist} --host localhost --port 6007 --strictPort`
      : "storybook dev -p 6007 --host localhost --no-open --config-dir .storybook",
    port: 6007,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
