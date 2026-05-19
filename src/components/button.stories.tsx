import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { ArrowRightIcon, CheckIcon, Loader2Icon, RotateCcwIcon, SaveIcon } from "lucide-react";

import { Button } from "./button";

const buttonVariants = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const;

const buttonSizes = ["xs", "sm", "default", "lg", "icon", "icon-sm"] as const;

type ButtonInteractionDemoProps = {
  onSave?: () => void;
};

function ButtonInteractionDemo({ onSave = () => undefined }: ButtonInteractionDemoProps) {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const label =
    saveState === "saving" ? "Saving changes" : saveState === "saved" ? "Saved" : "Save changes";
  const Icon = saveState === "saving" ? Loader2Icon : saveState === "saved" ? CheckIcon : SaveIcon;

  function save() {
    setSaveState("saving");
    onSave();
  }

  return (
    <div className="flex w-[440px] max-w-[calc(100vw-2rem)] flex-wrap items-center gap-3 rounded-md border border-border/60 bg-card/70 p-4">
      <Button disabled={saveState === "saving"} aria-live="polite" onClick={save}>
        <Icon className={saveState === "saving" ? "animate-spin" : undefined} />
        {label}
      </Button>
      <Button
        variant="outline"
        disabled={saveState !== "saving"}
        onClick={() => setSaveState("saved")}
      >
        <CheckIcon />
        Complete save
      </Button>
      <Button variant="ghost" onClick={() => setSaveState("idle")}>
        <RotateCcwIcon />
        Reset
      </Button>
    </div>
  );
}

const meta = {
  title: "Components/Actions/Button",
  component: Button,
  tags: ["autodocs", "test"],
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: buttonVariants,
    },
    size: {
      control: "select",
      options: buttonSizes,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {buttonVariants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Confirm">
        <CheckIcon />
      </Button>
      <Button size="icon-sm" aria-label="Continue">
        <ArrowRightIcon />
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <SaveIcon />
        Save changes
      </Button>
      <Button disabled>Disabled</Button>
      <Button variant="outline" dragX>
        Drag on x
      </Button>
    </div>
  ),
};

export const Clickable: Story = {
  args: {
    children: "Save changes",
    onClick: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));

    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const InteractionStates: StoryObj<typeof ButtonInteractionDemo> = {
  render: (args) => <ButtonInteractionDemo {...args} />,
  args: {
    onSave: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(args.onSave).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: "Saving changes" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Complete save" })).toBeEnabled();

    await userEvent.click(canvas.getByRole("button", { name: "Complete save" }));
    await expect(canvas.getByRole("button", { name: "Saved" })).toBeEnabled();

    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(canvas.getByRole("button", { name: "Save changes" })).toBeEnabled();
  },
};
