"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

export type AnimatedImageProps = Omit<React.ComponentProps<"div">, "children"> & {
  alt: string;
  animatedSrc?: string;
  focusOn?: boolean;
  hoverOn?: boolean;
  hoverSrc?: string;
  loop?: boolean;
  onPlaybackChange?: (playing: boolean) => void;
  playDelayMs?: number;
  preload?: boolean;
  src?: string;
  staticSrc?: string;
};

function AnimatedImage({
  alt,
  animatedSrc,
  className,
  focusOn = true,
  hoverOn = true,
  hoverSrc,
  loop = true,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  onPlaybackChange,
  playDelayMs = 0,
  preload = true,
  src,
  staticSrc,
  tabIndex,
  ...props
}: AnimatedImageProps) {
  const stillSrc = staticSrc ?? src ?? "";
  const motionSrc = animatedSrc ?? hoverSrc ?? stillSrc;
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [delayedIntent, setDelayedIntent] = React.useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const wantsPlayback = (hoverOn && hovered) || (focusOn && focused);
  const canPlay = !prefersReducedMotion && motionSrc !== stillSrc;
  const playing = canPlay && delayedIntent;

  React.useEffect(() => {
    if (!preload || motionSrc === stillSrc || typeof Image === "undefined") {
      return;
    }

    const image = new Image();
    image.src = motionSrc;
  }, [motionSrc, preload, stillSrc]);

  React.useEffect(() => {
    if (!wantsPlayback || !canPlay) {
      setDelayedIntent(false);
      return;
    }

    if (playDelayMs <= 0) {
      setDelayedIntent(true);
      return;
    }

    const delay = window.setTimeout(() => setDelayedIntent(true), playDelayMs);

    return () => window.clearTimeout(delay);
  }, [canPlay, playDelayMs, wantsPlayback]);

  React.useEffect(() => {
    onPlaybackChange?.(playing);
  }, [onPlaybackChange, playing]);

  return (
    <div
      data-slot="animated-image"
      data-playing={playing ? true : undefined}
      data-reduced-motion={prefersReducedMotion ? true : undefined}
      data-loop={loop ? true : undefined}
      className={cn("group relative inline-block overflow-hidden rounded-md", className)}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onMouseEnter={(event) => {
        setHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHovered(false);
        onMouseLeave?.(event);
      }}
      tabIndex={tabIndex ?? (focusOn ? 0 : undefined)}
      {...props}
    >
      <img
        data-slot="animated-image-media"
        data-playing={playing ? true : undefined}
        src={playing ? motionSrc : stillSrc}
        alt={alt}
        className="size-full object-cover transition-opacity"
      />
    </div>
  );
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener?.("change", updatePreference);

    return () => query.removeEventListener?.("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

export { AnimatedImage };
