"use client";

import * as React from "react";
import { Direction } from "radix-ui";

function DirectionProvider({
  dir,
  direction,
  children,
  ...props
}: React.ComponentProps<typeof Direction.DirectionProvider> & {
  direction?: React.ComponentProps<typeof Direction.DirectionProvider>["dir"];
}) {
  return (
    <Direction.DirectionProvider data-slot="direction-provider" dir={direction ?? dir} {...props}>
      {children}
    </Direction.DirectionProvider>
  );
}

const useDirection = Direction.useDirection;

export { DirectionProvider, useDirection };

export type DirectionProviderProps = React.ComponentProps<typeof DirectionProvider>;
