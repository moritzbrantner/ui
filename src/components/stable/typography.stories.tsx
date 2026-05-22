import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import {
  TypographyBlockquote,
  TypographyH1,
  TypographyH2,
  TypographyInlineCode,
  TypographyLead,
  TypographyList,
  TypographyMuted,
  TypographyP,
} from "./typography";

function TypographyDemo() {
  return (
    <article className="max-w-3xl">
      <TypographyH1>Design system typography</TypographyH1>
      <TypographyLead>
        Reusable text primitives for app documentation and dense product copy.
      </TypographyLead>
      <TypographyH2>Usage</TypographyH2>
      <TypographyP>
        Compose headings, paragraphs, lists, quotes, and inline code without app-specific content
        rules.
      </TypographyP>
      <TypographyBlockquote>
        Shared typography should stay readable across themes.
      </TypographyBlockquote>
      <TypographyList>
        <li>Stable slots</li>
        <li>DOM props</li>
        <li>Theme tokens</li>
      </TypographyList>
      <TypographyP>
        Install with <TypographyInlineCode>bun add @moritzbrantner/ui</TypographyInlineCode>.
      </TypographyP>
      <TypographyMuted>Muted supporting copy.</TypographyMuted>
    </article>
  );
}

const meta = {
  title: "Components/Typography",
  component: TypographyDemo,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof TypographyDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Design system typography")).toBeVisible();
  },
};
