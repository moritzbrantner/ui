import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { ImageCropper } from "./image-cropper";
import { ImageFilterEditor } from "./image-filter-editor";

const imageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23d9e2ff'/%3E%3C/svg%3E";

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("media components", () => {
  test("renders image cropper controls and reports crop changes", () => {
    const onCropChange = vi.fn();

    render(<ImageCropper src={imageSrc} alt="Release preview" onCropChange={onCropChange} />);

    const surface = screen.getByRole("application", { name: "Crop image" });
    expect(surface.getAttribute("data-slot")).toBe("image-cropper-surface");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(onCropChange).toHaveBeenCalledWith(expect.objectContaining({ zoom: 1.1 }));
  });

  test("renders image filter editor presets and emits filter changes", () => {
    const onValueChange = vi.fn();

    render(
      <ImageFilterEditor
        src={imageSrc}
        alt="Filtered release image"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Warm" }));
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ sepia: 18 }));
  });
});
