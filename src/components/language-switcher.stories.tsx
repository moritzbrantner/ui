import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, waitFor } from "storybook/test";

import { LanguageSwitcher } from "./language-switcher";

const meta = {
  title: "Components/Forms & Inputs/Language Switcher",
  component: LanguageSwitcher,
  tags: ["autodocs", "test"],
  args: {
    defaultValue: "en",
  },
  argTypes: {
    languages: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SelectedGerman: Story = {
  args: {
    defaultValue: "de",
  },
};

export const ControlledSelection: Story = {
  args: {
    onValueChange: fn(),
  },
  render: (args) => {
    const [language, setLanguage] = useState(args.defaultValue ?? "en");

    return (
      <div className="grid gap-3">
        <LanguageSwitcher
          {...args}
          value={language}
          onValueChange={(nextLanguage, option) => {
            setLanguage(nextLanguage);
            args.onValueChange?.(nextLanguage, option);
          }}
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Selected language: {language.toUpperCase()}
        </p>
      </div>
    );
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Language: English" }));
    await userEvent.click(await screen.findByRole("menuitemradio", { name: /Francais/ }));

    await expect(args.onValueChange).toHaveBeenCalledWith(
      "fr",
      expect.objectContaining({ label: "Francais" }),
    );
    await expect(canvas.getByText("Selected language: FR")).toBeVisible();
    await waitFor(() => {
      expect(canvasElement.querySelector("[data-slot='language-switcher']")).not.toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  },
};
