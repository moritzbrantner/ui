"use client";

import * as React from "react";
import { TriangleAlertIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { useControllableOpen } from "../internal/menu-action-rendering";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../stable/alert-dialog";
import { Button, type ButtonProps } from "../stable/button";
import { Spinner } from "../stable/spinner";

type ConfirmActionProps = Omit<React.ComponentProps<typeof AlertDialog>, "children"> & {
  trigger: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  confirmVariant?: ButtonProps["variant"];
  pending?: boolean;
  closeOnConfirm?: boolean;
  icon?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  contentProps?: Omit<React.ComponentProps<typeof AlertDialogContent>, "children">;
};

function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "destructive",
  pending,
  closeOnConfirm = true,
  icon,
  onConfirm,
  contentProps,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: ConfirmActionProps) {
  const [resolvedOpen, setOpen] = useControllableOpen({ open, defaultOpen, onOpenChange });
  const [internalPending, setInternalPending] = React.useState(false);
  const resolvedPending = pending ?? internalPending;
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};

  async function handleConfirm() {
    const result = onConfirm?.();

    if (isPromiseLike(result)) {
      setInternalPending(true);
      try {
        await result;
      } finally {
        setInternalPending(false);
      }
    }

    if (closeOnConfirm) {
      setOpen(false);
    }
  }

  return (
    <AlertDialog {...props} open={resolvedOpen} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild data-slot="confirm-action-trigger">
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent
        {...restContentProps}
        data-slot="confirm-action"
        className={cn(contentClassName)}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            {icon ?? <TriangleAlertIcon aria-hidden="true" />}
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={resolvedPending}>{cancelLabel}</AlertDialogCancel>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={resolvedPending}
            onClick={handleConfirm}
            data-slot="confirm-action-confirm"
          >
            {resolvedPending ? <Spinner decorative size="xs" /> : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return Boolean(value && typeof (value as Promise<unknown>).then === "function");
}

export { ConfirmAction };
export type { ConfirmActionProps };
