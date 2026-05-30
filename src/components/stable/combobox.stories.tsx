import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "./combobox";

const meta = {
  title: "Components/Forms & Inputs/Combobox",
  component: Combobox,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput
        aria-label="Search packages"
        placeholder="Search packages"
        showTrigger={false}
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxLabel>Packages</ComboboxLabel>
            <ComboboxItem value="ui">@moritzbrantner/ui</ComboboxItem>
            <ComboboxItem value="social">@moritzbrantner/ui/social</ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
        <ComboboxEmpty>No package found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText("Search packages");

    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveFocus();
    await expect(await screen.findByRole("listbox")).toBeInTheDocument();
    await expect(screen.getByRole("option", { name: "@moritzbrantner/ui" })).toBeTruthy();
  },
};
