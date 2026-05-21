import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const meta = {
  title: "Components/Disclosure/Accordion",
  component: Accordion,
  tags: ["autodocs", "test"],
  args: {
    type: "single",
    collapsible: true,
    className: "w-[min(520px,calc(100vw-2rem))] rounded-md border px-3",
  },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="overview">
        <AccordionTrigger>Overview</AccordionTrigger>
        <AccordionContent>Shared primitives and composed UI patterns.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="details">
        <AccordionTrigger>Details</AccordionTrigger>
        <AccordionContent>Tokens, themes, and package contracts stay reusable.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Overview" }));
    await expect(canvas.getByText("Shared primitives and composed UI patterns.")).toBeVisible();
  },
};
