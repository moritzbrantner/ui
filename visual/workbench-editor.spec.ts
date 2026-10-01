import { expect, test } from "@playwright/test";

test("honors one-sided workbench percentage defaults", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    "/iframe.html?id=components-layout-workbench-layout--left-panel-only&globals=designSystem:studio;theme:light",
  );
  const panel = page.locator('[data-slot="workbench-panel"][data-side="left"]:visible');
  await expect(panel).toBeVisible();
  const group = page
    .locator('[data-slot="workbench-desktop-layout"] [data-slot="resizable-panel-group"]')
    .nth(1);
  await expect
    .poll(async () => {
      const panelBox = await panel.boundingBox();
      const groupBox = await group.boundingBox();
      if (!panelBox || !groupBox || groupBox.width === 0) return Infinity;
      return Math.abs((panelBox.width / groupBox.width) * 100 - 22);
    })
    .toBeLessThan(1);
});

for (const width of [360, 390, 768, 1440]) {
  test(`preserves exact values and focus when docking at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/iframe.html?id=components-layout-workbench-layout--docking&globals=designSystem:studio;theme:dark",
    );
    const input = page.getByRole("spinbutton", { name: "Preview scale" });
    // Wait for the story's own interaction to finish before testing another edit.
    await expect(page.getByRole("tab", { name: "Inspector" })).toBeFocused();
    await input.click();
    await input.fill("3.141592");
    await input.press("Tab");
    await expect(input).toHaveValue("3.14");
    await expect(page.getByLabel("Exact preview scale")).toHaveText("3.141592");
    await page.getByRole("combobox", { name: "Move Inspector panel" }).selectOption("bottom");
    await expect(page.getByRole("tab", { name: "Inspector" })).toBeFocused();
    await expect(page.getByRole("spinbutton", { name: "Preview scale" })).toHaveAttribute(
      "aria-valuenow",
      "3.141592",
    );
    await expect(page.locator('[data-slot="workbench-canvas"]')).toHaveCount(1);
    await page.setViewportSize({ width: width < 768 ? 1440 : 390, height: 900 });
    await expect(page.getByRole("spinbutton", { name: "Preview scale" })).toHaveAttribute(
      "aria-valuenow",
      "3.141592",
    );
    await expect(page.locator('[data-slot="workbench-canvas"]')).toHaveCount(1);
  });
}

test("supports native keyboard resizing and explicit app-controlled restoration", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    "/iframe.html?id=components-layout-workbench-layout--docking&globals=designSystem:studio;theme:light",
  );
  await expect(page.getByRole("tab", { name: "Inspector" })).toBeFocused();
  const handle = page.getByRole("separator", { name: "Resize left panel" });
  const before = Number(await handle.getAttribute("aria-valuenow"));
  await handle.focus();
  await handle.press("ArrowRight");
  await expect
    .poll(async () => Number(await handle.getAttribute("aria-valuenow")))
    .toBeGreaterThan(before);
  await page.getByRole("button", { name: "Restore panel sizes" }).click();
  await expect
    .poll(async () => Math.abs(Number(await handle.getAttribute("aria-valuenow")) - 22))
    .toBeLessThan(1);
});
