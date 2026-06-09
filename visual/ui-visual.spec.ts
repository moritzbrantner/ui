import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

type AxeViolation = Awaited<
  ReturnType<AxeBuilder["analyze"]>
>["violations"][number];

const accessibilityExpect = expect.extend({
  toHaveNoViolations(violations: AxeViolation[]) {
    const pass = violations.length === 0;

    return {
      pass,
      message: () =>
        pass
          ? "Expected axe to report at least one accessibility violation."
          : formatA11yViolations(violations),
    };
  },
});

const viewports = [
  { name: "narrow-mobile", width: 360, height: 740 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];
const storyIds = [
  "components-actions-button--variants",
  "components-forms-inputs-form-controls--basic",
  "components-forms-inputs-stepper--horizontal",
  "components-navigation-shortcut-help--dialog",
  "components-feedback-connection-status--states",
  "components-feedback-live-indicator--states",
  "components-feedback-celebration-callout--milestone",
  "components-stable-primitive-components--overview",
  "components-overlays-dialog--open",
  "components-overlay-sheet--basic",
  "components-data-display-data-grid--default",
  "components-forms-inputs-filter-bar--default",
  "components-forms-inputs-query-builder--advanced-controls",
  "components-layout-app-shell--comprehensive-app-shell",
  "components-forms-inputs-form-layout--validated-interaction",
  "components-feedback-toaster--usage",
  "components-navigation-navbar--web",
  "components-navigation-navbar--mobile",
  "components-navigation-navbar--mobile-many-groups",
  "components-actions-toolbar--default",
  "components-navigation-tabs--basic",
  "components-navigation-pagination--responsive",
  "components-overlay-action-menu--basic",
  "components-overlay-action-menu--with-descriptions-and-shortcuts",
  "components-overlay-context-action-menu--right-click-target",
  "components-overlay-action-sheet--bottom",
  "components-overlay-action-sheet--right-side",
  "components-overlay-responsive-action-menu--desktop-mode",
  "components-overlay-responsive-action-menu--mobile-mode",
  "components-overlay-hover-preview--profile-preview",
  "components-data-display-metric-strip--with-deltas",
  "components-data-display-process-map--release-lifecycle",
  "components-data-display-comparison-matrix--plan-comparison",
  "components-data-display-comparison-matrix--mobile-scroll",
  "components-forms-inputs-calendar--with-events",
  "components-data-display-relationship-map--stakeholder-map",
  "components-data-display-infographic--release-summary",
  "components-data-display-calendar-card-days--default",
  "components-data-display-document-viewer--ocr-report-viewer",
  "components-data-display-resource-list--default",
  "components-editors-annotation-canvas--default",
  "components-social-overview--social-feed",
  "components-social-overview--chat-thread-preview",
  "components-layout-workbench-layout--full-workbench",
  "design-system-theme-showcase--pop-consumer-surface",
  "design-system-theme-showcase--pulse-realtime-surface",
  "patterns-release-readiness--consumer-dashboard-shell-story",
  "patterns-release-readiness--forms-settings-story",
];
const releaseReadinessThemeStories = [
  {
    storyId: "patterns-release-readiness--consumer-dashboard-shell-story",
    designSystem: "atlas",
  },
  {
    storyId: "patterns-release-readiness--forms-settings-story",
    designSystem: "paper",
  },
] as const;
const zleekGlassStories = [
  "components-layout-app-shell--comprehensive-app-shell",
  "components-navigation-navbar--web",
  "components-overlays-dialog--open",
  "components-overlay-sheet--basic",
  "components-overlay-action-menu--with-descriptions-and-shortcuts",
  "components-overlay-hover-preview--profile-preview",
] as const;
const zleekGlassViewports = new Set(["mobile", "desktop"]);
const uiThemes = [
  "bobba",
  "zleek",
  "atlas",
  "studio",
  "paper",
  "pop",
  "pulse",
] as const;
const colorSchemes = ["light", "dark"] as const;
const horizontallyScrollableStories = new Set([
  "components-stable-primitive-components--overview",
  "components-data-display-data-grid--default",
  "components-overlay-action-menu--basic",
  "components-overlay-action-menu--with-descriptions-and-shortcuts",
  "components-overlay-context-action-menu--right-click-target",
  "components-overlay-action-sheet--bottom",
  "components-overlay-action-sheet--right-side",
  "components-overlay-responsive-action-menu--desktop-mode",
  "components-overlay-responsive-action-menu--mobile-mode",
  "components-overlay-hover-preview--profile-preview",
  "components-data-display-calendar-card-days--default",
  "components-data-display-comparison-matrix--plan-comparison",
  "components-data-display-relationship-map--stakeholder-map",
  "components-data-display-process-map--release-lifecycle",
  "patterns-release-readiness--consumer-dashboard-shell-story",
]);
const denseControlStories = new Set([
  "components-data-display-calendar-card-days--default",
  "components-forms-inputs-form-controls--basic",
  "components-stable-primitive-components--overview",
]);
const internalScrollStories = new Map([
  [
    "components-data-display-data-grid--default",
    '[data-slot="table-container"]',
  ],
  [
    "components-data-display-comparison-matrix--plan-comparison",
    '[data-slot="comparison-matrix"]',
  ],
  [
    "components-data-display-comparison-matrix--mobile-scroll",
    '[data-slot="comparison-matrix"]',
  ],
  [
    "components-data-display-calendar-card-days--default",
    '[data-slot="calendar"]',
  ],
  [
    "components-data-display-resource-list--default",
    '[data-slot="table-container"]',
  ],
  [
    "components-data-display-process-map--release-lifecycle",
    '[data-slot="process-map"]',
  ],
  [
    "components-data-display-relationship-map--stakeholder-map",
    '[data-slot="relationship-map-scroll-area"]',
  ],
  [
    "components-layout-workbench-layout--full-workbench",
    '[data-slot="workbench-canvas"]',
  ],
]);

const grepSafeStoryTitles = new Map([
  [
    "design-system-theme-showcase--pop-consumer-surface",
    "design-system-theme-showcase--consumer-surface",
  ],
]);

const popMotionTestDetails = { tag: "@pop-motion" } as const;

for (const viewport of viewports) {
  test.describe(`visual layout at ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const storyId of storyIds) {
      for (const colorScheme of colorSchemes) {
        test(`${formatStoryTitle(storyId)} has stable ${colorScheme} layout`, async ({
          page,
        }) => {
          await gotoStory(page, storyId, {
            designSystem: "bobba",
            theme: colorScheme,
          });
          await verifyPageLayout(page, storyId);
        });
      }
    }

    for (const designSystem of uiThemes) {
      test(`primitive components render ${formatDesignSystemTitle(designSystem)}`, async ({
        page,
      }) => {
        await gotoStory(
          page,
          "components-stable-primitive-components--overview",
          {
            designSystem,
            theme: "light",
          },
        );
        await verifyPageLayout(
          page,
          "components-stable-primitive-components--overview",
        );
      });
    }

    for (const { storyId, designSystem } of releaseReadinessThemeStories) {
      test(`${storyId} renders ${designSystem}`, async ({ page }) => {
        await gotoStory(page, storyId, { designSystem, theme: "light" });
        await verifyPageLayout(page, storyId);
      });
    }

    if (zleekGlassViewports.has(viewport.name)) {
      for (const storyId of zleekGlassStories) {
        for (const colorScheme of colorSchemes) {
          test(`${storyId} renders zleek glass ${colorScheme}`, async ({
            page,
          }) => {
            await gotoStory(page, storyId, {
              designSystem: "zleek",
              theme: colorScheme,
            });
            await verifyPageLayout(page, storyId);
          });
        }
      }
    }
  });
}

test.describe("glass motion preferences", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("does not run zleek shine animation when reduced motion is requested", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoStory(page, "components-actions-button--variants", {
      designSystem: "zleek",
      theme: "light",
    });

    const button = page
      .locator('[data-slot="button"]:not([data-variant="link"])')
      .first();
    await button.hover();

    const animationName = await button.evaluate(
      (element) => window.getComputedStyle(element).animationName,
    );

    expect(animationName).not.toContain("ui-glass-shine");
  });

  test(
    "does not run pop theme motion when reduced motion is requested",
    popMotionTestDetails,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoStory(page, "components-actions-button--variants", {
        designSystem: "pop",
        theme: "light",
      });

      const button = page
        .locator('[data-slot="button"]:not([data-variant="link"])')
        .first();
      await button.hover();

      await expectAnimationNameNotContains(button, "ui-pop-");

      await gotoStory(page, "components-feedback-connection-status--states", {
        designSystem: "pop",
        theme: "light",
      });

      const syncingStatus = page.locator(
        '[data-slot="connection-status"][data-status="syncing"]',
      );
      const pendingStatus = syncingStatus.first();
      await pendingStatus.evaluate((element) =>
        element.setAttribute("data-pending", "true"),
      );

      await expectAnimationNameNotContains(syncingStatus.first(), "ui-pop-");
      await expectAnimationNameNotContains(pendingStatus, "ui-pop-");

      await gotoStory(
        page,
        "components-feedback-celebration-callout--milestone",
        {
          designSystem: "pop",
          theme: "light",
        },
      );

      const callout = page.locator('[data-slot="celebration-callout"]').first();
      await callout.hover();

      await expectAnimationNameNotContains(callout, "ui-pop-");

      await gotoStory(page, "components-forms-inputs-form-controls--basic", {
        designSystem: "pop",
        theme: "light",
      });

      const checkbox = page
        .locator('[data-slot="checkbox"][data-state="checked"]')
        .first();
      const checkboxIndicator = checkbox.locator(
        '[data-slot="checkbox-indicator"]',
      );
      const checkedRadio = page
        .locator('[data-slot="radio-group-item"][data-state="checked"]')
        .first();
      const checkedSwitch = page
        .locator('[data-slot="switch"][data-state="checked"]')
        .first();
      const checkedSwitchThumb = checkedSwitch.locator(
        '[data-slot="switch-thumb"]',
      );

      await expectAnimationNameNotContains(checkbox, "ui-pop-");
      await expectAnimationNameNotContains(checkboxIndicator, "ui-pop-");
      await expectAnimationNameNotContains(checkedRadio, "ui-pop-");
      await expectAnimationNameNotContains(checkedSwitch, "ui-pop-");
      await expectAnimationNameNotContains(checkedSwitchThumb, "ui-pop-");

      await gotoStory(page, "components-stable-primitive-forms--overview", {
        designSystem: "pop",
        theme: "light",
      });

      const input = page.locator('[data-slot="input"]').first();
      const inputGroup = page.locator('[data-slot="input-group"]').first();
      const selectTrigger = page
        .locator('[data-slot="select-trigger"]')
        .first();
      const otpSlot = page.locator('[data-slot="input-otp-slot"]').first();
      await input.focus();
      await inputGroup
        .locator('[data-slot="input-group-control"]')
        .first()
        .focus();
      await selectTrigger.focus();
      await otpSlot.evaluate((element) =>
        element.setAttribute("data-active", "true"),
      );

      await expectAnimationNameNotContains(input, "ui-pop-");
      await expectAnimationNameNotContains(inputGroup, "ui-pop-");
      await expectAnimationNameNotContains(selectTrigger, "ui-pop-");
      await expectAnimationNameNotContains(otpSlot, "ui-pop-");

      await gotoStory(page, "components-stable-primitive-actions--overview", {
        designSystem: "pop",
        theme: "light",
      });

      const paginationLink = page
        .locator('[data-slot="pagination-link"]')
        .first();
      const kbd = page.locator('[data-slot="kbd"]').first();
      await paginationLink.hover();
      await kbd.evaluate((element) =>
        element.setAttribute("data-state", "active"),
      );

      await expectAnimationNameNotContains(paginationLink, "ui-pop-");
      await expectAnimationNameNotContains(kbd, "ui-pop-");

      await gotoStory(page, "components-stable-primitive-layout--overview", {
        designSystem: "pop",
        theme: "light",
      });

      const codeBlock = page.locator('[data-slot="code-block"]').first();
      const stat = page.locator('[data-slot="stat"]').first();
      await codeBlock.hover();
      await stat.hover();

      await expectAnimationNameNotContains(codeBlock, "ui-pop-");
      await expectAnimationNameNotContains(stat, "ui-pop-");

      await gotoStory(
        page,
        "components-stable-primitive-components--overview",
        {
          designSystem: "pop",
          theme: "light",
        },
      );

      const tableRow = page.locator('[data-slot="table-row"]').last();
      await tableRow.hover();

      await expectAnimationNameNotContains(tableRow, "ui-pop-");
    },
  );

  test("does not run pulse theme motion when reduced motion is requested", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoStory(page, "components-actions-button--variants", {
      designSystem: "pulse",
      theme: "light",
    });

    const button = page
      .locator('[data-slot="button"]:not([data-variant="link"])')
      .first();
    await button.hover();

    await expectAnimationNameNotContains(button, "ui-pulse-");

    await gotoStory(page, "components-feedback-connection-status--states", {
      designSystem: "pulse",
      theme: "light",
    });

    const syncingStatus = page.locator(
      '[data-slot="connection-status"][data-status="syncing"]',
    );
    const pendingStatus = syncingStatus.first();
    await pendingStatus.evaluate((element) =>
      element.setAttribute("data-pending", "true"),
    );

    await expectAnimationNameNotContains(syncingStatus.first(), "ui-pulse-");
    await expectAnimationNameNotContains(pendingStatus, "ui-pulse-");

    await gotoStory(page, "components-feedback-live-indicator--states", {
      designSystem: "pulse",
      theme: "light",
    });

    const liveIndicator = page
      .locator('[data-slot="live-indicator"][data-pulse="true"]')
      .first();
    const liveIndicatorDot = liveIndicator.locator(
      '[data-slot="live-indicator-dot"]',
    );

    await expectAnimationNameNotContains(liveIndicator, "ui-pulse-");
    await expectAnimationNameNotContains(liveIndicatorDot, "ui-pulse-");
  });

  test("runs pulse signal motion for syncing connection status", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoStory(page, "components-feedback-connection-status--states", {
      designSystem: "pulse",
      theme: "light",
    });

    const syncingStatus = page
      .locator('[data-slot="connection-status"][data-status="syncing"]')
      .first();

    await expectAnimationNameContains(syncingStatus, "ui-pulse-signal");
  });

  test("runs pulse signal motion for pulsing live indicators", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoStory(page, "components-feedback-live-indicator--states", {
      designSystem: "pulse",
      theme: "light",
    });

    const liveIndicator = page
      .locator('[data-slot="live-indicator"][data-pulse="true"]')
      .first();
    const liveIndicatorDot = liveIndicator.locator(
      '[data-slot="live-indicator-dot"]',
    );

    await expectAnimationNameContains(liveIndicator, "ui-pulse-signal");
    await expectAnimationNameContains(liveIndicatorDot, "ui-pulse-signal");
  });

  test(
    "runs pop snap motion on hovered buttons",
    popMotionTestDetails,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await gotoStory(page, "components-actions-button--variants", {
        designSystem: "pop",
        theme: "light",
      });

      const button = page
        .locator('[data-slot="button"]:not([data-variant="link"])')
        .first();
      await button.hover();

      await expectAnimationNameContains(button, "ui-pop-snap");
    },
  );

  test(
    "runs pop lift motion on hovered celebration callouts",
    popMotionTestDetails,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await gotoStory(
        page,
        "components-feedback-celebration-callout--milestone",
        {
          designSystem: "pop",
          theme: "light",
        },
      );

      const callout = page.locator('[data-slot="celebration-callout"]').first();
      await callout.hover();

      await expectAnimationNameContains(callout, "ui-pop-lift");
    },
  );

  test(
    "runs pop state motion on checked form controls",
    popMotionTestDetails,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await gotoStory(page, "components-forms-inputs-form-controls--basic", {
        designSystem: "pop",
        theme: "light",
      });

      const checkbox = page
        .locator('[data-slot="checkbox"][data-state="checked"]')
        .first();
      const checkboxIndicator = checkbox.locator(
        '[data-slot="checkbox-indicator"]',
      );
      const checkboxIcon = checkboxIndicator.locator("svg");
      const checkedRadio = page
        .locator('[data-slot="radio-group-item"][data-state="checked"]')
        .first();
      const checkedSwitch = page
        .locator('[data-slot="switch"][data-state="checked"]')
        .first();
      const checkedSwitchThumb = checkedSwitch.locator(
        '[data-slot="switch-thumb"]',
      );

      await expectAnimationNameContains(checkbox, "ui-pop-state-burst");
      await expectAnimationNameContains(
        checkboxIndicator,
        "ui-pop-indicator-pop",
      );
      await expectAnimationNameContains(checkboxIcon, "ui-pop-check-draw");
      await expectAnimationNameContains(checkedRadio, "ui-pop-state-burst");
      await expectAnimationNameContains(checkedSwitch, "ui-pop-state-burst");
      await expectAnimationNameContains(
        checkedSwitchThumb,
        "ui-pop-thumb-spring",
      );
    },
  );

  test(
    "runs pop focus color on form primitives",
    popMotionTestDetails,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await gotoStory(page, "components-stable-primitive-forms--overview", {
        designSystem: "pop",
        theme: "light",
      });

      const input = page.locator('[data-slot="input"]').first();
      await input.focus();
      await expectPopTreatment(input);

      const inputGroup = page.locator('[data-slot="input-group"]').first();
      await inputGroup
        .locator('[data-slot="input-group-control"]')
        .first()
        .focus();
      await expectPopTreatment(inputGroup);

      const selectTrigger = page
        .locator('[data-slot="select-trigger"]')
        .first();
      await selectTrigger.focus();
      await expectPopTreatment(selectTrigger);

      const otpSlot = page.locator('[data-slot="input-otp-slot"]').first();
      await otpSlot.evaluate((element) =>
        element.setAttribute("data-active", "true"),
      );
      await expectPopTreatment(otpSlot);
      await expectAnimationNameNotContains(input, "ui-pop-");
    },
  );

  test(
    "runs pop snap and color on navigation primitives",
    popMotionTestDetails,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await gotoStory(page, "components-stable-primitive-actions--overview", {
        designSystem: "pop",
        theme: "light",
      });

      const paginationLink = page
        .locator('[data-slot="pagination-link"]')
        .first();
      await paginationLink.hover();
      await expectPopTreatment(paginationLink);
      await expectAnimationNameNotContains(paginationLink, "ui-pop-snap");

      await gotoStory(page, "components-disclosure-accordion--basic", {
        designSystem: "pop",
        theme: "light",
      });

      const accordionTrigger = page
        .locator('[data-slot="accordion-trigger"]')
        .first();
      await accordionTrigger.hover();
      await expectPopTreatment(accordionTrigger);
      await expectAnimationNameContains(accordionTrigger, "ui-pop-snap");

      await gotoStory(page, "components-stable-primitive-overlays--overview", {
        designSystem: "pop",
        theme: "light",
      });

      const navigationMenuTrigger = page
        .locator('[data-slot="navigation-menu-trigger"]')
        .first();
      await navigationMenuTrigger.hover();
      await expectPopTreatment(navigationMenuTrigger);
      await expectAnimationNameContains(navigationMenuTrigger, "ui-pop-snap");
    },
  );

  test(
    "runs pop color on utility primitives",
    popMotionTestDetails,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await gotoStory(page, "components-stable-primitive-actions--overview", {
        designSystem: "pop",
        theme: "light",
      });

      const kbd = page.locator('[data-slot="kbd"]').first();
      await kbd.evaluate((element) =>
        element.setAttribute("data-state", "active"),
      );
      await expectPopTreatment(kbd);
      await expectAnimationNameNotContains(kbd, "ui-pop-snap");

      await gotoStory(page, "components-forms-inputs-keyboard--default", {
        designSystem: "pop",
        theme: "light",
      });

      const keyboardKey = page.locator('[data-slot="keyboard-key"]').first();
      await keyboardKey.hover();
      await expectPopTreatment(keyboardKey);

      await gotoStory(page, "components-stable-primitive-layout--overview", {
        designSystem: "pop",
        theme: "light",
      });

      const codeBlock = page.locator('[data-slot="code-block"]').first();
      await codeBlock.hover();
      await expectPopTreatment(codeBlock);

      await gotoStory(page, "components-data-display-avatar--default", {
        designSystem: "pop",
        theme: "light",
      });

      const avatar = page.locator('[data-slot="avatar"]').first();
      await avatar.hover();
      await expectPopTreatment(avatar);
    },
  );

  test(
    "runs pop color on stable display primitives",
    popMotionTestDetails,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await gotoStory(
        page,
        "components-stable-primitive-components--overview",
        {
          designSystem: "pop",
          theme: "light",
        },
      );

      const tableRow = page.locator('[data-slot="table-row"]').last();
      const tableRowBefore = await getElementBox(tableRow);
      await tableRow.hover();
      await expectPopTreatment(tableRow);
      await expectNoTransform(tableRow);
      await expectElementBoxStable(tableRow, tableRowBefore);
      await verifyPageLayout(
        page,
        "components-stable-primitive-components--overview",
      );

      await gotoStory(
        page,
        "components-data-display-comparison-matrix--plan-comparison",
        {
          designSystem: "pop",
          theme: "light",
        },
      );

      const matrixCell = page
        .locator('[data-slot="comparison-matrix-cell"]')
        .first();
      const matrixCellBefore = await getElementBox(matrixCell);
      await matrixCell.hover();
      await expectPopTreatment(matrixCell);
      await expectNoTransform(matrixCell);
      await expectElementBoxStable(matrixCell, matrixCellBefore);
      await verifyPageLayout(
        page,
        "components-data-display-comparison-matrix--plan-comparison",
      );
    },
  );
});

function formatStoryTitle(storyId: string) {
  return grepSafeStoryTitles.get(storyId) ?? storyId;
}

function formatDesignSystemTitle(designSystem: (typeof uiThemes)[number]) {
  return designSystem === "pop" ? "spring theme" : designSystem;
}

async function expectAnimationNameContains(locator: Locator, expected: string) {
  await expect
    .poll(() =>
      locator.evaluate(
        (element) => window.getComputedStyle(element).animationName,
      ),
    )
    .toContain(expected);
}

async function expectAnimationNameNotContains(
  locator: Locator,
  expected: string,
) {
  const animationName = await locator.evaluate(
    (element) => window.getComputedStyle(element).animationName,
  );

  expect(animationName).not.toContain(expected);
}

async function expectPopTreatment(locator: Locator) {
  await expect
    .poll(async () => {
      const { animationName, backgroundImage, boxShadow, filter } =
        await locator.evaluate((element) => {
          const style = window.getComputedStyle(element);

          return {
            animationName: style.animationName,
            backgroundImage: style.backgroundImage,
            boxShadow: style.boxShadow,
            filter: style.filter,
          };
        });

      return (
        filter !== "none" ||
        boxShadow !== "none" ||
        backgroundImage !== "none" ||
        animationName.includes("ui-pop-")
      );
    })
    .toBe(true);
}

async function expectNoTransform(locator: Locator) {
  const transform = await locator.evaluate(
    (element) => window.getComputedStyle(element).transform,
  );

  expect(transform).toBe("none");
}

async function getElementBox(locator: Locator) {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect();

    return {
      height: box.height,
      width: box.width,
      x: box.x,
      y: box.y,
    };
  });
}

async function expectElementBoxStable(
  locator: Locator,
  before: Awaited<ReturnType<typeof getElementBox>>,
) {
  const after = await getElementBox(locator);

  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
}

async function gotoStory(
  page: Page,
  storyId: string,
  globals: {
    designSystem: (typeof uiThemes)[number];
    theme: (typeof colorSchemes)[number];
  },
) {
  const globalParam = `designSystem:${globals.designSystem};theme:${globals.theme}`;

  await gotoStoryWithRetry(
    page,
    `/iframe.html?id=${storyId}&globals=${encodeURIComponent(globalParam)}`,
  );
  await page.evaluate(() => document.fonts.ready);
  await openOverlayStory(page, storyId);
  await page.waitForTimeout(500);
}

async function gotoStoryWithRetry(page: Page, url: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.goto(url);

    const rootVisible = await page
      .locator("#storybook-root")
      .waitFor({ state: "visible", timeout: attempt === 0 ? 15_000 : 45_000 })
      .then(() => true)
      .catch(() => false);

    if (rootVisible) {
      return;
    }

    const hasDynamicImportError =
      (await page
        .getByText(/Failed to fetch dynamically imported module/)
        .count()) > 0;

    if (!hasDynamicImportError || attempt === 1) {
      await page.locator("#storybook-root").waitFor({ state: "visible" });
      return;
    }
  }
}

async function openOverlayStory(page: Page, storyId: string) {
  switch (storyId) {
    case "components-overlay-action-menu--basic":
      await openActionMenu(page, "Open row actions", /Duplicate/);
      break;
    case "components-overlay-action-menu--with-descriptions-and-shortcuts":
      await openActionMenu(page, "File actions", /Copy link/);
      break;
    case "components-overlay-context-action-menu--right-click-target":
      await rightClickTarget(page, "Right-click row");
      await page.getByRole("menuitem", { name: /Duplicate/ }).waitFor();
      break;
    case "components-overlay-action-sheet--bottom":
      await openActionSheet(page, "Open sheet");
      break;
    case "components-overlay-action-sheet--right-side":
      await openActionSheet(page, "Open side actions");
      break;
    case "components-overlay-responsive-action-menu--desktop-mode":
      if (
        (await page.locator('[data-slot="action-menu-content"]').count()) === 0
      ) {
        await openWithKeyboard(
          page,
          "Open desktop actions",
          "action-menu-trigger",
        );
      }
      await page.locator('[data-slot="action-menu-content"]').waitFor();
      break;
    case "components-overlay-responsive-action-menu--mobile-mode":
      if (
        (await page.locator('[data-slot="action-sheet-content"]').count()) === 0
      ) {
        await openWithKeyboard(
          page,
          "Open mobile actions",
          "action-sheet-trigger",
        );
      }
      await page.locator('[data-slot="action-sheet-content"]').waitFor();
      break;
    case "components-overlay-hover-preview--profile-preview":
      await page.getByRole("button", { name: "Mira Brandt" }).hover();
      await page.getByText("Product lead for workspace quality.").waitFor();
      break;
  }
}

async function openActionMenu(page: Page, name: string, itemName: RegExp) {
  const trigger = page.locator('[data-slot="action-menu-trigger"]').first();
  const item = page.getByRole("menuitem", { name: itemName });

  await trigger.waitFor({ state: "visible" });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await item.isVisible().catch(() => false)) {
      return;
    }

    await trigger.focus();
    await page.keyboard.press("Enter");

    const opened = await item
      .waitFor({ state: "visible", timeout: 2_500 })
      .then(() => true)
      .catch(() => false);

    if (opened) {
      return;
    }

    await page.waitForTimeout(100);
  }

  await page.getByRole("button", { name }).click();
  await item.waitFor({ state: "visible" });
}

async function openWithKeyboard(page: Page, name: string, slot?: string) {
  const trigger = slot
    ? page.locator(`[data-slot="${slot}"]`).first()
    : page.getByRole("button", { name });

  await trigger.focus();
  await page.keyboard.press("Enter");
}

async function openActionSheet(page: Page, name: string) {
  if (
    (await page.locator('[data-slot="action-sheet-content"]').count()) === 0
  ) {
    await openWithKeyboard(page, name, "action-sheet-trigger");
  }

  await page.locator('[data-slot="action-sheet-content"]').waitFor();
}

async function rightClickTarget(page: Page, name: string) {
  const target = page
    .locator('[data-slot="context-action-menu-trigger"]')
    .first();
  await target.waitFor({ state: "visible" });
  const box = await target.boundingBox();

  if (!box) {
    throw new Error(`Could not locate context-menu target ${name}`);
  }

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, {
    button: "right",
  });
}

async function verifyPageLayout(page: Page, storyId: string) {
  await expect(page.locator("#storybook-root")).toBeVisible();
  accessibilityExpect(await checkA11y(page)).toHaveNoViolations();

  const layout = await page.evaluate((allowDenseControls) => {
    const viewportWidth =
      document.documentElement.clientWidth || window.innerWidth;
    const scrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    );
    const badBoxes = [
      ...document.querySelectorAll<HTMLElement>("[data-slot], button, [role]"),
    ]
      .filter((element) => {
        const style = window.getComputedStyle(element);

        return style.display !== "none" && style.visibility !== "hidden";
      })
      .slice(0, 80)
      .filter((element) => {
        const box = element.getBoundingClientRect();

        return (
          !Number.isFinite(box.width) ||
          !Number.isFinite(box.height) ||
          box.width < 0 ||
          box.height < 0
        );
      })
      .map(
        (element) =>
          element.getAttribute("data-slot") ?? element.tagName.toLowerCase(),
      );
    function hasVisibleButtonLabel(button: HTMLButtonElement) {
      const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);

      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent?.trim();
        const parent = node.parentElement;

        if (
          !text ||
          !parent ||
          parent.closest("[aria-hidden='true'], .sr-only")
        ) {
          continue;
        }

        const style = window.getComputedStyle(parent);
        const box = parent.getBoundingClientRect();

        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          box.width > 1 &&
          box.height > 1
        ) {
          return true;
        }
      }

      return false;
    }

    const clippedButtons = [
      ...document.querySelectorAll<HTMLButtonElement>("button"),
    ]
      .filter((button) => {
        const style = window.getComputedStyle(button);

        return style.display !== "none" && style.visibility !== "hidden";
      })
      .filter((button) => {
        const accessibleName =
          button.textContent?.trim() ?? button.getAttribute("aria-label") ?? "";

        if (accessibleName.length === 0 || !hasVisibleButtonLabel(button)) {
          return false;
        }

        if (allowDenseControls) {
          return false;
        }

        return true;
      })
      .filter(
        (button) =>
          button.scrollWidth > button.clientWidth + 2 ||
          button.scrollHeight > button.clientHeight + 2,
      )
      .map(
        (button) =>
          button.textContent?.trim() ??
          button.getAttribute("aria-label") ??
          "button",
      );

    return {
      hasHorizontalOverflow: scrollWidth > viewportWidth + 4,
      badBoxes,
      clippedButtons,
    };
  }, denseControlStories.has(storyId));

  if (!horizontallyScrollableStories.has(storyId)) {
    expect(
      layout.hasHorizontalOverflow,
      "story should not horizontally overflow",
    ).toBe(false);
  }
  expect(layout.badBoxes, "visible elements should have finite boxes").toEqual(
    [],
  );
  expect(layout.clippedButtons, "button text should not be clipped").toEqual(
    [],
  );

  const internalScrollSelector = internalScrollStories.get(storyId);

  if (internalScrollSelector) {
    const hasScrollContainer = await page
      .locator(internalScrollSelector)
      .first()
      .evaluate((element) => {
        const style = window.getComputedStyle(element);

        return (
          style.overflowX === "auto" ||
          style.overflowX === "scroll" ||
          style.overflowY === "auto" ||
          style.overflowY === "scroll"
        );
      });

    expect(hasScrollContainer, `${storyId} should own its scroll region`).toBe(
      true,
    );
  }

  await verifyPostTabFocusTarget(page);

  if (storyId.startsWith("components-navigation-navbar--")) {
    await verifyNavbarLayout(page, storyId);
  }
}

async function checkA11y(page: Page) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const results = await new AxeBuilder({ page })
        .setLegacyMode()
        .withRules("color-contrast")
        .analyze();

      return results.violations;
    } catch (error) {
      lastError = error;

      if (!String(error).includes("Axe is already running")) {
        throw error;
      }

      await page.waitForTimeout(150);
    }
  }

  throw lastError;
}

function formatA11yViolations(violations: AxeViolation[]) {
  return violations
    .map((violation) => {
      const wcagTags = violation.tags.filter((tag) => tag.startsWith("wcag"));
      const nodes = violation.nodes
        .slice(0, 5)
        .map((node) => {
          const messages = [...node.any, ...node.all, ...node.none]
            .map((check) => check.message)
            .filter(Boolean)
            .join(" ");

          return `  - ${node.target.join(", ")}: ${messages}`;
        })
        .join("\n");
      const truncated =
        violation.nodes.length > 5
          ? `\n  - ...and ${violation.nodes.length - 5} more`
          : "";

      return [
        `${violation.id} (${violation.impact ?? "unknown impact"}): ${violation.help}`,
        `WCAG: ${wcagTags.length > 0 ? wcagTags.join(", ") : "not tagged"}`,
        nodes + truncated,
      ].join("\n");
    })
    .join("\n\n");
}

async function verifyPostTabFocusTarget(page: Page) {
  let lastFocusDebug = "no active element";

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.keyboard.press("Tab");

    const focusState = await page.evaluate(() => {
      const element = document.activeElement;

      if (!(element instanceof HTMLElement) || element === document.body) {
        return {
          isBody: true,
          isRadixFocusGuard: false,
          isVisible: true,
          debug: "body",
        };
      }

      const box = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const isVisible =
        box.width > 0 &&
        box.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden";
      const debug = JSON.stringify({
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute("role"),
        dataSlot: element.getAttribute("data-slot"),
        ariaLabel: element.getAttribute("aria-label"),
        tabindex: element.getAttribute("tabindex"),
        box: {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
        },
      });

      return {
        isBody: false,
        isRadixFocusGuard: element.matches("[data-radix-focus-guard]"),
        isVisible,
        debug,
      };
    });

    lastFocusDebug = focusState.debug;

    if (focusState.isBody || focusState.isVisible) {
      expect(
        true,
        `keyboard focus target should be visible: ${focusState.debug}`,
      ).toBe(true);
      return;
    }

    if (focusState.isRadixFocusGuard) {
      continue;
    }

    expect(
      focusState.isVisible,
      `keyboard focus target should be visible: ${focusState.debug}`,
    ).toBe(true);
    return;
  }

  expect(
    false,
    `keyboard focus target should leave Radix focus guards: ${lastFocusDebug}`,
  ).toBe(true);
}

async function verifyNavbarLayout(page: Page, storyId: string) {
  const nav = page.locator('[data-slot="navbar"]').first();

  await expect(nav).toBeVisible();

  const submenu = page.locator('[data-slot="navbar-submenu"]').first();

  if ((await submenu.count()) > 0) {
    const submenuLayout = await submenu.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const viewportWidth =
        document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight =
        document.documentElement.clientHeight || window.innerHeight;

      return {
        isInViewport:
          box.left >= -1 &&
          box.top >= -1 &&
          box.right <= viewportWidth + 1 &&
          box.bottom <= viewportHeight + 1,
        ownsVerticalScroll:
          style.overflowY === "auto" || style.overflowY === "scroll",
      };
    });

    expect(
      submenuLayout.isInViewport,
      "navbar submenu should stay inside the viewport",
    ).toBe(true);
    expect(
      submenuLayout.ownsVerticalScroll,
      "navbar submenu should scroll internally",
    ).toBe(true);
  }

  if (!storyId.startsWith("components-navigation-navbar--mobile")) {
    return;
  }

  const mobileTargets = await nav.evaluate((element) => {
    const visibleButtons = [
      ...element.querySelectorAll<HTMLButtonElement>("button"),
    ].filter((button) => {
      const style = window.getComputedStyle(button);
      const box = button.getBoundingClientRect();

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        box.width > 0 &&
        box.height > 0
      );
    });

    return visibleButtons.map((button) => {
      const box = button.getBoundingClientRect();

      return {
        name:
          button.textContent?.trim() ||
          button.getAttribute("aria-label") ||
          "button",
        isPrimaryTrigger:
          button.getAttribute("data-slot") === "navbar-trigger" ||
          button.getAttribute("data-slot") === "navbar-mobile-menu-trigger" ||
          Boolean(button.getAttribute("aria-controls")?.startsWith("navbar-")),
        width: box.width,
        height: box.height,
      };
    });
  });

  for (const target of mobileTargets) {
    const minimumSize = target.isPrimaryTrigger ? 44 : 40;

    expect(
      Math.min(target.width, target.height),
      `${target.name} should keep a ${minimumSize}px mobile target`,
    ).toBeGreaterThanOrEqual(minimumSize);
  }

  await verifyMobileNavbarActionability(page, nav);
}

async function verifyMobileNavbarActionability(page: Page, nav: Locator) {
  const mobileMenuTrigger = nav
    .locator('[data-slot="navbar-mobile-menu-trigger"]')
    .first();

  if ((await mobileMenuTrigger.count()) > 0) {
    await expectClickableInViewport(
      page,
      mobileMenuTrigger,
      "navbar mobile menu trigger",
    );
    await mobileMenuTrigger.click();
    await expect(mobileMenuTrigger).toHaveAttribute("aria-expanded", "true");

    const mobileMenuId = await mobileMenuTrigger.getAttribute("aria-controls");

    expect(
      mobileMenuId,
      "mobile menu trigger should control a mounted menu",
    ).not.toBeNull();

    const mobileMenu = page.locator('[data-slot="navbar-mobile-menu"]').first();

    await expect(
      mobileMenu,
      "mobile navbar menu should be visible",
    ).toBeVisible();
    await expect(
      mobileMenu,
      "mobile navbar menu should match aria-controls",
    ).toHaveAttribute("id", mobileMenuId ?? "");

    const mobileMenuTargets = mobileMenu.locator(
      "a, button, [role='button'], [role='menuitem']",
    );
    const mobileMenuTargetCount = await mobileMenuTargets.count();

    expect(
      mobileMenuTargetCount,
      "mobile navbar menu should expose navigation targets",
    ).toBeGreaterThan(0);

    for (let index = 0; index < mobileMenuTargetCount; index += 1) {
      await expectClickableInViewport(
        page,
        mobileMenuTargets.nth(index),
        `mobile navbar menu target ${index + 1}`,
      );
    }

    await page.keyboard.press("Escape");
    await expect(mobileMenu, "mobile navbar menu should close").toBeHidden();
    await verifyMobileNavbarActions(page, nav);
    return;
  }

  const triggers = nav.locator('[data-slot="navbar-trigger"]');
  const triggerCount = await triggers.count();

  expect(
    triggerCount,
    "mobile navbar should expose primary navigation triggers",
  ).toBeGreaterThan(0);

  for (let index = 0; index < triggerCount; index += 1) {
    const trigger = triggers.nth(index);
    const triggerName =
      (await trigger.textContent())?.trim() || `trigger ${index + 1}`;

    await expectClickableInViewport(page, trigger, `navbar ${triggerName}`);
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const submenuId = await trigger.getAttribute("aria-controls");

    expect(
      submenuId,
      `${triggerName} should control a mounted submenu`,
    ).not.toBeNull();

    const submenu = page.locator('[data-slot="navbar-submenu"]').first();

    await expect(
      submenu,
      `${triggerName} submenu should be visible`,
    ).toBeVisible();
    await expect(
      submenu,
      `${triggerName} submenu should match aria-controls`,
    ).toHaveAttribute("id", submenuId ?? "");

    const submenuTargets = submenu.locator(
      "a, button, [role='button'], [role='menuitem']",
    );
    const submenuTargetCount = await submenuTargets.count();

    expect(
      submenuTargetCount,
      `${triggerName} submenu should expose navigation targets`,
    ).toBeGreaterThan(0);

    for (
      let targetIndex = 0;
      targetIndex < submenuTargetCount;
      targetIndex += 1
    ) {
      await expectClickableInViewport(
        page,
        submenuTargets.nth(targetIndex),
        `${triggerName} submenu target ${targetIndex + 1}`,
      );
    }
  }

  await verifyMobileNavbarActions(page, nav);
}

async function verifyMobileNavbarActions(page: Page, nav: Locator) {
  const actionTrigger = nav
    .locator('[data-slot="navbar-mobile-actions-trigger"]')
    .first();

  if ((await actionTrigger.count()) === 0) {
    return;
  }

  await expectClickableInViewport(
    page,
    actionTrigger,
    "navbar mobile actions trigger",
  );
  await actionTrigger.click();

  const actionMenu = page
    .locator('[data-slot="navbar-mobile-actions-menu"]')
    .first();

  await expect(
    actionMenu,
    "mobile navbar actions menu should be visible",
  ).toBeVisible();

  const actionTargets = actionMenu.locator(
    "button, a, [role='button'], [role='switch']",
  );
  const actionTargetCount = await actionTargets.count();

  expect(
    actionTargetCount,
    "mobile actions menu should expose action targets",
  ).toBeGreaterThan(0);

  for (let index = 0; index < actionTargetCount; index += 1) {
    await expectClickableInViewport(
      page,
      actionTargets.nth(index),
      `navbar action ${index + 1}`,
    );
  }
}

async function expectClickableInViewport(
  page: Page,
  locator: Locator,
  label: string,
) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator, `${label} should be visible`).toBeVisible();
  await expect(locator, `${label} should be enabled`).toBeEnabled();

  const [box, viewport] = await Promise.all([
    locator.boundingBox(),
    page.evaluate(() => ({
      height: document.documentElement.clientHeight || window.innerHeight,
      width: document.documentElement.clientWidth || window.innerWidth,
    })),
  ]);

  expect(box, `${label} should have a clickable box`).not.toBeNull();

  if (!box) {
    return;
  }

  expect(
    box.x >= -1 &&
      box.y >= -1 &&
      box.x + box.width <= viewport.width + 1 &&
      box.y + box.height <= viewport.height + 1,
    `${label} should be inside the viewport`,
  ).toBe(true);

  await locator.click({ trial: true });
}
