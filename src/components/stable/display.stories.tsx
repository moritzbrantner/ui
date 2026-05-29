import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Badge } from "./badge";
import { Button } from "./button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCode,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
} from "./code-block";
import {
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
} from "./description-list";
import { Stat, StatDelta, StatGroup, StatLabel, StatValue } from "./stat";

function DisplayPreview() {
  return (
    <div className="grid max-w-3xl gap-6">
      <StatGroup>
        <Stat>
          <StatLabel>Requests</StatLabel>
          <StatValue>24.8k</StatValue>
          <StatDelta variant="positive">+8.2%</StatDelta>
        </Stat>
        <Stat>
          <StatLabel>Errors</StatLabel>
          <StatValue>12</StatValue>
          <StatDelta variant="negative">+3</StatDelta>
        </Stat>
      </StatGroup>

      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Environment</DescriptionListTerm>
          <DescriptionListDetail>Production</DescriptionListDetail>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Owner</DescriptionListTerm>
          <DescriptionListDetail>Platform</DescriptionListDetail>
        </DescriptionListItem>
      </DescriptionList>

      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>package.ts</CodeBlockTitle>
          <CodeBlockActions>
            <Badge variant="outline">tsx</Badge>
            <Button variant="ghost" size="xs">
              Copy
            </Button>
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>
          <CodeBlockCode>{`export function ready() {
  return true
}`}</CodeBlockCode>
        </CodeBlockContent>
      </CodeBlock>

      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Release track</DescriptionListTerm>
          <DescriptionListDetail>Stable primitives only</DescriptionListDetail>
        </DescriptionListItem>
      </DescriptionList>
    </div>
  );
}

const meta = {
  title: "Components/Data Display/Display",
  component: DisplayPreview,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof DisplayPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("24.8k")).toBeVisible();
    await expect(canvas.getByText("package.ts")).toBeVisible();
    await expect(canvas.getByText("Stable primitives only")).toBeVisible();
  },
};
