import { expect, test } from "@playwright/test";

const workbench =
  "/iframe.html?id=components-editors-editor-pane-layout--workbench&globals=designSystem:studio;theme:light";

test("drags a docked pane splitter with the pointer and keeps the canvas dominant", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(workbench);
  const resizer = page.getByRole("separator", { name: "Resize Inspector" });
  const pane = page.getByRole("region", { name: "Inspector" });
  // Wait for the story interaction to restore the pane.
  await expect(pane).toBeVisible();
  await expect(resizer).toHaveAttribute("aria-valuenow", "316");
  const box = await resizer.boundingBox();
  if (!box) throw new Error("Resizer has no box");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 60, y, { steps: 6 });
  await page.mouse.up();
  await expect(resizer).toHaveAttribute("aria-valuenow", "376");
  await expect.poll(async () => Math.round((await pane.boundingBox())?.width ?? 0)).toBe(376);

  const main = page.locator('[data-slot="editor-pane-main"]').nth(1);
  const mainBox = await main.boundingBox();
  expect(mainBox?.width ?? 0).toBeGreaterThan(600);

  await page.mouse.move(x - 60, y);
  await page.mouse.down();
  await page.mouse.move(x + 400, y, { steps: 6 });
  await page.mouse.up();
  await expect(resizer).toHaveAttribute("aria-valuetext", "Collapsed");
  await expect(page.getByRole("button", { name: "Show Inspector" })).toBeVisible();
});

for (const width of [360, 390]) {
  test(`presents side panes as overlay drawers at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(workbench);
    const layout = page.locator('[data-slot="editor-pane-layout"][data-orientation="horizontal"]');
    await expect(layout).toHaveAttribute("data-presentation", "overlay");
    await expect(page.getByRole("separator", { name: "Resize Inspector" })).toHaveCount(0);
    // The vertical timeline split stays docked and resizable.
    await expect(page.getByRole("separator", { name: "Resize Timeline" })).toBeVisible();

    const show = page.getByRole("button", { name: "Show Inspector" });
    await show.click();
    const pane = page.getByRole("region", { name: "Inspector" });
    await expect(pane).toBeFocused();
    const layoutBox = await layout.boundingBox();
    if (!layoutBox) throw new Error("Layout has no box");
    // Once the slide-in settles the drawer sits inside the layout and leaves a strip of canvas.
    await expect
      .poll(async () => {
        const paneBox = await pane.boundingBox();
        return paneBox
          ? Math.round(layoutBox.x + layoutBox.width - (paneBox.x + paneBox.width))
          : -1;
      })
      .toBe(0);
    const paneBox = await pane.boundingBox();
    expect(paneBox!.x).toBeGreaterThan(layoutBox.x);
    await page.getByRole("spinbutton", { name: "Width" }).fill("333");
    await page.keyboard.press("Enter");
    // NumericInput consumes Escape to discard drafts; Escape elsewhere in the drawer closes it.
    await pane.locator('[data-slot="editor-inspector-title"]').click();
    await page.keyboard.press("Escape");
    await expect(pane).toHaveAttribute("data-state", "closed");
    await expect(pane).toBeHidden();
    await expect(show).toBeFocused();
    await show.click();
    await expect(page.getByRole("spinbutton", { name: "Width" })).toHaveAttribute(
      "aria-valuenow",
      "333",
    );

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width + 1);
  });
}

test("overlay drawers do not animate under reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(workbench);
  const pane = page.locator("#story-inspector");
  await expect(pane).toHaveAttribute("data-presentation", "overlay");
  const transition = await pane.evaluate((element) => getComputedStyle(element).transitionProperty);
  expect(transition).toBe("none");
});

test("gives editor commands larger hit targets on coarse pointers", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 800 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(
    "/iframe.html?id=components-editors-editor-toolbar--compact&globals=designSystem:studio;theme:light",
  );
  const coarse = await page.evaluate(() => matchMedia("(pointer: coarse)").matches);
  test.skip(!coarse, "This browser build does not report a coarse pointer for touch contexts.");
  const box = await page.getByRole("button", { name: "Undo" }).boundingBox();
  expect(Math.min(box?.width ?? 0, box?.height ?? 0)).toBeGreaterThanOrEqual(44);
  await context.close();
});
