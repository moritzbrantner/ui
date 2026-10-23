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
type Variant = "baseline" | EffectName;
type BrowserMetricsSpread = Record<keyof BrowserMetrics, { min: number; max: number }>;
const effectNames = Object.keys(effectOverrides) as EffectName[];
const variants: Variant[] = ["baseline", ...effectNames];
// Samples per variant (median is reported); `UI_STYLE_EFFECT_SAMPLES` can raise it, never below 5.
const effectSamples = Math.max(5, Number(process.env.UI_STYLE_EFFECT_SAMPLES) || 5);
// The variant order is shuffled per round; the seed is logged so a run's order can be replayed.
const effectSeed = Number(process.env.UI_STYLE_EFFECT_SEED) || Math.floor(Math.random() * 2 ** 31);

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
      test.setTimeout(900_000);
      const sample = async (variant: Variant) => {
        await page.goto(`/iframe.html?id=design-system-style-specimen--${theme}`);
        await expect(page.getByTestId(`style-specimen-${theme}`)).toBeVisible();
        if (variant !== "baseline") {
          await page.addStyleTag({ content: effectOverrides[variant] });
        }
        const session = await page.context().newCDPSession(page);
        await session.send("Performance.enable");
        try {
          return await measureInteractions(page, session, { openState: true });
        } finally {
          await session.detach();
        }
      };

      // The first sample after the dev server compiles the story is consistently slower, so a
      // discarded warm-up sample keeps that cost out of whichever variant happens to run first.
      await sample("baseline");

      // Each round measures every variant once in a fresh shuffled order, so drift over the run
      // (thermal, GC, background load) spreads across variants instead of biasing the late ones.
      const random = seededRandom(effectSeed);
      const rounds: Array<{ order: Variant[]; metrics: Record<Variant, BrowserMetrics> }> = [];
      for (let round = 0; round < effectSamples; round += 1) {
        const order = shuffle(variants, random);
        const metrics = {} as Record<Variant, BrowserMetrics>;
        for (const variant of order) {
          metrics[variant] = await sample(variant);
        }
        rounds.push({ order, metrics });
      }

      const baselineSamples = rounds.map((round) => round.metrics.baseline);
      const baseline = {
        ...medianBrowserMetrics(baselineSamples),
        spread: spread(baselineSamples),
      };
      const effects = {} as Record<
        EffectName,
        BrowserMetrics & {
          spread: BrowserMetricsSpread;
          share: BrowserMetrics & { spread: BrowserMetricsSpread };
        }
      >;
      for (const effect of effectNames) {
        const withoutSamples = rounds.map((round) => round.metrics[effect]);
        // A share is the paired, signed difference within one round (baseline minus the run with
        // the effect neutralized). Negative shares are kept: they show the share is within noise.
        const shareSamples = rounds.map((round) =>
          differenceBrowserMetrics(round.metrics.baseline, round.metrics[effect]),
        );
        effects[effect] = {
          ...medianBrowserMetrics(withoutSamples),
          spread: spread(withoutSamples),
          share: { ...medianBrowserMetrics(shareSamples), spread: spread(shareSamples) },
        };
      }

      const result = {
        theme,
        method: {
          warmUpSamples: 1,
          samplesPerVariant: effectSamples,
          statistic: "median",
          share: "median of per-round signed differences (baseline - effect neutralized)",
          seed: effectSeed,
        },
        baseline,
        effects,
        rounds,
      };
      const resultJson = JSON.stringify(result, null, 2);
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

function differenceBrowserMetrics(left: BrowserMetrics, right: BrowserMetrics): BrowserMetrics {
  return {
    layoutDuration: left.layoutDuration - right.layoutDuration,
    recalcStyleDuration: left.recalcStyleDuration - right.recalcStyleDuration,
    taskDuration: left.taskDuration - right.taskDuration,
  };
}

const metricNames = ["layoutDuration", "recalcStyleDuration", "taskDuration"] as const;

function medianBrowserMetrics(samples: BrowserMetrics[]): BrowserMetrics {
  const median = (values: number[]) => {
    const sorted = [...values].sort((left, right) => left - right);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };
  return Object.fromEntries(
    metricNames.map((name) => [name, median(samples.map((metrics) => metrics[name]))]),
  ) as BrowserMetrics;
}

function spread(samples: BrowserMetrics[]): BrowserMetricsSpread {
  return Object.fromEntries(
    metricNames.map((name) => {
      const values = samples.map((metrics) => metrics[name]);
      return [name, { min: Math.min(...values), max: Math.max(...values) }];
    }),
  ) as BrowserMetricsSpread;
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

// mulberry32: a tiny deterministic PRNG so a logged seed reproduces the variant order.
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 2 ** 32;
  };
}
