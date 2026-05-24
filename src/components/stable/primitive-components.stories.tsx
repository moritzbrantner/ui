import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Separator } from "./separator";
import { Skeleton } from "./skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

const overviewComponents = ["button", "badge", "card", "input", "table", "separator", "skeleton"];

function PrimitiveSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-testid={`primitive-${id}`}
      className="grid min-h-32 content-start gap-3 border border-border/60 bg-card/55 p-4 text-sm shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <Badge variant="outline">{id}</Badge>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function PrimitiveComponentsPreview() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PrimitiveSection id="button" title="Button">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </PrimitiveSection>

        <PrimitiveSection id="badge" title="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </PrimitiveSection>

        <PrimitiveSection id="card" title="Card">
          <Card>
            <CardHeader>
              <CardTitle>Package preview</CardTitle>
            </CardHeader>
            <CardContent>Shared primitives with the default surface tokens.</CardContent>
          </Card>
        </PrimitiveSection>

        <PrimitiveSection id="input" title="Input">
          <Input aria-label="Package input" defaultValue="@moritzbrantner/ui" />
        </PrimitiveSection>

        <PrimitiveSection id="table" title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>UI</TableCell>
                <TableCell>Ready</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </PrimitiveSection>

        <PrimitiveSection id="separator" title="Separator">
          <div>
            <span>Above</span>
            <Separator className="my-3" />
            <span>Below</span>
          </div>
        </PrimitiveSection>

        <PrimitiveSection id="skeleton" title="Skeleton">
          <div className="grid gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </PrimitiveSection>
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Stable/Primitive Components",
  component: PrimitiveComponentsPreview,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PrimitiveComponentsPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  play: async ({ canvas }) => {
    for (const component of overviewComponents) {
      await expect(canvas.getByTestId(`primitive-${component}`)).toBeVisible();
    }
  },
};
