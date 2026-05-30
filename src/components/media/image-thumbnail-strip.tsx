"use client";

import * as React from "react";

import { Badge } from "../stable/badge";
import { cn } from "../../lib/cn";
import { ScrollArea } from "../stable/scroll-area";
import type { MediaGalleryItem, OnGallerySelect } from "./media-gallery-types";

type ImageThumbnailStripOrientation = "horizontal" | "vertical";
type ImageThumbnailStripSize = "sm" | "md" | "lg";

export type ImageThumbnailStripProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  defaultSelectedId?: string;
  items: MediaGalleryItem[];
  onSelect?: OnGallerySelect;
  orientation?: ImageThumbnailStripOrientation;
  scrollOnSelect?: boolean;
  selectedId?: string;
  showCount?: boolean;
  size?: ImageThumbnailStripSize;
};

const thumbnailSizeClassNames: Record<ImageThumbnailStripSize, string> = {
  sm: "size-14",
  md: "size-16",
  lg: "size-24",
};

function ImageThumbnailStrip({
  "aria-label": ariaLabel = "Image thumbnails",
  className,
  defaultSelectedId,
  items,
  onSelect,
  orientation = "horizontal",
  scrollOnSelect = true,
  selectedId,
  showCount = false,
  size = "md",
  ...props
}: ImageThumbnailStripProps) {
  const firstItemId = items[0]?.id;
  const [internalSelectedId, setInternalSelectedId] = React.useState(
    defaultSelectedId ?? firstItemId,
  );
  const currentSelectedId = selectedId ?? internalSelectedId;
  const [activeId, setActiveId] = React.useState(currentSelectedId ?? firstItemId);
  const itemRefs = React.useRef(new Map<string, HTMLButtonElement>());

  React.useEffect(() => {
    setActiveId((currentActiveId) => currentActiveId ?? currentSelectedId ?? firstItemId);
  }, [currentSelectedId, firstItemId]);

  React.useEffect(() => {
    if (!scrollOnSelect || !currentSelectedId) {
      return;
    }

    itemRefs.current.get(currentSelectedId)?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [currentSelectedId, scrollOnSelect]);

  const commitSelection = (item: MediaGalleryItem, index: number) => {
    setInternalSelectedId(item.id);
    setActiveId(item.id);
    onSelect?.({ id: item.id, index, item });
  };

  const moveFocus = (nextIndex: number) => {
    if (items.length === 0) {
      return;
    }

    const normalizedIndex = ((nextIndex % items.length) + items.length) % items.length;
    const nextItem = items[normalizedIndex];

    setActiveId(nextItem.id);
    itemRefs.current.get(nextItem.id)?.focus();
  };

  const getCurrentIndex = (id: string | undefined) =>
    Math.max(
      0,
      items.findIndex((item) => item.id === id),
    );

  return (
    <div
      data-slot="image-thumbnail-strip"
      data-orientation={orientation}
      className={cn(
        "grid gap-2 rounded-md border border-border/70 bg-card p-2",
        orientation === "vertical" && "max-h-96 w-max",
        className,
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {showCount ? (
        <div data-slot="image-thumbnail-strip-count" className="flex items-center justify-end">
          <Badge variant="outline">{items.length} images</Badge>
        </div>
      ) : null}
      <ScrollArea
        data-slot="image-thumbnail-strip-scroll"
        className={cn(orientation === "horizontal" ? "w-full" : "h-80")}
      >
        <div
          data-slot="image-thumbnail-strip-list"
          role="listbox"
          aria-label={ariaLabel}
          aria-orientation={orientation}
          className={cn(
            "flex gap-2 p-0.5",
            orientation === "horizontal" ? "flex-row overflow-x-auto" : "flex-col overflow-y-auto",
          )}
        >
          {items.map((item, index) => {
            const isSelected = item.id === currentSelectedId;
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                ref={(node) => {
                  if (node) {
                    itemRefs.current.set(item.id, node);
                  } else {
                    itemRefs.current.delete(item.id);
                  }
                }}
                data-slot="image-thumbnail-strip-item"
                data-active={isActive ? true : undefined}
                data-selected={isSelected ? true : undefined}
                type="button"
                role="option"
                aria-label={item.title ?? item.alt}
                aria-selected={isSelected}
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-md border border-border/70 bg-background outline-none transition-[border-color,box-shadow,transform] focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  thumbnailSizeClassNames[size],
                  isSelected && "border-ring shadow-[0_0_0_1px_var(--ring)]",
                )}
                tabIndex={isActive ? 0 : -1}
                onClick={() => commitSelection(item, index)}
                onFocus={() => setActiveId(item.id)}
                onKeyDown={(event) => {
                  const currentIndex = getCurrentIndex(activeId);
                  const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
                  const previousKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

                  if (event.key === nextKey) {
                    event.preventDefault();
                    moveFocus(currentIndex + 1);
                  } else if (event.key === previousKey) {
                    event.preventDefault();
                    moveFocus(currentIndex - 1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    moveFocus(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    moveFocus(items.length - 1);
                  } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    commitSelection(item, index);
                  }
                }}
              >
                <img
                  data-slot="image-thumbnail-strip-media"
                  src={item.thumbnailSrc ?? item.src}
                  alt=""
                  aria-hidden="true"
                  className="size-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export { ImageThumbnailStrip };
