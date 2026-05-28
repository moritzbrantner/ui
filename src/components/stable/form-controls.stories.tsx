import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Switch } from "./switch";
import { Textarea } from "./textarea";

type FormControlsDemoProps = {
  disabled?: boolean;
};

function FormControlsDemo({ disabled = false }: FormControlsDemoProps) {
  return (
    <form className="grid w-full max-w-[360px] min-w-0 gap-5">
      <div className="grid gap-2">
        <Label htmlFor="project-name">Project name</Label>
        <Input
          id="project-name"
          disabled={disabled}
          placeholder="Research workspace"
          defaultValue="Platform package audit"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          disabled={disabled}
          placeholder="Add review notes"
          defaultValue="Check interactive states before release."
        />
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="notify-team" disabled={disabled} />
        <Label htmlFor="notify-team">Notify team</Label>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-md border border-border/70 p-3">
        <Label htmlFor="auto-refresh">Auto refresh</Label>
        <Switch id="auto-refresh" disabled={disabled} />
      </div>
      <RadioGroup
        aria-label="Release channel"
        className="grid gap-2"
        defaultValue="preview"
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem id="channel-preview" value="preview" />
          <Label htmlFor="channel-preview">Preview</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="channel-stable" value="stable" />
          <Label htmlFor="channel-stable">Stable</Label>
        </div>
      </RadioGroup>
      <Button type="submit" disabled={disabled}>
        Save settings
      </Button>
    </form>
  );
}

const meta = {
  title: "Components/Forms & Inputs/Form Controls",
  component: FormControlsDemo,
  tags: ["autodocs", "test"],
  args: {
    disabled: false,
  },
} satisfies Meta<typeof FormControlsDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const view = canvasElement.ownerDocument.defaultView ?? window;
    const getControlColors = (element: Element) => {
      const styles = view.getComputedStyle(element);

      return `${styles.backgroundColor}|${styles.borderColor}|${styles.color}`;
    };
    const getSwitchThumbOffset = (element: Element) => {
      const styles = view.getComputedStyle(element);

      return styles.getPropertyValue("translate") || styles.transform;
    };

    const nameInput = canvas.getByLabelText("Project name");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Research hub");
    await expect(nameInput).toHaveValue("Research hub");

    const notifyCheckbox = canvas.getByRole("checkbox", { name: "Notify team" });
    const initialCheckboxColors = getControlColors(notifyCheckbox);
    await userEvent.click(notifyCheckbox);
    await expect(notifyCheckbox).toHaveAttribute("aria-checked", "true");
    await expect(notifyCheckbox).toHaveAttribute("data-state", "checked");
    await waitFor(() => {
      expect(getControlColors(notifyCheckbox)).not.toBe(initialCheckboxColors);
    });

    const refreshSwitch = canvas.getByRole("switch", { name: "Auto refresh" });
    const switchThumb = refreshSwitch.querySelector('[data-slot="switch-thumb"]');
    const initialSwitchColors = getControlColors(refreshSwitch);
    const initialSwitchThumbOffset = switchThumb ? getSwitchThumbOffset(switchThumb) : "";
    await userEvent.click(refreshSwitch);
    await expect(refreshSwitch).toHaveAttribute("aria-checked", "true");
    await expect(refreshSwitch).toHaveAttribute("data-state", "checked");
    await waitFor(() => {
      expect(getControlColors(refreshSwitch)).not.toBe(initialSwitchColors);
      expect(switchThumb).toBeTruthy();
      expect(getSwitchThumbOffset(switchThumb as Element)).not.toBe(initialSwitchThumbOffset);
    });

    const stableRadio = canvas.getByRole("radio", { name: "Stable" });
    const initialRadioColors = getControlColors(stableRadio);
    await userEvent.click(stableRadio);
    await expect(stableRadio).toHaveAttribute("aria-checked", "true");
    await expect(stableRadio).toHaveAttribute("data-state", "checked");
    await waitFor(() => {
      expect(getControlColors(stableRadio)).not.toBe(initialRadioColors);
    });

    expect(canvasElement.querySelector('[data-slot="checkbox-indicator"]')).toBeTruthy();
    expect(canvasElement.querySelector('[data-slot="radio-group-indicator"]')).toBeTruthy();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
