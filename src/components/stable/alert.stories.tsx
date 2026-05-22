import type { Meta, StoryObj } from "@storybook/react-vite";
import { InfoIcon } from "lucide-react";
import { expect } from "storybook/test";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";

const meta = {
  title: "Components/Feedback/Alert",
  component: Alert,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Alert className="w-[min(520px,calc(100vw-2rem))]">
      <InfoIcon />
      <AlertTitle>Package checks complete</AlertTitle>
      <AlertDescription>
        Release confidence checks can be reviewed before publishing.
      </AlertDescription>
      <AlertAction>
        <Button type="button" variant="outline" size="sm">
          Review
        </Button>
      </AlertAction>
    </Alert>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Review" })).toBeVisible();
  },
};
