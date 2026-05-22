"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../stable/hover-card";

type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export type HoverPreviewProps = Omit<React.ComponentProps<typeof HoverCard>, "children"> & {
  trigger: React.ReactElement;
  title?: React.ReactNode;
  description?: React.ReactNode;
  media?: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  align?: React.ComponentProps<typeof HoverCardContent>["align"];
  side?: React.ComponentProps<typeof HoverCardContent>["side"];
  sideOffset?: number;
  contentProps?: React.ComponentProps<typeof HoverCardContent> & DataAttributes;
};

function HoverPreview({
  trigger,
  title,
  description,
  media,
  meta,
  children,
  align = "center",
  side,
  sideOffset = 8,
  contentProps,
  ...props
}: HoverPreviewProps) {
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};

  return (
    <HoverCard {...props} data-slot="hover-preview">
      <HoverCardTrigger asChild data-slot="hover-preview-trigger">
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent
        {...restContentProps}
        data-slot="hover-preview-content"
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn("grid w-72 gap-3 p-3", contentClassName)}
      >
        {media ? <div data-slot="hover-preview-media">{media}</div> : null}
        <div className="grid gap-1">
          {title ? (
            <div
              data-slot="hover-preview-title"
              className="font-heading text-sm font-medium text-foreground"
            >
              {title}
            </div>
          ) : null}
          {description ? (
            <div
              data-slot="hover-preview-description"
              className="text-sm leading-normal text-muted-foreground"
            >
              {description}
            </div>
          ) : null}
        </div>
        {children}
        {meta ? (
          <div data-slot="hover-preview-meta" className="text-xs text-muted-foreground">
            {meta}
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}

export { HoverPreview };
