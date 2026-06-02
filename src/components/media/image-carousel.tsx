"use client";

import * as React from "react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../stable/carousel";
import { cn } from "../../lib/cn";
import { Button } from "../stable/button";
import type { MediaGalleryItem } from "./media-gallery-types";

export type ImageCarouselProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  autoPlay?: boolean;
  autoPlayIntervalMs?: number;
  items: MediaGalleryItem[];
  layout?: "cover" | "contain";
  onSlideActivate?: (index: number, item: MediaGalleryItem) => void;
  onSlideChange?: (index: number, item: MediaGalleryItem) => void;
  showCaptions?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
};

function ImageCarousel({
  autoPlay = false,
  autoPlayIntervalMs = 5000,
  className,
  items,
  layout = "cover",
  onSlideActivate,
  onSlideChange,
  showCaptions = true,
  showControls = true,
  showIndicators = true,
  ...props
}: ImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const selectedItem = items[selectedIndex];

  const commitSlide = React.useCallback(
    (nextIndex: number) => {
      if (items.length === 0) {
        return;
      }

      const normalizedIndex = ((nextIndex % items.length) + items.length) % items.length;
      api?.scrollTo(normalizedIndex);
      setSelectedIndex(normalizedIndex);
    },
    [api, items.length],
  );

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => setSelectedIndex(api.selectedScrollSnap());

    handleSelect();
    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!selectedItem) {
      return;
    }

    onSlideChange?.(selectedIndex, selectedItem);
  }, [onSlideChange, selectedIndex, selectedItem]);

  React.useEffect(() => {
    if (!autoPlay || items.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      commitSlide(selectedIndex + 1);
    }, autoPlayIntervalMs);

    return () => window.clearInterval(interval);
  }, [autoPlay, autoPlayIntervalMs, commitSlide, items.length, selectedIndex]);

  return (
    <div
      data-slot="image-carousel"
      className={cn(
        "grid max-w-full min-w-0 gap-3 overflow-hidden rounded-lg border border-border/70 bg-card p-3",
        className,
      )}
      {...props}
    >
      {items.length === 0 ? (
        <div
          data-slot="image-carousel-empty"
          role="status"
          className="grid aspect-video place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground"
        >
          No media items
        </div>
      ) : (
        <>
          <Carousel
            data-slot="image-carousel-viewport"
            opts={{ align: "start", loop: items.length > 1 }}
            setApi={setApi}
            className="min-w-0 px-10"
          >
            <CarouselContent className="ml-0">
              {items.map((item, index) => {
                const isActive = index === selectedIndex;

                return (
                  <CarouselItem key={item.id} className="pl-0">
                    <button
                      data-slot="image-carousel-slide"
                      data-active={isActive ? true : undefined}
                      type="button"
                      aria-hidden={isActive ? undefined : true}
                      tabIndex={isActive ? 0 : -1}
                      className="grid w-full overflow-hidden rounded-md border border-border/70 bg-background text-left outline-none transition-[border-color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      onClick={() => onSlideActivate?.(index, item)}
                    >
                      <img
                        data-slot="image-carousel-media"
                        src={item.src}
                        alt={item.alt}
                        className={cn(
                          "aspect-video size-full bg-muted",
                          layout === "cover" ? "object-cover" : "object-contain",
                        )}
                      />
                      {showCaptions && (item.title || item.caption) ? (
                        <span
                          data-slot="image-carousel-caption"
                          className="grid gap-0.5 px-3 py-2 text-sm"
                        >
                          {item.title ? (
                            <span className="font-medium text-foreground">{item.title}</span>
                          ) : null}
                          {item.caption ? (
                            <span className="text-muted-foreground">{item.caption}</span>
                          ) : null}
                        </span>
                      ) : null}
                    </button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {showControls && items.length > 1 ? (
              <>
                <CarouselPrevious
                  aria-label="Previous image"
                  disabled={false}
                  className="left-0"
                  onClick={() => commitSlide(selectedIndex - 1)}
                />
                <CarouselNext
                  aria-label="Next image"
                  disabled={false}
                  className="right-0"
                  onClick={() => commitSlide(selectedIndex + 1)}
                />
              </>
            ) : null}
          </Carousel>

          {showIndicators && items.length > 1 ? (
            <div
              data-slot="image-carousel-indicators"
              className="flex items-center justify-center gap-1.5"
            >
              {items.map((item, index) => (
                <Button
                  key={item.id}
                  data-slot="image-carousel-indicator"
                  data-active={index === selectedIndex ? true : undefined}
                  type="button"
                  variant={index === selectedIndex ? "secondary" : "ghost"}
                  size="icon-xs"
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === selectedIndex ? "true" : undefined}
                  onClick={() => commitSlide(index)}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                </Button>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export { ImageCarousel };
