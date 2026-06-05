import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor } from "storybook/test";

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

const meta = {
  title: "Components/Overlay/Tooltip",
  component: Tooltip,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="outline">
            Hover target
          </Button>
        </TooltipTrigger>
        <TooltipContent>Helpful context</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole("button", { name: "Hover target" }));
    await waitFor(() => {
      expect(screen.getAllByText("Helpful context").length).toBeGreaterThan(0);
    });
  },
};
