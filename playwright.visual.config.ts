import { defineConfig, devices } from "@playwright/test";

const consumerDist = process.env.UI_EDITOR_CONSUMER_DIST;
const quotedConsumerDist = consumerDist ? `'${consumerDist.replaceAll("'", "'\\''")}'` : undefined;

export default defineConfig({
  testDir: "./visual",
  testMatch: consumerDist ? "**/editor-consumer.acceptance.ts" : "**/*.spec.ts",
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
