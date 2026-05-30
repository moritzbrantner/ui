import type * as React from "react";

export type MediaGalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  description?: string;
  height?: number;
  metadata?: Record<string, unknown>;
  thumbnailSrc?: string;
  title?: string;
  width?: number;
};

export type ImageGallerySelection = {
  id: string;
  index: number;
  item: MediaGalleryItem;
};

export type OnGallerySelect = (selection: ImageGallerySelection) => void;

export type OnGalleryKeyNav = (
  selection: ImageGallerySelection,
  event: React.KeyboardEvent<HTMLElement>,
) => void;
