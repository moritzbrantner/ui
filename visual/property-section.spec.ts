import { expect, test } from "@playwright/test";

for (const width of [360, 1440]) {
  test(`property section contains its rotating disclosure icon at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(
      "/iframe.html?id=components-forms-inputs-property--default&globals=designSystem:bobba;theme:light",
    );
    const trigger = page.getByRole("button", { name: "Transform" });
    await expect(page.getByRole("spinbutton", { name: "Width" })).toHaveValue("9.88");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const icon = trigger.locator("svg");
    await icon.evaluate((element) =>
      element.getAnimations().forEach((animation) => animation.finish()),
    );
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const layout = await trigger.evaluate((element) => {
      const icon = element.querySelector("svg")!;
      const animations = icon.getAnimations();
      if (!animations.length) throw new Error("Expected the real disclosure transition");
      for (const animation of animations) {
        animation.pause();
        const duration = animation.effect!.getComputedTiming().duration;
        if (typeof duration !== "number" || duration <= 0)
          throw new Error("Expected a bounded transition duration");
        animation.currentTime = duration / 2;
      }
      return {
        overflowWidth: element.scrollWidth - element.clientWidth,
        overflowHeight: element.scrollHeight - element.clientHeight,
        rotation: getComputedStyle(icon).rotate,
      };
    });
    expect(layout.overflowWidth, JSON.stringify(layout)).toBeLessThanOrEqual(2);
    expect(layout.overflowHeight, JSON.stringify(layout)).toBeLessThanOrEqual(2);
  });
}
