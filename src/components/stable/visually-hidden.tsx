import * as React from "react";

import { cn } from "../../lib/cn";

function VisuallyHidden({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="visually-hidden" className={cn("sr-only", className)} {...props} />;
}

export { VisuallyHidden };

export type VisuallyHiddenProps = React.ComponentProps<typeof VisuallyHidden>;
