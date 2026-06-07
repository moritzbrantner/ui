import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

type AxeViolation = Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"][number];

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
const uiThemes = ["bobba", "zleek", "atlas", "studio", "paper"] as const;
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
  ["components-data-display-data-grid--default", '[data-slot="table-container"]'],
  ["components-data-display-comparison-matrix--plan-comparison", '[data-slot="comparison-matrix"]'],
  ["components-data-display-comparison-matrix--mobile-scroll", '[data-slot="comparison-matrix"]'],
  ["components-data-display-calendar-card-days--default", '[data-slot="calendar"]'],
  ["components-data-display-resource-list--default", '[data-slot="table-container"]'],
  ["components-data-display-process-map--release-lifecycle", '[data-slot="process-map"]'],
  [
    "components-data-display-relationship-map--stakeholder-map",
    '[data-slot="relationship-map-scroll-area"]',
  ],
  ["components-layout-workbench-layout--full-workbench", '[data-slot="workbench-canvas"]'],
]);

for (const viewport of viewports) {
  test.describe(`visual layout at ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const storyId of storyIds) {
      for (const colorScheme of colorSchemes) {
        test(`${storyId} has stable ${colorScheme} layout`, async ({ page }) => {
          await gotoStory(page, storyId, { designSystem: "bobba", theme: colorScheme });
          await verifyPageLayout(page, storyId);
        });
      }
    }

    for (const designSystem of uiThemes) {
      test(`primitive components render ${designSystem}`, async ({ page }) => {
        await gotoStory(page, "components-stable-primitive-components--overview", {
          designSystem,
          theme: "light",
        });
        await verifyPageLayout(page, "components-stable-primitive-components--overview");
      });
    }

    for (const { storyId, designSystem } of releaseReadinessThemeStories) {
      test(`${storyId} renders ${designSystem}`, async ({ page }) => {
        await gotoStory(page, storyId, { designSystem, theme: "light" });
        await verifyPageLayout(page, storyId);
      });
    }
  });
}

async function gotoStory(
  page: Page,
  storyId: string,
  globals: { designSystem: (typeof uiThemes)[number]; theme: (typeof colorSchemes)[number] },
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
      (await page.getByText(/Failed to fetch dynamically imported module/).count()) > 0;

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
      if ((await page.locator('[data-slot="action-menu-content"]').count()) === 0) {
        await openWithKeyboard(page, "Open desktop actions", "action-menu-trigger");
      }
      await page.locator('[data-slot="action-menu-content"]').waitFor();
      break;
    case "components-overlay-responsive-action-menu--mobile-mode":
      if ((await page.locator('[data-slot="action-sheet-content"]').count()) === 0) {
        await openWithKeyboard(page, "Open mobile actions", "action-sheet-trigger");
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
  if ((await page.locator('[data-slot="action-sheet-content"]').count()) === 0) {
    await openWithKeyboard(page, name, "action-sheet-trigger");
  }

  await page.locator('[data-slot="action-sheet-content"]').waitFor();
}

async function rightClickTarget(page: Page, name: string) {
  const target = page.locator('[data-slot="context-action-menu-trigger"]').first();
  await target.waitFor({ state: "visible" });
  const box = await target.boundingBox();

  if (!box) {
    throw new Error(`Could not locate context-menu target ${name}`);
  }

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" });
}

async function verifyPageLayout(page: Page, storyId: string) {
  await expect(page.locator("#storybook-root")).toBeVisible();
  accessibilityExpect(await checkA11y(page)).toHaveNoViolations();

  const layout = await page.evaluate((allowDenseControls) => {
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const badBoxes = [...document.querySelectorAll<HTMLElement>("[data-slot], button, [role]")]
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
      .map((element) => element.getAttribute("data-slot") ?? element.tagName.toLowerCase());
    function hasVisibleButtonLabel(button: HTMLButtonElement) {
      const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);

      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent?.trim();
        const parent = node.parentElement;

        if (!text || !parent || parent.closest("[aria-hidden='true'], .sr-only")) {
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

    const clippedButtons = [...document.querySelectorAll<HTMLButtonElement>("button")]
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
      .map((button) => button.textContent?.trim() ?? button.getAttribute("aria-label") ?? "button");

    return {
      hasHorizontalOverflow: scrollWidth > viewportWidth + 4,
      badBoxes,
      clippedButtons,
    };
  }, denseControlStories.has(storyId));

  if (!horizontallyScrollableStories.has(storyId)) {
    expect(layout.hasHorizontalOverflow, "story should not horizontally overflow").toBe(false);
  }
  expect(layout.badBoxes, "visible elements should have finite boxes").toEqual([]);
  expect(layout.clippedButtons, "button text should not be clipped").toEqual([]);

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

    expect(hasScrollContainer, `${storyId} should own its scroll region`).toBe(true);
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
        violation.nodes.length > 5 ? `\n  - ...and ${violation.nodes.length - 5} more` : "";

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
      expect(true, `keyboard focus target should be visible: ${focusState.debug}`).toBe(true);
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

  expect(false, `keyboard focus target should leave Radix focus guards: ${lastFocusDebug}`).toBe(
    true,
  );
}

async function verifyNavbarLayout(page: Page, storyId: string) {
  const nav = page.locator('[data-slot="navbar"]').first();

  await expect(nav).toBeVisible();

  const submenu = page.locator('[data-slot="navbar-submenu"]').first();

  if ((await submenu.count()) > 0) {
    const submenuLayout = await submenu.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

      return {
        isInViewport:
          box.left >= -1 &&
          box.top >= -1 &&
          box.right <= viewportWidth + 1 &&
          box.bottom <= viewportHeight + 1,
        ownsVerticalScroll: style.overflowY === "auto" || style.overflowY === "scroll",
      };
    });

    expect(submenuLayout.isInViewport, "navbar submenu should stay inside the viewport").toBe(true);
    expect(submenuLayout.ownsVerticalScroll, "navbar submenu should scroll internally").toBe(true);
  }

  if (!storyId.startsWith("components-navigation-navbar--mobile")) {
    return;
  }

  const mobileTargets = await nav.evaluate((element) => {
    const visibleButtons = [...element.querySelectorAll<HTMLButtonElement>("button")].filter(
      (button) => {
        const style = window.getComputedStyle(button);
        const box = button.getBoundingClientRect();

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          box.width > 0 &&
          box.height > 0
        );
      },
    );

    return visibleButtons.map((button) => {
      const box = button.getBoundingClientRect();

      return {
        name: button.textContent?.trim() || button.getAttribute("aria-label") || "button",
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
  const mobileMenuTrigger = nav.locator('[data-slot="navbar-mobile-menu-trigger"]').first();

  if ((await mobileMenuTrigger.count()) > 0) {
    await expectClickableInViewport(page, mobileMenuTrigger, "navbar mobile menu trigger");
    await mobileMenuTrigger.click();
    await expect(mobileMenuTrigger).toHaveAttribute("aria-expanded", "true");

    const mobileMenuId = await mobileMenuTrigger.getAttribute("aria-controls");

    expect(mobileMenuId, "mobile menu trigger should control a mounted menu").not.toBeNull();

    const mobileMenu = page.locator('[data-slot="navbar-mobile-menu"]').first();

    await expect(mobileMenu, "mobile navbar menu should be visible").toBeVisible();
    await expect(mobileMenu, "mobile navbar menu should match aria-controls").toHaveAttribute(
      "id",
      mobileMenuId ?? "",
    );

    const mobileMenuTargets = mobileMenu.locator("a, button, [role='button'], [role='menuitem']");
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

  expect(triggerCount, "mobile navbar should expose primary navigation triggers").toBeGreaterThan(
    0,
  );

  for (let index = 0; index < triggerCount; index += 1) {
    const trigger = triggers.nth(index);
    const triggerName = (await trigger.textContent())?.trim() || `trigger ${index + 1}`;

    await expectClickableInViewport(page, trigger, `navbar ${triggerName}`);
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const submenuId = await trigger.getAttribute("aria-controls");

    expect(submenuId, `${triggerName} should control a mounted submenu`).not.toBeNull();

    const submenu = page.locator('[data-slot="navbar-submenu"]').first();

    await expect(submenu, `${triggerName} submenu should be visible`).toBeVisible();
    await expect(submenu, `${triggerName} submenu should match aria-controls`).toHaveAttribute(
      "id",
      submenuId ?? "",
    );

    const submenuTargets = submenu.locator("a, button, [role='button'], [role='menuitem']");
    const submenuTargetCount = await submenuTargets.count();

    expect(
      submenuTargetCount,
      `${triggerName} submenu should expose navigation targets`,
    ).toBeGreaterThan(0);

    for (let targetIndex = 0; targetIndex < submenuTargetCount; targetIndex += 1) {
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
  const actionTrigger = nav.locator('[data-slot="navbar-mobile-actions-trigger"]').first();

  if ((await actionTrigger.count()) === 0) {
    return;
  }

  await expectClickableInViewport(page, actionTrigger, "navbar mobile actions trigger");
  await actionTrigger.click();

  const actionMenu = page.locator('[data-slot="navbar-mobile-actions-menu"]').first();

  await expect(actionMenu, "mobile navbar actions menu should be visible").toBeVisible();

  const actionTargets = actionMenu.locator("button, a, [role='button'], [role='switch']");
  const actionTargetCount = await actionTargets.count();

  expect(actionTargetCount, "mobile actions menu should expose action targets").toBeGreaterThan(0);

  for (let index = 0; index < actionTargetCount; index += 1) {
    await expectClickableInViewport(page, actionTargets.nth(index), `navbar action ${index + 1}`);
  }
}

async function expectClickableInViewport(page: Page, locator: Locator, label: string) {
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
