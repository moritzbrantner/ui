import { expect, test } from "@playwright/test";

for (const width of [360, 390, 768, 1440]) {
  for (const theme of ["light", "dark"]) {
    test(`reference editor preserves exact edits and docking at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `/iframe.html?id=components-editors-editor-workbench--reference&globals=designSystem:studio;theme:${theme}`,
      );
      const preview = page.getByRole("button", { name: "Select Square in preview" });
      await expect(page.getByRole("status", { name: "Editor activity" })).toHaveText(
        "Panel layout restored",
      );
      const x = page.getByRole("spinbutton", { name: "Position X" });
      await x.click();
      await x.fill("2.987654");
      await x.press("Tab");
      await expect(x).toHaveValue("2.988");
      await expect(page.getByLabel("Preview transform")).toContainText("2.987654");
      const dial = page.getByRole("slider", { name: "Rotation dial" });
      const dialBox = await dial.boundingBox();
      if (!dialBox) throw new Error("Rotation dial has no usable bounds");
      await dial.click({ position: { x: dialBox.width * 0.75, y: dialBox.height / 2 } });
      const directAngle = await dial.getAttribute("aria-valuenow");
      if (directAngle === null) throw new Error("Rotation dial did not expose its accepted value");
      expect(Number(directAngle)).toBeGreaterThan(80);
      expect(Number(directAngle)).toBeLessThan(100);
      await expect(page.getByRole("spinbutton", { name: "Rotation degrees" })).toHaveAttribute(
        "aria-valuenow",
        directAngle,
      );
      await expect(page.getByLabel("Preview transform")).toContainText(`rotation ${directAngle}°`);
      const exactAngle = page.getByRole("spinbutton", { name: "Rotation degrees" });
      await exactAngle.click();
      await exactAngle.fill("42.123");
      await exactAngle.press("Tab");
      await expect(dial).toHaveAttribute("aria-valuenow", "42.123");
      await expect(page.getByLabel("Preview transform")).toContainText("rotation 42.123°");
      const time = page.getByRole("spinbutton", { name: "Preview time" });
      await time.click();
      await time.fill("4.987654");
      await time.press("Tab");
      await expect(page.getByRole("slider", { name: "Preview time scrubber" })).toHaveValue(
        "4.987654",
      );
      await page.getByRole("combobox", { name: "Move Inspector panel" }).selectOption("left");
      await expect(page.getByRole("tab", { name: "Inspector", exact: true })).toBeFocused();
      await expect(page.getByRole("spinbutton", { name: "Position X" })).toHaveAttribute(
        "aria-valuenow",
        "2.987654",
      );
      await page.getByRole("button", { name: "Restore panel layout" }).click();
      await expect(page.getByRole("combobox", { name: "Move Inspector panel" })).toHaveValue(
        "right",
      );
      if (width >= 768) {
        await expect
          .poll(async () =>
            Math.abs(
              Number(
                await page
                  .getByRole("separator", { name: "Resize left panel" })
                  .getAttribute("aria-valuenow"),
              ) - 22,
            ),
          )
          .toBeLessThan(1);
      }
      await expect(page.getByRole("spinbutton", { name: "Position X" })).toHaveAttribute(
        "aria-valuenow",
        "2.987654",
      );
      await preview.focus();
      await page.keyboard.press("Control+k");
      await page.getByRole("dialog").getByRole("combobox").fill("Reset transform");
      await page.keyboard.press("Enter");
      await expect(page.getByLabel("Preview transform")).toContainText("1.234567");
      await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
      await page.keyboard.press("Escape");
      await preview.focus();
      await page.keyboard.press("Escape");
      await expect(page.getByText("No object selected")).toBeVisible();
      await page.getByRole("button", { name: "Select Square", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Square properties" })).toBeVisible();
    });
  }
}

test.describe("touch editor interaction", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test("keeps exact editing, direct manipulation and commands available through touch", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=components-editors-editor-workbench--reference&globals=designSystem:studio;theme:dark",
    );
    await expect(page.getByRole("status", { name: "Editor activity" })).toHaveText(
      "Panel layout restored",
    );
    const dial = page.getByRole("slider", { name: "Rotation dial" });
    const box = await dial.boundingBox();
    if (!box) throw new Error("Rotation dial has no usable bounds");
    await dial.tap({ position: { x: box.width * 0.75, y: box.height / 2 } });
    const value = await dial.getAttribute("aria-valuenow");
    if (value === null) throw new Error("Rotation dial did not expose its accepted value");
    await expect(page.getByRole("spinbutton", { name: "Rotation degrees" })).toHaveAttribute(
      "aria-valuenow",
      value,
    );
    const exact = page.getByRole("spinbutton", { name: "Rotation degrees" });
    await exact.tap();
    await exact.fill("32.123");
    await page.getByRole("button", { name: "Select Square in preview" }).tap();
    await expect(page.getByLabel("Preview transform")).toContainText("rotation 32.123°");
    await page.getByRole("button", { name: "Commands (Mod+K)" }).tap();
    const commandInput = page.getByRole("dialog").getByRole("combobox");
    await commandInput.tap();
    await commandInput.fill("Reset transform");
    await page.getByRole("option", { name: /Reset transform/ }).tap();
    await expect(page.getByLabel("Preview transform")).toContainText("rotation 12.345°");
    await page.getByRole("button", { name: "Clear selection" }).tap();
    await expect(page.getByText("No object selected")).toBeVisible();
    await page.getByRole("button", { name: "Select Square", exact: true }).tap();
    await expect(page.getByRole("heading", { name: "Square properties" })).toBeVisible();
  });
});

test("retains vertical panel sizing across responsive presentation and restores it separately from objects", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    "/iframe.html?id=components-editors-editor-workbench--reference&globals=designSystem:studio;theme:dark",
  );
  await expect(page.getByRole("status", { name: "Editor activity" })).toHaveText(
    "Panel layout restored",
  );
  const separator = page.getByRole("separator", { name: "Resize bottom panel" });
  const original = Number(await separator.getAttribute("aria-valuenow"));
  await separator.focus();
  await separator.press("ArrowUp");
  await expect
    .poll(async () => Number(await separator.getAttribute("aria-valuenow")))
    .not.toBe(original);
  const resized = Number(await separator.getAttribute("aria-valuenow"));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(separator).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect
    .poll(async () => Math.abs(Number(await separator.getAttribute("aria-valuenow")) - resized))
    .toBeLessThan(1);
  await page.getByRole("button", { name: "Restore panel layout" }).click();
  await expect
    .poll(async () => Math.abs(Number(await separator.getAttribute("aria-valuenow")) - original))
    .toBeLessThan(1);
  await separator.focus();
  await separator.press("ArrowUp");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(separator).toHaveCount(0);
  await page.getByRole("button", { name: "Restore panel layout" }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect
    .poll(async () => Math.abs(Number(await separator.getAttribute("aria-valuenow")) - original))
    .toBeLessThan(1);
  await expect(page.getByLabel("Preview transform")).toContainText("1.234567");
  await expect(page.getByLabel("Exact preview time")).toHaveText("2.345678 s");
});
