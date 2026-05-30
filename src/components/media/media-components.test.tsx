import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { AnimatedImage } from "./animated-image";
import { ImageCarousel } from "./image-carousel";
import { ImageCropper } from "./image-cropper";
import { ImageFilterEditor } from "./image-filter-editor";
import { ImageGallery } from "./image-gallery";
import { ImageThumbnailStrip } from "./image-thumbnail-strip";
import type { MediaGalleryItem } from "./media-gallery-types";

const imageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23d9e2ff'/%3E%3C/svg%3E";
const animatedImageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f8c8dc'/%3E%3C/svg%3E";
const galleryItems: MediaGalleryItem[] = [
  {
    id: "cover",
    src: imageSrc,
    alt: "Cover image",
    title: "Cover",
    caption: "Primary frame",
  },
  {
    id: "detail",
    src: animatedImageSrc,
    alt: "Detail image",
    title: "Detail",
    caption: "Secondary frame",
  },
  {
    id: "texture",
    src: imageSrc,
    alt: "Texture image",
    title: "Texture",
    caption: "Pattern frame",
  },
];

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  globalThis.IntersectionObserver ??= class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly scrollMargin = "";
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
  window.matchMedia ??= vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView ??= vi.fn();
});

describe("media components", () => {
  test("animated image swaps source on hover and restores on leave", () => {
    const onPlaybackChange = vi.fn();

    render(
      <AnimatedImage
        staticSrc={imageSrc}
        animatedSrc={animatedImageSrc}
        alt="Animated preview"
        onPlaybackChange={onPlaybackChange}
      />,
    );
    onPlaybackChange.mockClear();

    const image = screen.getByAltText("Animated preview");
    const root = image.closest("[data-slot='animated-image']");

    expect(image.getAttribute("src")).toBe(imageSrc);

    fireEvent.mouseEnter(root as Element);
    expect(image.getAttribute("src")).toBe(animatedImageSrc);
    expect(onPlaybackChange).toHaveBeenLastCalledWith(true);

    fireEvent.mouseLeave(root as Element);
    expect(image.getAttribute("src")).toBe(imageSrc);
    expect(onPlaybackChange).toHaveBeenLastCalledWith(false);
  });

  test("animated image swaps source on focus and restores on blur", () => {
    render(
      <AnimatedImage staticSrc={imageSrc} animatedSrc={animatedImageSrc} alt="Focus preview" />,
    );

    const image = screen.getByAltText("Focus preview");
    const root = image.closest("[data-slot='animated-image']") as HTMLElement;

    fireEvent.focus(root);
    expect(image.getAttribute("src")).toBe(animatedImageSrc);

    fireEvent.blur(root);
    expect(image.getAttribute("src")).toBe(imageSrc);
  });

  test("animated image honors reduced motion preference", () => {
    const originalMatchMedia = window.matchMedia;

    try {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      }));

      render(
        <AnimatedImage
          staticSrc={imageSrc}
          animatedSrc={animatedImageSrc}
          alt="Reduced motion preview"
        />,
      );

      const image = screen.getByAltText("Reduced motion preview");
      const root = image.closest("[data-slot='animated-image']");

      fireEvent.mouseEnter(root as Element);
      expect(image.getAttribute("src")).toBe(imageSrc);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

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

  test("image carousel moves slides and calls slide callbacks", () => {
    const onSlideChange = vi.fn();
    const onSlideActivate = vi.fn();

    render(
      <ImageCarousel
        items={galleryItems}
        onSlideChange={onSlideChange}
        onSlideActivate={onSlideActivate}
      />,
    );

    expect(screen.getByAltText("Cover image")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(onSlideChange).toHaveBeenLastCalledWith(1, galleryItems[1]);
    expect(screen.getByRole("button", { name: /Detail/ }).getAttribute("data-active")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: /Detail/ }));
    expect(onSlideActivate).toHaveBeenCalledWith(1, galleryItems[1]);
  });

  test("image gallery renders variants and emits selection", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <ImageGallery items={galleryItems} onSelect={onSelect} variant="grid" />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(galleryItems.length);
    expect(screen.getByRole("list").getAttribute("data-variant")).toBe("grid");

    fireEvent.click(screen.getByRole("button", { name: /Detail/ }));
    expect(onSelect).toHaveBeenCalledWith({
      id: "detail",
      index: 1,
      item: galleryItems[1],
    });

    rerender(<ImageGallery items={galleryItems} variant="masonry" />);
    expect(screen.getByRole("list").getAttribute("data-variant")).toBe("masonry");

    rerender(<ImageGallery items={galleryItems} variant="stack" />);
    expect(screen.getByRole("list").getAttribute("data-variant")).toBe("stack");
  });

  test("image thumbnail strip marks selection and supports keyboard activation", () => {
    const onSelect = vi.fn();

    render(<ImageThumbnailStrip items={galleryItems} onSelect={onSelect} showCount />);

    expect(screen.getByText("3 images")).toBeTruthy();

    const detailThumbnail = screen.getByRole("option", { name: "Detail" });

    fireEvent.click(detailThumbnail);
    expect(detailThumbnail.getAttribute("aria-selected")).toBe("true");
    expect(onSelect).toHaveBeenLastCalledWith({
      id: "detail",
      index: 1,
      item: galleryItems[1],
    });

    const textureThumbnail = screen.getByRole("option", { name: "Texture" });
    fireEvent.focus(textureThumbnail);
    fireEvent.keyDown(textureThumbnail, { key: "Enter" });
    expect(textureThumbnail.getAttribute("aria-selected")).toBe("true");
    expect(onSelect).toHaveBeenLastCalledWith({
      id: "texture",
      index: 2,
      item: galleryItems[2],
    });
  });
});
