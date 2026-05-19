import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartNoAxesColumnIcon, CodeIcon, FileTextIcon } from "lucide-react";

import { ResizableTabs, type ResizableTabsItem } from "./resizable-tabs";

const items: ResizableTabsItem[] = [
  {
    value: "preview",
    label: "Preview",
    icon: <FileTextIcon className="size-4" />,
    content: (
      <div className="grid min-h-56 place-items-center rounded-md border border-dashed border-border/70 bg-muted/25 text-sm text-muted-foreground">
        Preview panel
      </div>
    ),
  },
  {
    value: "code",
    label: "Code",
    icon: <CodeIcon className="size-4" />,
    content: (
      <pre className="min-h-56 overflow-auto rounded-md border bg-muted/30 p-4 text-sm">
        {`export function Example() {
  return <main>Ready</main>;
}`}
      </pre>
    ),
  },
  {
    value: "metrics",
    label: "Metrics",
    icon: <ChartNoAxesColumnIcon className="size-4" />,
    content: (
      <div className="grid min-h-56 gap-3 rounded-md border bg-card/65 p-4 text-sm">
        <div className="font-medium">Build health</div>
        <div className="h-2 rounded-full bg-muted">
          <div className="h-full w-3/4 rounded-full bg-primary" />
        </div>
      </div>
    ),
  },
];

function ResizableTabsDemo() {
  return <ResizableTabs items={items} defaultValue="preview" className="max-w-3xl" />;
}

const meta = {
  title: "Components/Navigation/Resizable Tabs",
  component: ResizableTabsDemo,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ResizableTabsDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LineVariant: Story = {
  render: () => (
    <ResizableTabs
      items={items}
      defaultValue="preview"
      listVariant="line"
      className="max-w-3xl"
      triggerMinSize={16}
    />
  ),
};
