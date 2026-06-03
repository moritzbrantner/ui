import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta = {
  title: "Components/Overlay/Sheet",
  component: Sheet,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button type="button" variant="outline">
          Open sheet
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Panel details</SheetTitle>
          <SheetDescription>Use sheets for focused supplemental controls.</SheetDescription>
        </SheetHeader>
        <div className="px-4 text-sm text-muted-foreground">
          Reusable content stays app-neutral.
        </div>
        <SheetFooter>
          <Button type="button">Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async () => {
    await expect(await screen.findByText("Panel details")).toBeVisible();
  },
};
