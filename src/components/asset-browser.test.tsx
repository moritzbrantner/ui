import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { AssetBrowser, type AssetBrowserItem } from "./asset-browser";

const assets: AssetBrowserItem[] = [
  {
    id: "folder-brand",
    name: "Brand",
    type: "folder",
  },
  {
    id: "hero",
    name: "hero-image.jpg",
    type: "image",
    size: 2_400_000,
  },
  {
    id: "brief",
    name: "creative-brief.pdf",
    type: "document",
    size: 480_000,
  },
];

describe("AssetBrowser", () => {
  test("supports selecting multiple assets with visible selection controls", () => {
    const onSelectionChange = vi.fn();

    render(
      <AssetBrowser
        items={assets}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      />,
    );

    const listbox = screen.getByRole("listbox", { name: "Assets" });
    expect(listbox.getAttribute("aria-multiselectable")).toBe("true");
    expect(screen.getByRole("button", { name: "Select all assets" })).toBeTruthy();

    fireEvent.click(screen.getByRole("option", { name: /hero-image.jpg/ }));
    fireEvent.click(screen.getByRole("option", { name: /creative-brief.pdf/ }));

    expect(screen.getByText("2 of 3 selected")).toBeTruthy();
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      ["hero", "brief"],
      [assets[1], assets[2]],
    );
    expect(listbox.querySelectorAll("[data-slot='asset-browser-selection-mark']").length).toBe(3);
  });

  test("uses a compact mobile layout and hides preview by default", () => {
    const { container } = render(
      <AssetBrowser items={assets} layout="mobile" selectionMode="multiple" defaultView="list" />,
    );

    expect(container.querySelector("[data-slot='asset-browser']")?.getAttribute("data-layout")).toBe(
      "mobile",
    );
    expect(container.querySelector("[data-slot='asset-browser-preview']")).toBeNull();
  });
});
