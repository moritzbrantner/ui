"use client";

import * as React from "react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";

function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

export type CollapsibleProps = React.ComponentProps<typeof Collapsible>;
export type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsibleTrigger>;
export type CollapsibleContentProps = React.ComponentProps<typeof CollapsibleContent>;
