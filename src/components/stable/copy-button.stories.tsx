import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";

import { CopyButton } from "./copy-button";

type CopyErrorDemoProps = {
  onCopyError?: (error: unknown) => void;
};

function CopyErrorDemo({ onCopyError = () => undefined }: CopyErrorDemoProps) {
  const [status, setStatus] = useState("Ready to copy");

  return (
    <div className="grid w-full max-w-[360px] min-w-0 gap-3 rounded-md border border-border/60 bg-card/70 p-4">
      <CopyButton
        value="restricted-token"
        idleLabel="Copy restricted token"
        copiedLabel="Copied token"
        copy={async () => {
          throw new Error("Clipboard permission denied.");
        }}
        onCopyError={(error) => {
          setStatus("Copy failed");
          onCopyError(error);
        }}
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

const meta = {
  title: "Components/Actions/Copy Button",
  component: CopyButton,
  tags: ["autodocs", "test"],
  args: {
    value: "bun add @moritzbrantner/ui",
    copy: fn(async () => undefined),
    onCopied: fn(),
  },
} satisfies Meta<typeof CopyButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));

    await expect(canvas.getByRole("button", { name: "Copied" })).toBeVisible();
    await expect(args.copy).toHaveBeenCalledWith("bun add @moritzbrantner/ui");
    await expect(args.onCopied).toHaveBeenCalledWith("bun add @moritzbrantner/ui");
  },
};

export const Compact: Story = {
  args: {
    size: "xs",
    idleLabel: "Copy token",
    copiedLabel: "Token copied",
    value: "pk_live_example",
  },
};

export const ErrorState: StoryObj<typeof CopyErrorDemo> = {
  render: (args) => <CopyErrorDemo {...args} />,
  args: {
    onCopyError: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy restricted token" }));

    await expect(canvas.getByText("Copy failed")).toBeVisible();
    await expect(args.onCopyError).toHaveBeenCalledTimes(1);
  },
};
