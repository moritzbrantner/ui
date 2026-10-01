import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { expect, screen, waitFor } from "storybook/test";

import { Button } from "./button";
import { Toaster } from "./sonner";

function ToastDemo() {
  return (
    <div className="grid gap-3">
      <Button
        onClick={() =>
          toast.success("Saved changes", { id: "toaster-story-feedback", duration: Infinity })
        }
      >
        Show toast
      </Button>
      <Toaster theme="light" />
    </div>
  );
}

const meta = {
  title: "Components/Feedback/Toaster",
  component: ToastDemo,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ToastDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Usage: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    await expect(await screen.findByText("Saved changes")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("listitem")).toHaveStyle({ opacity: "1" }));
  },
};
