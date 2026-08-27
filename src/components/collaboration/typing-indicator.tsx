import * as React from "react";

import { cn } from "../../lib/cn";

type TypingIndicatorProps = React.ComponentProps<"div"> & {
  label?: React.ReactNode;
  inline?: boolean;
};

function TypingIndicator({
  label,
  inline = false,
  className,
  children,
  ...props
}: TypingIndicatorProps) {
  if (label == null && children == null) {
    return null;
  }

  return (
    <div
      data-slot="typing-indicator"
      data-inline={inline ? "true" : undefined}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "min-w-0 items-center gap-2 text-sm text-muted-foreground",
        inline ? "inline-flex" : "flex w-fit rounded-full bg-muted px-3 py-2",
        className,
      )}
      {...props}
    >
      <TypingIndicatorDots />
      <TypingIndicatorLabel>{children ?? label}</TypingIndicatorLabel>
    </div>
  );
}

function TypingIndicatorDots({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="typing-indicator-dots"
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center gap-1", className)}
      {...props}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </span>
  );
}

function TypingIndicatorLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="typing-indicator-label"
      className={cn("min-w-0 truncate", className)}
      {...props}
    />
  );
}

export { TypingIndicator, TypingIndicatorDots, TypingIndicatorLabel };
export type TypingIndicatorDotsProps = React.ComponentProps<typeof TypingIndicatorDots>;
export type TypingIndicatorLabelProps = React.ComponentProps<typeof TypingIndicatorLabel>;
export type { TypingIndicatorProps };
