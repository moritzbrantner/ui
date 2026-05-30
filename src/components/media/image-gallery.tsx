"use client";

import * as React from "react";

import { Badge } from "../stable/badge";
import { cn } from "../../lib/cn";
import type {
  ImageGallerySelection,
  MediaGalleryItem,
  OnGallerySelect,
} from "./media-gallery-types";

type ImageGalleryVariant = "grid" | "masonry" | "stack";
type ImageGalleryCardVariant = "default" | "borderless" | "elevated";

export type ImageGalleryProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  cardVariant?: ImageGalleryCardVariant;
  columns?: number;
  defaultSelectedId?: string;
  gap?: number | string;
  items: MediaGalleryItem[];
  onSelect?: OnGallerySelect;
  renderItem?: (
    item: MediaGalleryItem,
    state: {
      index: number;
      isSelected: boolean;
      select: () => void;
      selection: ImageGallerySelection;
    },
  ) => React.ReactNode;
  selectedId?: string;
  showCaption?: boolean;
  showOverlay?: boolean;
  variant?: ImageGalleryVariant;
};

function ImageGallery({
  cardVariant = "default",
  className,
  columns = 3,
  defaultSelectedId,
  gap = 3,
  items,
  onSelect,
  renderItem,
  selectedId,
  showCaption = true,
  showOverlay = false,
  style,
  variant = "grid",
  ...props
}: ImageGalleryProps) {
  const [internalSelectedId, setInternalSelectedId] = React.useState(defaultSelectedId);
  const currentSelectedId = selectedId ?? internalSelectedId;
  const gapValue = typeof gap === "number" ? `${gap * 0.25}rem` : gap;
  const boundedColumns = Math.max(1, Math.min(6, Math.round(columns)));
  const layoutStyle: React.CSSProperties =
    variant === "grid"
      ? {
          ...style,
          gap: gapValue,
          gridTemplateColumns: `repeat(${boundedColumns}, minmax(0, 1fr))`,
        }
      : variant === "masonry"
        ? { ...style, columnCount: boundedColumns, columnGap: gapValue }
        : { ...style, gap: gapValue };

  const selectItem = (item: MediaGalleryItem, index: number) => {
    const selection = { id: item.id, index, item };

    setInternalSelectedId(item.id);
    onSelect?.(selection);
  };

  return (
    <div
      data-slot="image-gallery"
      data-variant={variant}
      className={cn(
        variant === "grid" && "grid",
        variant === "masonry" && "block",
        variant === "stack" && "flex flex-col",
        className,
      )}
      role="list"
      style={layoutStyle}
      {...props}
    >
      {items.map((item, index) => {
        const isSelected = item.id === currentSelectedId;
        const selection = { id: item.id, index, item };

        return (
          <div
            key={item.id}
            data-slot="image-gallery-item"
            data-selected={isSelected ? true : undefined}
            role="listitem"
            className={cn(variant === "masonry" && "mb-3 break-inside-avoid")}
          >
            {renderItem ? (
              renderItem(item, {
                index,
                isSelected,
                select: () => selectItem(item, index),
                selection,
              })
            ) : (
              <button
                data-slot="image-gallery-card"
                data-card-variant={cardVariant}
                data-selected={isSelected ? true : undefined}
                type="button"
                aria-pressed={isSelected}
                className={cn(
                  "group relative grid w-full overflow-hidden rounded-md text-left outline-none transition-[border-color,box-shadow,transform] focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  cardVariant === "default" && "border border-border/70 bg-card",
                  cardVariant === "borderless" && "bg-transparent",
                  cardVariant === "elevated" && "border border-border/60 bg-card shadow-sm",
                  isSelected && "border-ring shadow-[0_0_0_1px_var(--ring)]",
                )}
                onClick={() => selectItem(item, index)}
              >
                <img
                  data-slot="image-gallery-media"
                  src={item.src}
                  alt={item.alt}
                  className={cn(
                    "w-full bg-muted object-cover",
                    variant === "stack" ? "aspect-[21/9]" : "aspect-[4/3]",
                  )}
                />
                {showOverlay ? (
                  <span
                    data-slot="image-gallery-overlay"
                    className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2"
                  >
                    <Badge variant={isSelected ? "secondary" : "outline"}>
                      {isSelected ? "Selected" : `Image ${index + 1}`}
                    </Badge>
                  </span>
                ) : null}
                {showCaption && (item.title || item.caption) ? (
                  <span data-slot="image-gallery-caption" className="grid gap-0.5 px-3 py-2">
                    {item.title ? (
                      <span className="text-sm font-medium text-foreground">{item.title}</span>
                    ) : null}
                    {item.caption ? (
                      <span className="text-xs text-muted-foreground">{item.caption}</span>
                    ) : null}
                  </span>
                ) : null}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { ImageGallery };
