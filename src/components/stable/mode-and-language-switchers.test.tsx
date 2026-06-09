import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import {
  LanguageSwitcher,
  ThemeModeSwitch,
  type LanguageSwitcherLanguage,
  type ThemeMode,
} from "../../index";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const languages = [
  { value: "en", label: "English", flag: <span>EN</span> },
  { value: "de", label: "Deutsch", flag: <span>DE</span> },
  { value: "fr", label: "Francais", flag: <span>FR</span> },
] as const satisfies readonly LanguageSwitcherLanguage[];

describe("@moritzbrantner/ui mode and language switchers", () => {
  test("theme mode switch exposes a dedicated light and dark state contract", () => {
    const onModeChange = vi.fn();

    render(<ThemeModeSwitch defaultMode="light" onModeChange={onModeChange} />);

    const switchControl = screen.getByRole("switch", { name: "Color mode" });

    expect(switchControl.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(switchControl);

    expect(switchControl.getAttribute("aria-checked")).toBe("true");
    expect(onModeChange).toHaveBeenCalledWith("dark");

    fireEvent.click(switchControl);

    expect(switchControl.getAttribute("aria-checked")).toBe("false");
    expect(onModeChange).toHaveBeenCalledWith("light");
  });

  test("theme mode switch uses theme tokens for its shell and thumb treatment", () => {
    const { container } = render(<ThemeModeSwitch defaultMode="light" />);

    const switchControl = screen.getByRole("switch", { name: "Color mode" });
    const thumb = container.querySelector('[data-slot="theme-mode-switch"] > span[aria-hidden]');

    expect(switchControl.className).toContain("w-[var(--ui-theme-mode-switch-width)]");
    expect(switchControl.className).toContain("h-[var(--ui-theme-mode-switch-height)]");
    expect(switchControl.className).toContain("rounded-[var(--ui-theme-mode-switch-radius)]");
    expect(switchControl.className).toContain("border-border");
    expect(switchControl.className).not.toContain("bg-sky");
    expect(thumb?.className).toContain("size-[var(--ui-theme-mode-switch-thumb-size)]");
    expect(thumb?.className).toContain("rounded-[var(--ui-theme-mode-switch-thumb-radius)]");
    expect(thumb?.className).toContain(
      "group-data-[mode=dark]/theme-mode-switch:translate-x-[var(--ui-theme-mode-switch-thumb-translate)]",
    );
  });

  test("theme mode switch supports controlled mode changes", () => {
    const onModeChange = vi.fn();

    function Harness() {
      const [mode, setMode] = React.useState<ThemeMode>("dark");

      return (
        <ThemeModeSwitch
          mode={mode}
          onModeChange={(nextMode) => {
            setMode(nextMode);
            onModeChange(nextMode);
          }}
        />
      );
    }

    render(<Harness />);

    const switchControl = screen.getByRole("switch", { name: "Color mode" });

    expect(switchControl.getAttribute("data-mode")).toBe("dark");

    fireEvent.click(switchControl);

    expect(switchControl.getAttribute("data-mode")).toBe("light");
    expect(onModeChange).toHaveBeenCalledWith("light");
  });

  test("language switcher keeps the closed control flag-only and shows names while selecting", async () => {
    const onValueChange = vi.fn();

    const { rerender } = render(
      <LanguageSwitcher
        languages={languages}
        defaultValue="en"
        onValueChange={(nextValue, language) => onValueChange(nextValue, language.label)}
      />,
    );

    screen.getByRole("button", { name: "Language: English" });

    expect(screen.queryByText("English")).toBeNull();

    rerender(
      <LanguageSwitcher
        key="open-language-switcher"
        languages={languages}
        defaultValue="en"
        defaultOpen
        onValueChange={(nextValue, language) => onValueChange(nextValue, language.label)}
      />,
    );

    expect(await screen.findByRole("menuitemradio", { name: "English" })).toBeTruthy();
    expect(screen.getByRole("menuitemradio", { name: "Deutsch" })).toBeTruthy();

    fireEvent.click(screen.getByRole("menuitemradio", { name: "Deutsch" }));

    expect(onValueChange).toHaveBeenCalledWith("de", "Deutsch");
    expect(screen.getByRole("button", { name: "Language: Deutsch" })).toBeTruthy();
    expect(screen.queryByText("Deutsch")).toBeNull();
  });
});
