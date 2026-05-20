import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { DownloadIcon, MoreHorizontalIcon, RotateCcwIcon, SaveIcon } from "lucide-react";

import { Button } from "./button";
import { Toggle } from "./toggle";
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarSpacer, ToolbarTitle } from "./toolbar";

type ToolbarDemoProps = {
  onSave?: () => void;
  density?: "default" | "compact";
};

type ToolbarInteractionDemoProps = {
  onExport?: () => void;
  onReset?: () => void;
  onSave?: () => void;
};

function ToolbarDemo({ onSave = () => undefined, density = "default" }: ToolbarDemoProps) {
  return (
    <Toolbar
      aria-label="Editor actions"
      density={density}
      className="w-[640px] max-w-[calc(100vw-2rem)]"
    >
      <ToolbarGroup>
        <ToolbarTitle>Release notes</ToolbarTitle>
      </ToolbarGroup>
      <ToolbarSpacer />
      <ToolbarGroup aria-label="History">
        <Button variant="ghost" size="icon-sm" aria-label="Reset changes">
          <RotateCcwIcon />
        </Button>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="View">
        <Toggle size="sm" aria-label="Preview mode">
          Preview
        </Toggle>
      </ToolbarGroup>
      <ToolbarGroup aria-label="Actions">
        <Button variant="outline" size="sm">
          <DownloadIcon />
          Export
        </Button>
        <Button size="sm" onClick={onSave}>
          <SaveIcon />
          Save
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="More actions">
          <MoreHorizontalIcon />
        </Button>
      </ToolbarGroup>
    </Toolbar>
  );
}

function ToolbarInteractionDemo({
  onExport = () => undefined,
  onReset = () => undefined,
  onSave = () => undefined,
}: ToolbarInteractionDemoProps) {
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(true);
  const status = dirty ? "Unsaved changes" : preview ? "Previewing saved draft" : "Saved draft";

  function reset() {
    setPreview(false);
    setDirty(false);
    onReset();
  }

  function save() {
    setDirty(false);
    onSave();
  }

  return (
    <Toolbar aria-label="Interactive editor actions" className="w-[720px] max-w-[calc(100vw-2rem)]">
      <ToolbarGroup>
        <ToolbarTitle>{status}</ToolbarTitle>
      </ToolbarGroup>
      <ToolbarSpacer />
      <ToolbarGroup aria-label="History">
        <Button variant="ghost" size="icon-sm" aria-label="Reset changes" onClick={reset}>
          <RotateCcwIcon />
        </Button>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="View">
        <Toggle size="sm" aria-label="Preview mode" pressed={preview} onPressedChange={setPreview}>
          {preview ? "Preview on" : "Preview"}
        </Toggle>
      </ToolbarGroup>
      <ToolbarGroup aria-label="Actions">
        <Button variant="outline" size="sm" onClick={onExport}>
          <DownloadIcon />
          Export
        </Button>
        <Button size="sm" disabled={!dirty} onClick={save}>
          <SaveIcon />
          Save
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="More actions">
          <MoreHorizontalIcon />
        </Button>
      </ToolbarGroup>
    </Toolbar>
  );
}

const meta = {
  title: "Components/Actions/Toolbar",
  component: ToolbarDemo,
  tags: ["autodocs", "test"],
  args: {
    density: "default",
    onSave: fn(),
  },
  argTypes: {
    density: {
      control: "radio",
      options: ["default", "compact"],
    },
  },
} satisfies Meta<typeof ToolbarDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));

    await expect(args.onSave).toHaveBeenCalledTimes(1);
  },
};

export const Compact: Story = {
  args: {
    density: "compact",
  },
};

export const EditingStates: StoryObj<typeof ToolbarInteractionDemo> = {
  render: (args) => <ToolbarInteractionDemo {...args} />,
  args: {
    onExport: fn(),
    onReset: fn(),
    onSave: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const preview = canvas.getByRole("button", { name: "Preview mode" });

    await expect(canvas.getByText("Unsaved changes")).toBeVisible();
    await userEvent.click(preview);
    await expect(preview).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(args.onSave).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: "Save" })).toBeDisabled();
    await expect(canvas.getByText("Previewing saved draft")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Export" }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole("button", { name: "Reset changes" }));
    await expect(args.onReset).toHaveBeenCalledTimes(1);
    await expect(preview).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByText("Saved draft")).toBeVisible();
  },
};
