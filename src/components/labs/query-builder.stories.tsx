import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { QueryBuilder, type QueryBuilderExpression, type QueryBuilderField } from "./query-builder";

const fields: QueryBuilderField[] = [
  { id: "name", label: "Dataset name", type: "text" },
  { id: "rows", label: "Rows", type: "number" },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Ready", value: "ready" },
      { label: "Review", value: "review" },
      { label: "Blocked", value: "blocked" },
    ],
  },
  { id: "verified", label: "Verified", type: "boolean" },
];

const expression: QueryBuilderExpression = {
  id: "root",
  combinator: "and",
  rules: [
    { id: "rule-status", fieldId: "status", operator: "equals", value: "ready" },
    { id: "rule-rows", fieldId: "rows", operator: "gte", value: 1000 },
  ],
};

const meta = {
  title: "Components/Forms & Inputs/Query Builder",
  component: QueryBuilder,
  tags: ["autodocs", "test"],
  args: {
    fields,
    defaultExpression: expression,
    onExpressionChange: fn(),
  },
} satisfies Meta<typeof QueryBuilder>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DatasetFilterQuery: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getAllByRole("button", { name: "Add rule" })[0]);
    await expect(args.onExpressionChange).toHaveBeenCalled();
    await userEvent.click(canvas.getAllByRole("button", { name: "Add group" })[0]);
    await expect(args.onExpressionChange).toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
};

export const AdvancedControls: Story = {
  args: {
    defaultExpression: {
      id: "advanced-root",
      combinator: "or",
      rules: [
        { id: "advanced-name", fieldId: "name", operator: "contains", value: "Atlas" },
        {
          id: "advanced-group",
          combinator: "and",
          rules: [
            { id: "advanced-status", fieldId: "status", operator: "equals", value: "review" },
            { id: "advanced-verified", fieldId: "verified", operator: "equals", value: true },
          ],
        },
      ],
    },
    idFactory: (kind) => `story-${kind}`,
    operatorLabels: {
      contains: "matches text",
      equals: "is exactly",
    },
    emptyMessage: "No query rules configured.",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("matches text")).toBeVisible();
    await expect(canvas.getAllByText("is exactly")[0]).toBeVisible();
  },
};
