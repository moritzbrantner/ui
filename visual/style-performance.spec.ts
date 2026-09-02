import { expect, test, type Page } from "@playwright/test";

type BrowserMetrics = {
  layoutDuration: number;
  recalcStyleDuration: number;
  taskDuration: number;
};

const themeStories = ["bobba", "zleek", "atlas", "studio", "paper", "scholia", "pop", "pulse"] as const;

const MAX_RECALC_STYLE_SECONDS = 0.75;
const MAX_LAYOUT_SECONDS = 0.75;
const MAX_TASK_SECONDS = 8;

test.describe("style performance", () => {
  for (const theme of themeStories) {
    test(`${theme} stays within browser style/layout smoke budgets`, async ({ page }) => {
      await page.goto(`/iframe.html?id=design-system-style-specimen--${theme}`);
      await expect(page.getByTestId(`style-specimen-${theme}`)).toBeVisible();

      // Exercise the most common state changes. This intentionally runs in real Chromium rather
      // than JSDOM so CSS selector matching, style recalculation, layout, paint preparation, and
      // theme-specific effects participate in the measurement.
      for (let index = 0; index < 12; index += 1) {
        await page.getByRole("button", { name: "Primary action" }).hover();
        await page.getByRole("heading", { name: "Section heading" }).hover();
      }

      const metrics = await readBrowserMetrics(page);

      expect(metrics.recalcStyleDuration, `${theme} style recalculation`).toBeLessThan(
        MAX_RECALC_STYLE_SECONDS,
      );
      expect(metrics.layoutDuration, `${theme} layout`).toBeLessThan(MAX_LAYOUT_SECONDS);
      expect(metrics.taskDuration, `${theme} browser task time`).toBeLessThan(MAX_TASK_SECONDS);
    });
  }
});

async function readBrowserMetrics(page: Page): Promise<BrowserMetrics> {
  const session = await page.context().newCDPSession(page);
  await session.send("Performance.enable");
  const response = (await session.send("Performance.getMetrics")) as {
    metrics: Array<{ name: string; value: number }>;
  };
  await session.detach();

  const metrics = new Map(response.metrics.map((metric) => [metric.name, metric.value]));

  return {
    layoutDuration: metrics.get("LayoutDuration") ?? 0,
    recalcStyleDuration: metrics.get("RecalcStyleDuration") ?? 0,
    taskDuration: metrics.get("TaskDuration") ?? 0,
  };
}
