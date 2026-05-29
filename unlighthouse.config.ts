import { defineUnlighthouseConfig } from "unlighthouse/config";

const storybookGlobals = encodeURIComponent("designSystem:bobba;theme:light");
const storybookStoryIds = [
  "components-stable-primitive-components--overview",
  "components-forms-inputs-form-controls--basic",
  "components-data-display-data-grid--default",
  "components-layout-app-shell--comprehensive-app-shell",
  "components-social-overview--social-feed",
  "patterns-release-readiness--consumer-dashboard-shell-story",
  "components-data-display-chart--business-dashboard",
  "components-forms-inputs-calendar--with-events",
  "components-forms-inputs-combobox--basic",
  "components-navigation-navbar--web",
];

export default defineUnlighthouseConfig({
  site: process.env.UNLIGHTHOUSE_SITE ?? "http://127.0.0.1:6008",
  urls: storybookStoryIds.map(
    (storyId) => `/iframe.html?id=${storyId}&globals=${storybookGlobals}`,
  ),
  outputPath: "./unlighthouse-report",
  cache: false,
  ci: {
    budget: {
      performance: 45,
      accessibility: 90,
      "best-practices": 90,
    },
    buildStatic: true,
  },
  lighthouseOptions: {
    onlyCategories: ["performance", "accessibility", "best-practices"],
  },
  puppeteerClusterOptions: {
    maxConcurrency: 1,
  },
});
