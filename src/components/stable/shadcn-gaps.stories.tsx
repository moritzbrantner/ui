import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Badge } from "./badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

const missingShadcnUiComponents = [
  {
    name: "form",
    note: "No shadcn-compatible form wrapper is implemented. Use Field and FormLayout for local package surfaces.",
  },
] as const;

function ShadcnGapsPreview() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 p-6">
      {missingShadcnUiComponents.map((component) => (
        <Card key={component.name} data-testid={`shadcn-gap-${component.name}`}>
          <CardHeader>
            <CardTitle>{component.name}</CardTitle>
            <CardDescription>
              Upstream shadcn registry component not implemented locally.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm text-muted-foreground">{component.note}</p>
            <Badge variant="outline" className="w-fit">
              registry:ui
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const meta = {
  title: "Reference/Shadcn Gaps",
  component: ShadcnGapsPreview,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ShadcnGapsPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MissingComponents: Story = {
  play: async ({ canvas }) => {
    for (const component of missingShadcnUiComponents) {
      await expect(canvas.getByTestId(`shadcn-gap-${component.name}`)).toBeVisible();
    }
  },
};
