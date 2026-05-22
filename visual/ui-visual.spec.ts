import { expect, test, type Page } from "@playwright/test";

const viewports = [
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
  "reference-shadcn-catalog--full-catalog",
  "components-overlays-dialog--open",
  "components-overlay-sheet--basic",
  "components-data-display-data-grid--default",
  "components-forms-inputs-filter-bar--default",
  "components-forms-inputs-query-builder--advanced-controls",
  "components-layout-app-shell--comprehensive-app-shell",
  "components-forms-inputs-form-layout--validated-interaction",
  "components-feedback-toaster--usage",
  "components-navigation-platform-navbar--web",
  "components-overlay-action-menu--basic",
  "components-overlay-action-menu--with-descriptions-and-shortcuts",
  "components-overlay-context-action-menu--right-click-target",
  "components-overlay-action-sheet--bottom",
  "components-overlay-action-sheet--right-side",
  "components-overlay-responsive-action-menu--desktop-mode",
  "components-overlay-responsive-action-menu--mobile-mode",
  "components-overlay-hover-preview--profile-preview",
  "components-data-display-calendar-card-days--default",
  "components-data-display-document-viewer--ocr-report-viewer",
  "components-editors-timeline-editor--default",
  "components-editors-annotation-canvas--default",
  "components-editors-workflow-builder--ai-workflow-graph",
  "components-editors-workflow-builder--controlled-viewport",
  "components-social-overview--social-feed",
  "components-social-overview--chat-box-thread",
  "patterns-release-readiness--consumer-dashboard-shell-story",
  "patterns-release-readiness--editor-workspace-story",
  "patterns-release-readiness--forms-settings-story",
];
const releaseReadinessThemeStories = [
  {
    storyId: "patterns-release-readiness--consumer-dashboard-shell-story",
    designSystem: "atlas",
  },
  {
    storyId: "patterns-release-readiness--editor-workspace-story",
    designSystem: "studio",
  },
  {
    storyId: "patterns-release-readiness--forms-settings-story",
    designSystem: "paper",
  },
] as const;
const uiThemes = ["bobba", "zleek", "atlas", "studio", "paper"] as const;
const colorSchemes = ["light", "dark"] as const;
const horizontallyScrollableStories = new Set([
  "reference-shadcn-catalog--full-catalog",
  "components-data-display-data-grid--default",
  "components-navigation-platform-navbar--web",
  "components-overlay-action-menu--basic",
  "components-overlay-action-menu--with-descriptions-and-shortcuts",
  "components-overlay-context-action-menu--right-click-target",
  "components-overlay-action-sheet--bottom",
  "components-overlay-action-sheet--right-side",
  "components-overlay-responsive-action-menu--desktop-mode",
  "components-overlay-responsive-action-menu--mobile-mode",
  "components-overlay-hover-preview--profile-preview",
  "components-data-display-calendar-card-days--default",
  "components-editors-timeline-editor--default",
  "components-editors-workflow-builder--ai-workflow-graph",
  "components-editors-workflow-builder--controlled-viewport",
  "patterns-release-readiness--consumer-dashboard-shell-story",
  "patterns-release-readiness--editor-workspace-story",
]);
const denseControlStories = new Set([
  "components-data-display-calendar-card-days--default",
  "components-forms-inputs-form-controls--basic",
  "reference-shadcn-catalog--full-catalog",
  "components-editors-workflow-builder--ai-workflow-graph",
  "components-editors-workflow-builder--controlled-viewport",
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
      test(`catalog renders ${designSystem}`, async ({ page }) => {
        await gotoStory(page, "reference-shadcn-catalog--full-catalog", {
          designSystem,
          theme: "light",
        });
        await verifyPageLayout(page, "reference-shadcn-catalog--full-catalog");
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
      await page.getByRole("button", { name: "Open row actions" }).click();
      await page.getByRole("menuitem", { name: /Duplicate/ }).waitFor();
      break;
    case "components-overlay-action-menu--with-descriptions-and-shortcuts":
      await page.getByRole("button", { name: "File actions" }).click();
      await page.getByRole("menuitem", { name: /Copy link/ }).waitFor();
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

  await page.keyboard.press("Tab");

  const activeElementIsVisible = await page.evaluate(() => {
    const element = document.activeElement;

    if (!(element instanceof HTMLElement) || element === document.body) {
      return true;
    }

    const box = element.getBoundingClientRect();

    return box.width > 0 && box.height > 0;
  });

  expect(activeElementIsVisible, "keyboard focus target should be visible").toBe(true);
}
