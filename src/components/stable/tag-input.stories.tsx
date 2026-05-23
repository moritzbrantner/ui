import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { Field, FieldDescription, FieldLabel } from "./field";
import { TagInput } from "./tag-input";

function TagInputDemo({
  disabled = false,
  maxTags,
  onValueChange,
}: {
  disabled?: boolean;
  maxTags?: number;
  onValueChange?: (value: string[]) => void;
}) {
  const [tags, setTags] = React.useState(["design-system", "release"]);

  return (
    <Field className="w-[360px]">
      <FieldLabel htmlFor="tags">Tags</FieldLabel>
      <TagInput
        value={tags}
        disabled={disabled}
        maxTags={maxTags}
        inputLabel="Tags"
        placeholder="Add a tag"
        onValueChange={(nextTags) => {
          setTags(nextTags);
          onValueChange?.(nextTags);
        }}
        inputProps={{ id: "tags" }}
      />
      <FieldDescription>Labels synced to release notes and package triage.</FieldDescription>
    </Field>
  );
}

const meta = {
  title: "Components/Forms & Inputs/Tag Input",
  component: TagInputDemo,
  tags: ["autodocs", "test"],
  args: {
    disabled: false,
    maxTags: undefined,
    onValueChange: fn(),
  },
} satisfies Meta<typeof TagInputDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByLabelText("Tags");
    await userEvent.type(input, "storybook{enter}");

    await expect(canvas.getByText("storybook")).toBeInTheDocument();
    await expect(args.onValueChange).toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("button", { name: "Remove release" }));
    await expect(canvas.queryByText("release")).not.toBeInTheDocument();
  },
};

export const Limited: Story = {
  args: {
    maxTags: 2,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
