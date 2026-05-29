import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

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
  parameters: {
    a11y: {
      test: "todo",
    },
  },
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Search packages" showTrigger={false} />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxLabel>Packages</ComboboxLabel>
            <ComboboxItem value="ui">@moritzbrantner/ui</ComboboxItem>
            <ComboboxItem value="social">@moritzbrantner/ui/social</ComboboxItem>
          </ComboboxGroup>
          <ComboboxEmpty>No package found.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText("Search packages");

    await userEvent.type(input, "ui");
    await expect(input).toHaveValue("ui");
    await userEvent.keyboard("{Escape}");
  },
};
