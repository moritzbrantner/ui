import type { Meta, StoryObj } from "@storybook/react-vite";

import "../theme-scopes.css";

import { Badge } from "./components/stable/badge";
import { Button } from "./components/stable/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/stable/card";
import { Input } from "./components/stable/input";
import { Separator } from "./components/stable/separator";
import { UiTheme, builtInUiThemeNames, uiThemeLabels, type BuiltInUiThemeName } from "./themes";

const meta = {
  title: "Design System/Style Specimen",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs", "test"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function Specimen({ theme }: { theme: BuiltInUiThemeName }) {
  return (
    <UiTheme
      theme={theme}
      data-testid={`style-specimen-${theme}`}
      className="min-h-full bg-background p-6 text-foreground"
    >
      <div className="mx-auto grid max-w-5xl gap-8">
        <header className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{uiThemeLabels[theme]}</Badge>
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Shared reference composition
            </span>
          </div>
          <div className="grid max-w-3xl gap-2">
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              Visual hierarchy should survive the theme.
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              This specimen deliberately repeats the same content and component structure so color,
              density, typography, shape, elevation, motion, and surface treatment can be compared
              without product-layout noise.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-[var(--ui-surface-gap)]">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor={`project-${theme}`}>
                  Project name
                </label>
                <Input id={`project-${theme}`} defaultValue="Atlas migration" />
              </div>
              <div className="flex flex-wrap gap-[var(--ui-control-gap)]">
                <Button>Primary action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status and rhythm</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-[var(--ui-surface-gap)]">
              <div className="flex flex-wrap gap-2">
                <Badge>Active</Badge>
                <Badge variant="secondary">Queued</Badge>
                <Badge variant="outline">Draft</Badge>
                <Badge variant="destructive">Blocked</Badge>
              </div>
              <Separator />
              <div className="grid gap-1">
                <p className="text-sm font-medium">Dense supporting information</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  The same information density should feel intentional in every theme instead of
                  becoming a side effect of isolated component values.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-3 rounded-[var(--ui-radius-surface)] border bg-card p-[var(--ui-surface-padding-md)] shadow-[var(--ui-shadow-surface)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Typography ladder
              </span>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Section heading
              </h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">123,456.78 ms</span>
          </div>
          <p className="max-w-[70ch] text-base leading-7">
            Body copy should remain comfortable to scan, while control text and dense numeric data
            should remain compact enough for application interfaces.
          </p>
          <p className="max-w-[70ch] text-sm leading-6 text-muted-foreground">
            This story is the baseline for future typography and density tokens. Theme changes that
            improve one component while degrading the overall composition should be visible here.
          </p>
        </section>
      </div>
    </UiTheme>
  );
}

export const AllThemes: Story = {
  render: () => (
    <div className="grid gap-8 bg-muted/40 p-4 lg:grid-cols-2">
      {builtInUiThemeNames.map((theme) => (
        <div key={theme} className="overflow-hidden rounded-xl border bg-background">
          <Specimen theme={theme} />
        </div>
      ))}
    </div>
  ),
};

export const Bobba: Story = { render: () => <Specimen theme="bobba" /> };
export const Zleek: Story = { render: () => <Specimen theme="zleek" /> };
export const Atlas: Story = { render: () => <Specimen theme="atlas" /> };
export const Studio: Story = { render: () => <Specimen theme="studio" /> };
export const Paper: Story = { render: () => <Specimen theme="paper" /> };
export const Scholia: Story = { render: () => <Specimen theme="scholia" /> };
export const Pop: Story = { render: () => <Specimen theme="pop" /> };
export const Pulse: Story = { render: () => <Specimen theme="pulse" /> };
