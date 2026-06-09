import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AtlasTheme, BobbaTheme, PaperTheme, StudioTheme } from "../../themes";
import { ThemeModeSwitch } from "./theme-mode-switch";

const meta = {
  title: "Components/Forms & Inputs/Theme Mode Switch",
  component: ThemeModeSwitch,
  tags: ["autodocs", "test"],
  args: {
    defaultMode: "light",
  },
  argTypes: {
    mode: {
      control: "radio",
      options: ["light", "dark"],
    },
    defaultMode: {
      control: "radio",
      options: ["light", "dark"],
    },
  },
} satisfies Meta<typeof ThemeModeSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const switchControl = canvas.getByRole("switch", { name: "Color mode" });

    await userEvent.click(switchControl);
    await expect(switchControl).toHaveAttribute("aria-checked", "true");
  },
};

export const Modes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <ThemeModeSwitch defaultMode="light" aria-label="Light appearance" />
      <ThemeModeSwitch defaultMode="dark" aria-label="Dark appearance" />
    </div>
  ),
};

export const SimpleThemes: Story = {
  render: () => {
    const themes = [
      ["Bobba", BobbaTheme],
      ["Atlas", AtlasTheme],
      ["Studio", StudioTheme],
      ["Paper", PaperTheme],
    ] as const;

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {themes.map(([label, Theme]) => (
          <Theme
            key={label}
            className="grid gap-3 rounded-[var(--ui-card-radius)] border bg-card p-4 text-card-foreground"
          >
            <div className="text-sm font-medium">{label}</div>
            <div className="flex items-center gap-3">
              <ThemeModeSwitch defaultMode="light" aria-label={`${label} light appearance`} />
              <ThemeModeSwitch defaultMode="dark" aria-label={`${label} dark appearance`} />
            </div>
          </Theme>
        ))}
      </div>
    );
  },
};
