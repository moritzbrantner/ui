import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./visual",
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
    command: "storybook dev -p 6007 --host localhost --no-open --config-dir .storybook",
    port: 6007,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
