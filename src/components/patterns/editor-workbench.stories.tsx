import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { EditorReference } from "../../../examples/editor-reference/EditorReference";
import { EditorWorkbench } from "./editor-workbench";

const meta = {
  title: "Components/Editors/Editor Workbench",
  component: EditorWorkbench,
  tags: ["autodocs", "test"],
  parameters: { layout: "fullscreen" },
  args: { children: null },
} satisfies Meta<typeof EditorWorkbench>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {
  render: () => <EditorReference />,
  play: async ({ canvas, userEvent }) => {
    const x = canvas.getByRole("spinbutton", { name: "Position X" });
    await userEvent.click(x);
    await userEvent.clear(x);
    await userEvent.type(x, "3.456789");
    await userEvent.tab();
    await expect(x).toHaveValue("3.457");
    await expect(canvas.getByLabelText("Preview transform")).toHaveTextContent("3.456789");
    const time = canvas.getByRole("spinbutton", { name: "Preview time" });
    await userEvent.click(time);
    await userEvent.clear(time);
    await userEvent.type(time, "2.345678");
    await userEvent.tab();
    await expect(time).toHaveValue("2.346");
    await expect(canvas.getByRole("slider", { name: "Preview time scrubber" })).toHaveValue(
      "2.345678",
    );
    await userEvent.click(canvas.getByRole("treeitem", { name: "Square" }));
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByRole("heading", { name: "Circle properties" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Select Square in preview" }));
    await expect(canvas.getByLabelText("Preview transform")).toHaveTextContent("3.456789");
    await userEvent.click(canvas.getByRole("button", { name: "Commands (Mod+K)" }));
    await userEvent.type(await screen.findByRole("combobox"), "Reset transform");
    await expect(await screen.findByRole("option", { name: /Reset transform/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Preview transform")).toHaveTextContent("1.234567");
    await userEvent.click(await canvas.findByRole("button", { name: "Clear selection" }));
    await expect(canvas.getByText("No object selected")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Select Square" }));
    await userEvent.click(canvas.getByRole("button", { name: "Restore panel layout" }));
  },
};
