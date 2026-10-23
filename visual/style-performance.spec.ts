import { mkdir, writeFile } from "node:fs/promises";

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

// Effect-heavy themes get a per-effect cost breakdown: each run neutralizes one effect family
// with an injected override, so its share of the interaction cost is measured instead of guessed.
const effectBreakdownThemes = ["bobba", "zleek", "pulse"] as const;
const effectOverrides = {
  "backdrop-filter":
    "*, *::before, *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }",
  "gradient-shine": "*, *::before, *::after { background-image: none !important; }",
  shadow: "*, *::before, *::after { box-shadow: none !important; }",
  "state-animation":
    "*, *::before, *::after { animation: none !important; transition: none !important; }",
} as const;
type EffectName = keyof typeof effectOverrides;

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

      try {
        const metrics = await measureInteractions(page, session);
        const result = {
          theme,
          interactions: 24,
          metrics,
          budgets: {
            layoutDuration: MAX_LAYOUT_SECONDS,
            recalcStyleDuration: MAX_RECALC_STYLE_SECONDS,
            taskDuration: MAX_TASK_SECONDS,
          },
        };
        const resultJson = JSON.stringify(result, null, 2);

        await mkdir("performance-results/style-performance", { recursive: true });
        await writeFile(`performance-results/style-performance/${theme}.json`, resultJson);
        console.log(`[style-performance] ${JSON.stringify(result)}`);

        await testInfo.attach(`${theme}-style-performance.json`, {
          body: resultJson,
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

  for (const theme of effectBreakdownThemes) {
    test(`${theme} effect cost breakdown`, async ({ page }, testInfo) => {
      test.setTimeout(300_000);
      // Browser metrics are noisy; the faster of two samples per variant keeps the shares stable.
      const measure = async (effect?: EffectName) => {
        const first = await sample(effect);
        const second = await sample(effect);
        return first.taskDuration <= second.taskDuration ? first : second;
      };
      const sample = async (effect?: EffectName) => {
        await page.goto(`/iframe.html?id=design-system-style-specimen--${theme}`);
        await expect(page.getByTestId(`style-specimen-${theme}`)).toBeVisible();
        if (effect) {
          await page.addStyleTag({ content: effectOverrides[effect] });
        }
        const session = await page.context().newCDPSession(page);
        await session.send("Performance.enable");
        try {
          return await measureInteractions(page, session, { openState: true });
        } finally {
          await session.detach();
        }
      };

      const baseline = await measure();
      const effects = {} as Record<EffectName, BrowserMetrics & { share: BrowserMetrics }>;
      for (const effect of Object.keys(effectOverrides) as EffectName[]) {
        const without = await measure(effect);
        effects[effect] = { ...without, share: subtractBrowserMetrics(baseline, without) };
      }

      const resultJson = JSON.stringify({ theme, baseline, effects }, null, 2);
      await mkdir("performance-results/style-performance", { recursive: true });
      await writeFile(`performance-results/style-performance/${theme}-effects.json`, resultJson);
      console.log(`[style-performance:effects] ${JSON.stringify({ theme, baseline, effects })}`);
      await testInfo.attach(`${theme}-effects.json`, {
        body: resultJson,
        contentType: "application/json",
      });
    });
  }
});

async function measureInteractions(
  page: Page,
  session: CDPSession,
  { openState = false }: { openState?: boolean } = {},
) {
  const before = await readBrowserMetrics(session);

  // Exercise the most common state changes. This intentionally runs in real Chromium rather
  // than JSDOM so CSS selector matching, style recalculation, layout, paint preparation, and
  // theme-specific effects participate in the measurement.
  const primaryAction = page.getByRole("button", { name: "Primary action" });

  for (let index = 0; index < 12; index += 1) {
    await primaryAction.hover();
    if (openState) {
      await setCardOpenState(page, index % 2 === 0);
    }
    // Keep the pointer on the control until its finite hover animations (Pop/Pulse) have
    // run, so the sampled metrics include the animated frames rather than only the
    // selector toggle.
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) =>
            Number.isFinite(animation.effect?.getComputedTiming().endTime ?? Infinity),
          )
          .map((animation) => animation.finished.catch(() => undefined)),
      ),
    );
    await page.getByRole("heading", { level: 1 }).hover();
  }

  return subtractBrowserMetrics(await readBrowserMetrics(session), before);
}

// The specimen has no overlay, so the open-state cost is sampled by toggling `data-state="open"`
// on its cards, which drives the same glass/motion selectors as an opened overlay surface.
async function setCardOpenState(page: Page, open: boolean) {
  await page.evaluate((isOpen) => {
    for (const card of document.querySelectorAll('[data-slot="card"]')) {
      if (isOpen) {
        card.setAttribute("data-state", "open");
      } else {
        card.removeAttribute("data-state");
      }
    }
  }, open);
}

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

  const requireMetric = (name: string) => {
    const value = metrics.get(name);

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`Chromium did not report a finite ${name} performance metric.`);
    }

    return value;
  };

  return {
    layoutDuration: requireMetric("LayoutDuration"),
    recalcStyleDuration: requireMetric("RecalcStyleDuration"),
    taskDuration: requireMetric("TaskDuration"),
  };
}

function subtractBrowserMetrics(after: BrowserMetrics, before: BrowserMetrics): BrowserMetrics {
  return {
    layoutDuration: Math.max(0, after.layoutDuration - before.layoutDuration),
    recalcStyleDuration: Math.max(0, after.recalcStyleDuration - before.recalcStyleDuration),
    taskDuration: Math.max(0, after.taskDuration - before.taskDuration),
  };
}
