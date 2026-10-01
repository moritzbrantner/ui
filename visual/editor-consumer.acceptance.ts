import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`packed editor reference supports exact input and keyboard commands at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("status", { name: "Editor activity" })).toHaveText("Preview ready");
    const x = page.getByRole("spinbutton", { name: "Position X" });
    await x.click();
    await x.fill("3.456789");
    await x.press("Tab");
    await expect(x).toHaveValue("3.457");
    await expect(page.getByLabel("Preview transform")).toContainText("3.456789");
    await x.click();
    await x.press("r");
    await expect(page.getByLabel("Preview transform")).toContainText("3.456789");
    await x.press("Escape");
    const preview = page.getByRole("button", { name: "Select Square in preview" });
    await preview.focus();
    await page.keyboard.press("Control+k");
    const search = page.getByRole("dialog").getByRole("combobox");
    await search.fill("Reset transform");
    await expect(page.getByRole("option", { name: /Reset transform/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await search.press("Enter");
    await expect(page.getByLabel("Preview transform")).toContainText("1.234567");
    await preview.focus();
    await page.keyboard.press("Escape");
    await expect(page.getByText("No object selected")).toBeVisible();
    await page.getByRole("button", { name: "Select Square", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Square properties" })).toBeVisible();
    await expect(page.locator("html")).toHaveJSProperty("scrollWidth", width);
  });
}
