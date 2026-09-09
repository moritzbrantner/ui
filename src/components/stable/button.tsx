"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { buttonVariants } from "../../lib/button-variants";
import { cn } from "../../lib/cn";

type SharedProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  asChild?: boolean;
  dragX?: boolean;
  // Backward-compatible alias for horizontal drag support.
  onDrag?: React.ComponentProps<"button">["onDrag"] | boolean;
};

export type ButtonProps = SharedProps & Omit<React.ComponentProps<"button">, "onDrag">;

function Button(props: ButtonProps) {
  const {
    className,
    variant = "default",
    size = "default",
    asChild = false,
    dragX,
    onDrag,
    onBlur,
    onKeyDown,
    onKeyUp,
    onPointerCancel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    disabled,
    style,
    ...rest
  } = props;

  const [keyboardActive, setKeyboardActive] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const dragStateRef = React.useRef<{ pointerId: number; startX: number } | null>(null);
  const buttonClassName = cn(buttonVariants({ variant, size, className }));
  const legacyDragX = typeof onDrag === "boolean" ? onDrag : undefined;
  const enableDrag = Boolean(dragX ?? legacyDragX);
  const resetDrag = React.useCallback((event?: React.PointerEvent<HTMLButtonElement>) => {
    if (event && dragStateRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
    setDragOffset(0);
  }, []);
  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    setKeyboardActive(false);
    dragStateRef.current = null;
    setDragOffset(0);
    onBlur?.(event);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && !disabled && event.key === "Enter") {
      setKeyboardActive(true);
    }
  };
  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter") {
      setKeyboardActive(false);
    }
    onKeyUp?.(event);
  };
  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event);

    if (
      event.defaultPrevented ||
      disabled ||
      !enableDrag ||
      event.button !== 0 ||
      (event.pointerType === "mouse" && event.buttons !== 1)
    ) {
      return;
    }

    dragStateRef.current = { pointerId: event.pointerId, startX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerMove?.(event);

    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setDragOffset(event.clientX - dragState.startX);
  };
  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerUp?.(event);
    resetDrag(event);
  };
  const handlePointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerCancel?.(event);
    resetDrag(event);
  };
  const dragStyle =
    dragOffset === 0
      ? style
      : {
          ...style,
          translate: `${dragOffset}px`,
        };
  const nativeDragHandler = typeof onDrag === "function" ? onDrag : undefined;

  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        data-variant={variant}
        data-size={size}
        data-keyboard-active={keyboardActive ? true : undefined}
        className={buttonClassName}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={dragStyle}
        {...(rest as Record<string, unknown>)}
      />
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-dragging={dragOffset !== 0 ? true : undefined}
      data-keyboard-active={keyboardActive ? true : undefined}
      className={buttonClassName}
      disabled={disabled}
      onDrag={nativeDragHandler}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={dragStyle}
      {...(rest as Record<string, unknown>)}
    />
  );
}

export { Button, buttonVariants };
