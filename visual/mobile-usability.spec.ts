import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

import {
  componentRegistry,
  type ComponentRegistryEntry,
  type ComponentTier,
} from "../src/component-registry";
import { mobileUsabilityConfig } from "./mobile-usability-config";
import {
  mobileUsabilityViewport,
  type MobileUsabilityFinding,
  writeMobileUsabilityFindingFragment,
} from "./mobile-usability-report";

type StoryIndexEntry = {
  type: "story" | "docs";
  id: string;
  name: string;
  title: string;
  importPath: string;
  exportName?: string;
};

type MobileUsabilityStory = {
  componentName: string;
  tier: ComponentTier;
  storyId: string;
  storyTitle: string;
  storyName: string;
  importPath: string;
  exportName?: string;
  skipReason?: string;
};

type BoundingBox = { x: number; y: number; width: number; height: number };

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceSkipCache = new Map<string, Map<string, string | null>>();
let storyIndexEntries: StoryIndexEntry[] = [];

const includedTierSet = new Set<ComponentTier>(mobileUsabilityConfig.includedTiers);
const excludedTierSet = new Set<ComponentTier>(mobileUsabilityConfig.excludedTiers);
const auditedComponents = componentRegistry.filter(
  (entry) =>
    includedTierSet.has(entry.tier) && !excludedTierSet.has(entry.tier) && !entry.deprecatedSince,
);

test.setTimeout(180_000);
test.use({
  viewport: {
    width: mobileUsabilityConfig.viewport.width,
    height: mobileUsabilityConfig.viewport.height,
  },
});

test.beforeAll(async ({ request }) => {
  const response = await request.get("/index.json");

  expect(response.ok(), "Storybook index should be available").toBe(true);

  const index = (await response.json()) as { entries: Record<string, StoryIndexEntry> };
  storyIndexEntries = Object.values(index.entries).filter((entry) => entry.type === "story");
});

for (const component of auditedComponents) {
  test(`${formatComponentAuditTitle(component)} public stories pass mobile usability`, async ({
    page,
  }, testInfo) => {
    const stories = discoverStoriesForComponent(component);

    test.setTimeout(
      Math.max(180_000, stories.filter((story) => !story.skipReason).length * 18_000),
    );

    const componentFindings: MobileUsabilityFinding[] = [];

    for (const story of stories) {
      if (story.skipReason) {
        continue;
      }

      const storyFindings: MobileUsabilityFinding[] = [];

      await auditStory(page, story, storyFindings, testInfo);

      if (storyFindings.length > 0) {
        await attachStoryScreenshot(page, story, storyFindings, testInfo);
      }

      componentFindings.push(...storyFindings);
    }

    writeMobileUsabilityFindingFragment(component.name, componentFindings);

    expect(componentFindings, formatFindingSummary(componentFindings)).toEqual([]);
  });
}

function formatComponentAuditTitle(component: ComponentRegistryEntry) {
  return component.name === "popover" ? "floating overlay" : component.name;
}

async function auditStory(
  page: Page,
  story: MobileUsabilityStory,
  storyFindings: MobileUsabilityFinding[],
  testInfo: TestInfo,
) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const onConsole = (message: { type: () => string; text: () => string }) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  };
  const onPageError = (error: Error) => pageErrors.push(error.message);
  const onRequestFailed = (request: {
    url: () => string;
    failure: () => { errorText: string } | null;
  }) => {
    const url = request.url();
    const failure = request.failure()?.errorText ?? "request failed";

    if (failure.includes("net::ERR_ABORTED")) {
      return;
    }

    if (url.includes(".js") || url.includes(".tsx") || url.includes("@fs")) {
      failedRequests.push(`${url}: ${failure}`);
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);

  try {
    await gotoStory(page, story.storyId);
    await verifyBasicRender(page, story, storyFindings, {
      consoleErrors,
      failedRequests,
      pageErrors,
    });
    await waitForStableStoryDom(page);

    await openOverlayStory(page, story.storyId, storyFindings);
    await waitForStableStoryDom(page);
    await verifyDocumentOverflow(page, story, storyFindings);
    await verifyInternalScroll(page, story, storyFindings);
    await verifyInteractiveTargets(page, story, storyFindings);
    await verifyTextClipping(page, story, storyFindings);
    await verifyOverlayUsability(page, story, storyFindings);
    await verifyKeyboardFocus(page, story, storyFindings);
  } catch (error) {
    storyFindings.push(
      createFinding(story, "render", error instanceof Error ? error.message : String(error)),
    );
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("requestfailed", onRequestFailed);
    await testInfo.attach(`${story.storyId}-findings`, {
      body: JSON.stringify(storyFindings, null, 2),
      contentType: "application/json",
    });
  }
}

async function waitForStableStoryDom(page: Page) {
  await page.evaluate(
    ({ quietMs, timeoutMs }) =>
      new Promise<void>((resolve) => {
        const root = document.querySelector("#storybook-root");

        if (!root) {
          resolve();
          return;
        }

        let quietTimer: number | undefined;
        let timeoutTimer: number | undefined;
        const observer = new MutationObserver(() => scheduleQuietWindow());

        const finish = () => {
          observer.disconnect();

          if (quietTimer !== undefined) {
            window.clearTimeout(quietTimer);
          }

          if (timeoutTimer !== undefined) {
            window.clearTimeout(timeoutTimer);
          }

          resolve();
        };

        const scheduleQuietWindow = () => {
          if (quietTimer !== undefined) {
            window.clearTimeout(quietTimer);
          }

          quietTimer = window.setTimeout(finish, quietMs);
        };

        observer.observe(root, {
          attributes: true,
          characterData: true,
          childList: true,
          subtree: true,
        });
        timeoutTimer = window.setTimeout(finish, timeoutMs);
        scheduleQuietWindow();
      }),
    { quietMs: 150, timeoutMs: 2_500 },
  );
}

async function gotoStory(page: Page, storyId: string) {
  const globals = encodeURIComponent("designSystem:bobba;theme:light");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.goto(`/iframe.html?id=${storyId}&globals=${globals}`);

    const rootVisible = await page
      .locator("#storybook-root")
      .waitFor({ state: "visible", timeout: attempt === 0 ? 15_000 : 45_000 })
      .then(() => true)
      .catch(() => false);

    if (rootVisible) {
      const storyVisible = await page
        .locator("#storybook-root *:visible")
        .first()
        .waitFor({ state: "visible", timeout: attempt === 0 ? 5_000 : 15_000 })
        .then(() => true)
        .catch(() => false);

      if (!storyVisible && attempt === 0) {
        continue;
      }

      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
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

async function verifyBasicRender(
  page: Page,
  story: MobileUsabilityStory,
  storyFindings: MobileUsabilityFinding[],
  errors: { consoleErrors: string[]; failedRequests: string[]; pageErrors: string[] },
) {
  let rootVisible = await page
    .locator("#storybook-root")
    .isVisible()
    .catch(() => false);
  let visibleElementCount = await page.locator("#storybook-root *:visible").count();

  if (!rootVisible || visibleElementCount === 0) {
    await page
      .locator("#storybook-root *:visible")
      .first()
      .waitFor({ state: "visible", timeout: 5_000 })
      .catch(() => undefined);

    rootVisible = await page
      .locator("#storybook-root")
      .isVisible()
      .catch(() => false);
    visibleElementCount = await page.locator("#storybook-root *:visible").count();
  }

  if (!rootVisible) {
    storyFindings.push(createFinding(story, "render", "#storybook-root is not visible."));
  }

  if (visibleElementCount === 0) {
    storyFindings.push(createFinding(story, "render", "Story root has no visible elements."));
  }

  const dynamicImportError =
    (await page.getByText(/Failed to fetch dynamically imported module/).count()) > 0;

  if (dynamicImportError) {
    storyFindings.push(createFinding(story, "render", "Story failed to load a dynamic import."));
  }

  const recoveredFromTransientLoad = rootVisible && visibleElementCount > 0 && !dynamicImportError;
  const reportableErrors = [
    ...errors.pageErrors,
    ...errors.consoleErrors,
    ...errors.failedRequests,
  ].filter((error) => !recoveredFromTransientLoad || !isTransientStorybookLoadError(error));

  for (const error of reportableErrors) {
    storyFindings.push(createFinding(story, "render", error));
  }
}

function isTransientStorybookLoadError(error: string) {
  return /net::ERR_NETWORK_CHANGED|Failed to fetch dynamically imported module/.test(error);
}

async function verifyDocumentOverflow(
  page: Page,
  story: MobileUsabilityStory,
  storyFindings: MobileUsabilityFinding[],
) {
  const layout = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);

    return {
      scrollWidth,
      viewportWidth,
    };
  });

  if (layout.scrollWidth > layout.viewportWidth + 4) {
    storyFindings.push(
      createFinding(
        story,
        "document-overflow",
        `Document scrollWidth ${layout.scrollWidth}px exceeds viewport width ${layout.viewportWidth}px.`,
      ),
    );
  }
}

async function verifyInternalScroll(
  page: Page,
  story: MobileUsabilityStory,
  storyFindings: MobileUsabilityFinding[],
) {
  const allowance = mobileUsabilityConfig.internalScrollStories.get(story.storyId);

  if (!allowance) {
    return;
  }

  const target = page.locator(allowance.selector).first();
  const count = await target.count();

  if (count === 0 || !(await target.isVisible().catch(() => false))) {
    storyFindings.push(
      createFinding(
        story,
        "internal-scroll",
        `Allowed internal scroll container is missing or hidden: ${allowance.reason}`,
        allowance.selector,
      ),
    );
    return;
  }

  const state = await target.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;

    return {
      box: toSerializableBox(box),
      fitsViewport: box.left >= -1 && box.right <= viewportWidth + 1,
      ownsScroll:
        style.overflowX === "auto" ||
        style.overflowX === "scroll" ||
        style.overflowY === "auto" ||
        style.overflowY === "scroll",
    };

    function toSerializableBox(rect: DOMRect) {
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }
  });

  if (!state.fitsViewport) {
    storyFindings.push(
      createFinding(
        story,
        "internal-scroll",
        `Internal scroll container does not fit within the viewport: ${allowance.reason}`,
        allowance.selector,
        state.box,
      ),
    );
  }

  if (!state.ownsScroll) {
    storyFindings.push(
      createFinding(
        story,
        "internal-scroll",
        `Internal scroll container does not use overflow auto/scroll: ${allowance.reason}`,
        allowance.selector,
        state.box,
      ),
    );
  }
}

async function verifyInteractiveTargets(
  page: Page,
  story: MobileUsabilityStory,
  storyFindings: MobileUsabilityFinding[],
) {
  const targets = await page.evaluate(() => {
    const selector = [
      "button",
      "a[href]",
      "input",
      "select",
      "textarea",
      '[role="button"]',
      '[role="menuitem"]',
      '[role="menuitemcheckbox"]',
      '[role="menuitemradio"]',
      '[role="switch"]',
      '[role="tab"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    return [...document.querySelectorAll<HTMLElement>(selector)]
      .filter(isUsableCandidate)
      .map((element, index) => {
        const auditId = `mobile-usability-target-${index}`;

        element.dataset.mobileUsabilityTarget = auditId;

        return {
          auditId,
          label: getElementLabel(element),
          selector: getElementSelector(element),
          isFormInput:
            element.matches("input, textarea, select") ||
            element.getAttribute("role") === "combobox",
          isDragSeparator: element.getAttribute("data-slot") === "resizable-handle",
        };
      });

    function isUsableCandidate(element: HTMLElement) {
      if (element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") {
        return false;
      }

      if (
        element.matches(
          [
            "[data-radix-focus-guard]",
            "[data-radix-focus-scope-start]",
            "[data-radix-focus-scope-end]",
            ".sr-only",
            '[data-slot="dropzone-input"] input[type="file"]',
            'input[type="file"][data-slot="dropzone-input"]',
          ].join(","),
        )
      ) {
        return false;
      }

      if (element.closest('[aria-hidden="true"], .sr-only')) {
        return false;
      }

      const closedAncestor = element.parentElement?.closest(
        '[data-state="closed"], [hidden], [inert]',
      );

      if (closedAncestor) {
        return false;
      }

      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();
      const isClippedHidden =
        (style.position === "absolute" || style.position === "fixed") &&
        box.width <= 1 &&
        box.height <= 1 &&
        (style.clip !== "auto" || style.clipPath !== "none" || style.overflow === "hidden");

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.pointerEvents !== "none" &&
        !isClippedHidden &&
        box.width > 0 &&
        box.height > 0
      );
    }

    function getElementLabel(element: HTMLElement) {
      return (
        element.getAttribute("aria-label") ||
        element.textContent?.trim().replace(/\s+/g, " ") ||
        element.getAttribute("data-slot") ||
        element.tagName.toLowerCase()
      );
    }

    function getElementSelector(element: HTMLElement) {
      const slot = element.getAttribute("data-slot");

      if (slot) {
        return `[data-slot="${slot}"]`;
      }

      const role = element.getAttribute("role");

      if (role) {
        return `[role="${role}"]`;
      }

      return element.tagName.toLowerCase();
    }
  });

  for (const target of targets) {
    const locator = page.locator(`[data-mobile-usability-target="${target.auditId}"]`);

    const targetExists = await locator
      .count()
      .then((count) => count > 0)
      .catch(() => false);

    if (!targetExists) {
      continue;
    }

    const scrolled = await locator
      .scrollIntoViewIfNeeded({ timeout: 1_500 })
      .then(() => true)
      .catch(async (error: unknown) => {
        const stillExists = await locator
          .count()
          .then((count) => count > 0)
          .catch(() => false);

        if (!stillExists) {
          return false;
        }

        storyFindings.push(
          createFinding(
            story,
            "target-actionability",
            `Interactive target could not be scrolled into view: ${target.label}. ${
              error instanceof Error ? error.message : String(error)
            }`,
            target.selector,
          ),
        );
        return false;
      });

    if (!scrolled) {
      continue;
    }

    if (!(await locator.isVisible().catch(() => false))) {
      storyFindings.push(
        createFinding(
          story,
          "target-actionability",
          `Interactive target is not visible after scroll: ${target.label}.`,
          target.selector,
        ),
      );
      continue;
    }

    const box = await locator.boundingBox();

    if (!box || !hasFiniteBox(box)) {
      storyFindings.push(
        createFinding(
          story,
          "target-actionability",
          `Interactive target has no finite bounding box: ${target.label}.`,
          target.selector,
          box ?? undefined,
        ),
      );
      continue;
    }

    if (!(await boxFitsHorizontally(page, box))) {
      storyFindings.push(
        createFinding(
          story,
          "target-actionability",
          `Interactive target does not fit horizontally after scroll: ${target.label}.`,
          target.selector,
          box,
        ),
      );
    }

    const minimum = target.isFormInput ? 36 : 40;
    const measuredDimension = target.isFormInput ? box.height : Math.min(box.width, box.height);

    if (measuredDimension < minimum) {
      storyFindings.push(
        createFinding(
          story,
          "target-size",
          `Interactive target "${target.label}" is ${Math.round(
            measuredDimension,
          )}px; expected at least ${minimum}px.`,
          target.selector,
          box,
        ),
      );
    }

    const actionable = target.isDragSeparator
      ? true
      : target.isFormInput
        ? await locator
            .focus({ timeout: 1_000 })
            .then(() => true)
            .catch(() => false)
        : await locator
            .click({ trial: true, timeout: 1_500 })
            .then(() => true)
            .catch(() => false);

    if (!actionable) {
      storyFindings.push(
        createFinding(
          story,
          "target-actionability",
          `Interactive target cannot be ${
            target.isDragSeparator ? "hovered" : target.isFormInput ? "focused" : "clicked"
          }: ${target.label}.`,
          target.selector,
          box,
        ),
      );
    }
  }
}

async function verifyTextClipping(
  page: Page,
  story: MobileUsabilityStory,
  storyFindings: MobileUsabilityFinding[],
) {
  const denseAllowance = mobileUsabilityConfig.denseControlStories.get(story.storyId);

  if (denseAllowance) {
    return;
  }

  const clippedControls = await page.evaluate(() => {
    const selector = [
      "button",
      '[role="tab"]',
      '[role="menuitem"]',
      '[data-slot$="trigger"]',
      '[data-slot$="-trigger"]',
    ].join(",");

    return [...document.querySelectorAll<HTMLElement>(selector)]
      .filter((element) => isVisible(element) && !element.closest('[aria-hidden="true"]'))
      .filter((element) => {
        const visibleLabel = hasVisibleLabel(element);
        const accessibleName =
          element.getAttribute("aria-label") ||
          element.getAttribute("aria-labelledby") ||
          element.textContent?.trim();

        if (!visibleLabel) {
          return false;
        }

        return (
          element.scrollWidth > element.clientWidth + 2 ||
          element.scrollHeight > element.clientHeight + 2
        );
      })
      .map((element) => {
        const box = element.getBoundingClientRect();

        return {
          label:
            element.getAttribute("aria-label") ||
            element.textContent?.trim().replace(/\s+/g, " ") ||
            element.getAttribute("data-slot") ||
            element.tagName.toLowerCase(),
          selector: getElementSelector(element),
          box: { x: box.x, y: box.y, width: box.width, height: box.height },
        };
      });

    function isVisible(element: HTMLElement) {
      const style = window.getComputedStyle(element);
      const box = element.getBoundingClientRect();

      return (
        style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0
      );
    }

    function hasVisibleLabel(element: HTMLElement) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent?.trim();
        const parent = node.parentElement;

        if (!text || !parent || parent.closest("[aria-hidden='true'], .sr-only")) {
          continue;
        }

        if (isVisible(parent)) {
          return true;
        }
      }

      return false;
    }

    function getElementSelector(element: HTMLElement) {
      const slot = element.getAttribute("data-slot");

      if (slot) {
        return `[data-slot="${slot}"]`;
      }

      const role = element.getAttribute("role");

      if (role) {
        return `[role="${role}"]`;
      }

      return element.tagName.toLowerCase();
    }
  });

  for (const control of clippedControls) {
    storyFindings.push(
      createFinding(
        story,
        "text-clipping",
        `Visible control label is clipped: ${control.label}.`,
        control.selector,
        control.box,
      ),
    );
  }
}

async function openOverlayStory(
  page: Page,
  storyId: string,
  storyFindings: MobileUsabilityFinding[],
) {
  switch (storyId) {
    case "components-overlay-action-menu--basic":
      await openActionMenu(page, "Open row actions", /Duplicate/);
      break;
    case "components-overlay-action-menu--checkbox-and-radio":
      await openActionMenuByText(page, "View options", /Show archived|Compact/);
      break;
    case "components-overlay-action-menu--with-descriptions-and-shortcuts":
      await openActionMenu(page, "File actions", /Copy link/);
      break;
    case "components-overlay-action-menu--empty":
      await openActionMenuByText(page, "Unavailable actions", /No actions available/);
      break;
    case "components-overlay-context-action-menu--right-click-target":
      await rightClickTarget(page);
      await page.getByRole("menuitem", { name: /Duplicate/ }).waitFor();
      break;
    case "components-overlay-context-action-menu--with-disabled-and-destructive-items":
      await rightClickTarget(page);
      await page.getByRole("menuitem", { name: /Copy/ }).waitFor();
      break;
    case "components-overlay-action-sheet--bottom":
      await openActionSheet(page, "Open sheet");
      break;
    case "components-overlay-action-sheet--right-side":
      await openActionSheet(page, "Open side actions");
      break;
    case "components-overlay-action-sheet--checkbox-and-radio":
      await openActionSheet(page, "Filter actions");
      break;
    case "components-overlay-action-sheet--empty":
      await openActionSheet(page, "Open empty sheet");
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
    case "components-overlay-hover-preview--status-preview":
      await page.getByRole("button", { name: "Ready for release" }).hover();
      await page.getByText("Checks have passed and package contracts are stable.").waitFor();
      break;
    default:
      if (storyId.startsWith("components-navigation-navbar--mobile")) {
        await openNavbarMobileMenus(page, storyId, storyFindings);
      }
      break;
  }
}

async function verifyOverlayUsability(
  page: Page,
  story: MobileUsabilityStory,
  storyFindings: MobileUsabilityFinding[],
) {
  const overlaySelector = getOverlaySelector(story.storyId);

  if (!overlaySelector) {
    return;
  }

  await openOverlayStory(page, story.storyId, storyFindings);

  const overlay = page.locator(overlaySelector).first();

  if ((await overlay.count()) === 0 || !(await overlay.isVisible().catch(() => false))) {
    storyFindings.push(
      createFinding(
        story,
        "overlay",
        `Overlay is not visible: ${overlaySelector}.`,
        overlaySelector,
      ),
    );
    return;
  }

  const layout = await overlay.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

    return {
      box: { x: box.x, y: box.y, width: box.width, height: box.height },
      fitsViewport:
        box.left >= -1 &&
        box.top >= -1 &&
        box.right <= viewportWidth + 1 &&
        box.bottom <= viewportHeight + 1,
      ownsScroll:
        box.height <= viewportHeight ||
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        style.overflow === "auto" ||
        style.overflow === "scroll",
    };
  });

  if (!layout.fitsViewport) {
    storyFindings.push(
      createFinding(
        story,
        "overlay",
        `Overlay does not fit inside the viewport: ${overlaySelector}.`,
        overlaySelector,
        layout.box,
      ),
    );
  }

  if (!layout.ownsScroll) {
    storyFindings.push(
      createFinding(
        story,
        "overlay",
        `Overlay content exceeds viewport height without internal scroll: ${overlaySelector}.`,
        overlaySelector,
        layout.box,
      ),
    );
  }

  const targetCount = await overlay
    .locator(
      'button, a[href], input, select, textarea, [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="switch"], [role="tab"], [role="checkbox"], [role="radio"]',
    )
    .count();

  if (targetCount === 0 && !allowsOverlayWithoutInteractiveTarget(story.storyId)) {
    storyFindings.push(
      createFinding(story, "overlay", `Overlay exposes no interactive target: ${overlaySelector}.`),
    );
  }

  if (!story.storyId.includes("hover-preview")) {
    await page.keyboard.press("Escape");
    const closed = await overlay
      .waitFor({ state: "hidden", timeout: 2_000 })
      .then(() => true)
      .catch(() => false);

    if (!closed) {
      storyFindings.push(
        createFinding(story, "overlay", `Overlay does not close with Escape: ${overlaySelector}.`),
      );
    }
  }
}

function allowsOverlayWithoutInteractiveTarget(storyId: string) {
  return storyId.includes("hover-preview") || storyId.endsWith("--empty");
}

async function verifyKeyboardFocus(
  page: Page,
  story: MobileUsabilityStory,
  storyFindings: MobileUsabilityFinding[],
) {
  let lastDebug = "no active element";

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.keyboard.press("Tab");

    const focusState = await page.evaluate(() => {
      const element = document.activeElement;
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

      if (!(element instanceof HTMLElement) || element === document.body) {
        return {
          isBody: true,
          isRadixFocusGuard: false,
          isVisible: true,
          inViewport: true,
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

      return {
        isBody: false,
        isRadixFocusGuard: element.matches("[data-radix-focus-guard]"),
        isVisible,
        inViewport:
          box.left >= -1 &&
          box.top >= -1 &&
          box.right <= viewportWidth + 1 &&
          box.bottom <= viewportHeight + 1,
        debug: JSON.stringify({
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
        }),
      };
    });

    lastDebug = focusState.debug;

    if (focusState.isRadixFocusGuard) {
      continue;
    }

    if (focusState.isBody || (focusState.isVisible && focusState.inViewport)) {
      return;
    }

    storyFindings.push(
      createFinding(
        story,
        "keyboard-focus",
        `Keyboard focus target should be visible and inside viewport: ${focusState.debug}.`,
      ),
    );
    return;
  }

  storyFindings.push(
    createFinding(
      story,
      "keyboard-focus",
      `Keyboard focus did not leave Radix focus guards after 4 tabs: ${lastDebug}.`,
    ),
  );
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
  }

  await page.getByRole("button", { name }).click();
  await item.waitFor({ state: "visible" });
}

async function openActionMenuByText(page: Page, _name: string, text: RegExp) {
  const trigger = page.locator('[data-slot="action-menu-trigger"]').first();
  const item = page.getByText(text).first();

  await trigger.waitFor({ state: "visible" });

  if (!(await item.isVisible().catch(() => false))) {
    await trigger.focus();
    await page.keyboard.press("Enter");
  }

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
  const content = page.locator('[data-slot="action-sheet-content"]').first();

  if (!(await content.isVisible().catch(() => false))) {
    await openWithKeyboard(page, name, "action-sheet-trigger");
  }

  await content.waitFor();
}

async function rightClickTarget(page: Page) {
  const target = page.locator('[data-slot="context-action-menu-trigger"]').first();

  await target.waitFor({ state: "visible" });
  await page.keyboard.press("Escape").catch(() => undefined);

  const box = await target.boundingBox();

  if (!box) {
    throw new Error("Could not locate context-menu target.");
  }

  const viewportWidth = page.viewportSize()?.width ?? 360;
  const preferredX = Math.min(Math.max(viewportWidth / 2, 112), viewportWidth - 112);
  const clickX = Math.min(Math.max(preferredX, box.x + 4), box.x + box.width - 4);

  await page.mouse.click(clickX, box.y + box.height / 2, { button: "right" });
}

async function openNavbarMobileMenus(
  page: Page,
  storyId: string,
  storyFindings: MobileUsabilityFinding[],
) {
  const nav = page.locator('[data-slot="navbar"]').first();

  if ((await nav.count()) === 0) {
    return;
  }

  const mobileMenuTrigger = nav.locator('[data-slot="navbar-mobile-menu-trigger"]').first();
  const mobileMenu = page.locator('[data-slot="navbar-mobile-menu"]').first();

  if ((await mobileMenuTrigger.count()) > 0) {
    await expectTargetInViewport(
      page,
      mobileMenuTrigger,
      storyId,
      "navbar mobile menu trigger",
      storyFindings,
    );

    if (!(await mobileMenu.isVisible().catch(() => false))) {
      await mobileMenuTrigger.click();
      await mobileMenu.waitFor({ state: "visible" });
    }
  }

  const actionTrigger = nav.locator('[data-slot="navbar-mobile-actions-trigger"]').first();

  if ((await actionTrigger.count()) > 0) {
    await expectTargetInViewport(
      page,
      actionTrigger,
      storyId,
      "navbar mobile actions trigger",
      storyFindings,
    );
  }
}

async function expectTargetInViewport(
  page: Page,
  locator: Locator,
  storyId: string,
  label: string,
  storyFindings: MobileUsabilityFinding[],
) {
  const box = await locator.boundingBox();

  if (!box) {
    return;
  }

  if (!(await boxFitsHorizontally(page, box))) {
    storyFindings.push(
      createFinding(
        {
          componentName: "navbar",
          tier: "shell",
          storyId,
          storyTitle: "Components/Navigation/Navbar",
          storyName: storyId.endsWith("mobile-many-groups") ? "Mobile Many Groups" : "Mobile",
          importPath: "src/components/shell/navbar.stories.tsx",
        },
        "target-actionability",
        `${label} does not fit horizontally.`,
        undefined,
        box,
      ),
    );
  }
}

function getOverlaySelector(storyId: string) {
  if (storyId.includes("context-action-menu")) {
    return '[data-slot="context-action-menu-content"]';
  }

  if (storyId.includes("action-menu") && !storyId.includes("responsive-action-menu")) {
    return '[data-slot="action-menu-content"]';
  }

  if (storyId.includes("action-sheet") || storyId.includes("responsive-action-menu--mobile-mode")) {
    return '[data-slot="action-sheet-content"]';
  }

  if (storyId.includes("hover-preview")) {
    return '[data-slot="hover-preview-content"]';
  }

  if (storyId === "components-navigation-navbar--mobile-many-groups") {
    return '[data-slot="navbar-mobile-menu"]';
  }

  return null;
}

function discoverStoriesForComponent(component: ComponentRegistryEntry): MobileUsabilityStory[] {
  const storyFiles = new Set(component.storyFiles.map(normalizeImportPath));

  return storyIndexEntries
    .filter((entry) => storyFiles.has(normalizeImportPath(entry.importPath)))
    .map((entry) => {
      const explicitSkipReason = getExplicitSkipReason(entry);
      const inferredSkipReason = getInferredDesktopOnlySkipReason(entry);

      return {
        componentName: component.name,
        tier: component.tier,
        storyId: entry.id,
        storyTitle: entry.title,
        storyName: entry.name,
        importPath: normalizeImportPath(entry.importPath),
        exportName: entry.exportName,
        skipReason: explicitSkipReason ?? inferredSkipReason,
      };
    });
}

function getExplicitSkipReason(entry: StoryIndexEntry) {
  if (!entry.exportName) {
    return null;
  }

  const filePath = normalizeImportPath(entry.importPath);
  let sourceSkips = sourceSkipCache.get(filePath);

  if (!sourceSkips) {
    sourceSkips = readSourceSkipMap(filePath);
    sourceSkipCache.set(filePath, sourceSkips);
  }

  const reason = sourceSkips.get(entry.exportName);

  return reason && reason.length > 0 ? reason : null;
}

function readSourceSkipMap(importPath: string) {
  const skipMap = new Map<string, string | null>();
  const sourcePath = path.join(packageRoot, importPath);
  const source = readFileSync(sourcePath, "utf8");
  const exportPattern = /export\s+const\s+([A-Za-z0-9_]+)[^=]*=\s*\{/g;

  for (const match of source.matchAll(exportPattern)) {
    const exportName = match[1];
    const objectStart = source.indexOf("{", match.index ?? 0);
    const objectEnd = findMatchingBrace(source, objectStart);

    if (objectStart === -1 || objectEnd === -1) {
      continue;
    }

    const block = source.slice(objectStart, objectEnd + 1);

    if (/mobileUsability\s*:\s*\{[\s\S]*?skip\s*:\s*true/.test(block)) {
      skipMap.set(exportName, block.match(/reason\s*:\s*["'`]([^"'`]+)["'`]/)?.[1]?.trim() ?? null);
    }
  }

  return skipMap;
}

function getInferredDesktopOnlySkipReason(entry: StoryIndexEntry) {
  const intent = `${entry.id} ${entry.name} ${entry.title}`;

  return /(^|[-_\s/])(desktop|web)([-_\s/]|$)/i.test(intent)
    ? "Story name, title, or id indicates desktop/web-only intent."
    : null;
}

function createFinding(
  story: MobileUsabilityStory,
  category: MobileUsabilityFinding["category"],
  message: string,
  selector?: string,
  boundingBox?: BoundingBox,
): MobileUsabilityFinding {
  return {
    component: story.componentName,
    tier: story.tier,
    storyId: story.storyId,
    storyTitle: story.storyTitle,
    storyName: story.storyName,
    importPath: story.importPath,
    viewport: mobileUsabilityViewport,
    severity: "fail",
    category,
    message,
    selector,
    boundingBox: boundingBox ? roundBox(boundingBox) : undefined,
  };
}

async function attachStoryScreenshot(
  page: Page,
  story: MobileUsabilityStory,
  storyFindings: MobileUsabilityFinding[],
  testInfo: TestInfo,
) {
  const screenshotPath = testInfo.outputPath(`${story.storyId}.png`);

  await page.screenshot({ fullPage: true, path: screenshotPath }).catch(() => undefined);

  for (const finding of storyFindings) {
    finding.screenshotPath = path.relative(packageRoot, screenshotPath);
  }
}

function formatFindingSummary(reportFindings: MobileUsabilityFinding[]) {
  if (reportFindings.length === 0) {
    return "component has no mobile usability findings";
  }

  return reportFindings
    .map((finding) => `${finding.storyId} [${finding.category}]: ${finding.message}`)
    .join("\n");
}

async function boxFitsHorizontally(page: Page, box: BoundingBox) {
  const viewportWidth = await page.evaluate(
    () => document.documentElement.clientWidth || window.innerWidth,
  );

  return box.x >= -1 && box.x + box.width <= viewportWidth + 1;
}

function hasFiniteBox(box: BoundingBox) {
  return (
    Number.isFinite(box.x) &&
    Number.isFinite(box.y) &&
    Number.isFinite(box.width) &&
    Number.isFinite(box.height) &&
    box.width >= 0 &&
    box.height >= 0
  );
}

function roundBox(box: BoundingBox) {
  return {
    x: Math.round(box.x),
    y: Math.round(box.y),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}

function normalizeImportPath(importPath: string) {
  return importPath.replace(/^\.\//, "");
}

function findMatchingBrace(source: string, start: number) {
  if (start < 0 || source[start] !== "{") {
    return -1;
  }

  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}
