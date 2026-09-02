import { expect, test, type CDPSession, type Page } from "@playwright/test";

type BrowserMetrics = {
  layoutDuration: number;
  recalcStyleDuration: number;
  taskDuration: number;
};

const themeStories = [
  "bobba",
  "zleek",
  "atlas",
  "studio",
  "paper",
  "scholia",
  "pop",
  "pulse",
] as const;

const MAX_RECALC_STYLE_SECONDS = 0.75;
const MAX_LAYOUT_SECONDS = 0.75;
const MAX_TASK_SECONDS = 8;

test.describe("style performance", () => {
  for (const theme of themeStories) {
    test(`${theme} stays within browser style/layout smoke budgets`, async ({ page }, testInfo) => {
      await page.goto(`/iframe.html?id=design-system-style-specimen--${theme}`);
      await expect(page.getByTestId(`style-specimen-${theme}`)).toBeVisible();
      expect(
        await hasMatchingThemeTokenRule(page, theme),
        `${theme} scoped tokens are loaded`,
      ).toBe(true);

      const session = await page.context().newCDPSession(page);
      await session.send("Performance.enable");
      const before = await readBrowserMetrics(session);

      // Exercise the most common state changes. This intentionally runs in real Chromium rather
      // than JSDOM so CSS selector matching, style recalculation, layout, paint preparation, and
      // theme-specific effects participate in the measurement.
      try {
        for (let index = 0; index < 12; index += 1) {
          await page.getByRole("button", { name: "Primary action" }).hover();
          await page.getByRole("heading", { name: "Section heading" }).hover();
        }

        const metrics = subtractBrowserMetrics(await readBrowserMetrics(session), before);

        await testInfo.attach(`${theme}-style-performance.json`, {
          body: JSON.stringify(
            {
              theme,
              interactions: 24,
              metrics,
              budgets: {
                layoutDuration: MAX_LAYOUT_SECONDS,
                recalcStyleDuration: MAX_RECALC_STYLE_SECONDS,
                taskDuration: MAX_TASK_SECONDS,
              },
            },
            null,
            2,
          ),
          contentType: "application/json",
        });

        expect(metrics.recalcStyleDuration, `${theme} style recalculation`).toBeLessThan(
          MAX_RECALC_STYLE_SECONDS,
        );
        expect(metrics.layoutDuration, `${theme} layout`).toBeLessThan(MAX_LAYOUT_SECONDS);
        expect(metrics.taskDuration, `${theme} browser task time`).toBeLessThan(MAX_TASK_SECONDS);
      } finally {
        await session.detach();
      }
    });
  }
});

async function hasMatchingThemeTokenRule(page: Page, theme: (typeof themeStories)[number]) {
  return page.evaluate((themeName) => {
    const specimen = document.querySelector(`[data-testid="style-specimen-${themeName}"]`);

    if (!specimen) {
      return false;
    }

    return Array.from(document.styleSheets).some((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules).some(
          (rule) =>
            rule instanceof CSSStyleRule &&
            rule.selectorText.includes("[data-ui-theme") &&
            specimen.matches(rule.selectorText) &&
            rule.style.getPropertyValue("--background").trim().length > 0,
        );
      } catch {
        return false;
      }
    });
  }, theme);
}

async function readBrowserMetrics(session: CDPSession): Promise<BrowserMetrics> {
  const response = (await session.send("Performance.getMetrics")) as {
    metrics: Array<{ name: string; value: number }>;
  };

  const metrics = new Map(response.metrics.map((metric) => [metric.name, metric.value]));

  return {
    layoutDuration: metrics.get("LayoutDuration") ?? 0,
    recalcStyleDuration: metrics.get("RecalcStyleDuration") ?? 0,
    taskDuration: metrics.get("TaskDuration") ?? 0,
  };
}

function subtractBrowserMetrics(after: BrowserMetrics, before: BrowserMetrics): BrowserMetrics {
  return {
    layoutDuration: Math.max(0, after.layoutDuration - before.layoutDuration),
    recalcStyleDuration: Math.max(0, after.recalcStyleDuration - before.recalcStyleDuration),
    taskDuration: Math.max(0, after.taskDuration - before.taskDuration),
  };
}
