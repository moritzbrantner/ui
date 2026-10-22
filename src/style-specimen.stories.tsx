import type { Meta, StoryObj } from "@storybook/react-vite";

import themeScopesStyles from "../theme-scopes.css?inline";

import { Badge } from "./components/stable/badge";
import { Button } from "./components/stable/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/stable/card";
import { Input } from "./components/stable/input";
import { Separator } from "./components/stable/separator";
import { UiTheme, builtInUiThemeNames, uiThemeLabels, type BuiltInUiThemeName } from "./themes";

const meta = {
  title: "Design System/Style Specimen",
  parameters: {
    a11y: {
      test: "todo",
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <>
        <style>{themeScopesStyles}</style>
        <Story />
      </>
    ),
  ],
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
          <span className="text-ui-caption uppercase text-muted-foreground">Typography ladder</span>
          <dl className="grid gap-3">
            {typographyLadder.map(({ role, className, sample }) => (
              <div
                key={role}
                className="grid items-baseline gap-1 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4"
              >
                <dt className="font-mono text-ui-caption text-muted-foreground">{role}</dt>
                <dd className={`max-w-(--ui-text-measure) ${className}`}>{sample}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </UiTheme>
  );
}

const typographyLadder = [
  { role: "display", className: "font-heading text-ui-display", sample: "Display" },
  { role: "heading-1", className: "font-heading text-ui-heading-1", sample: "Heading one" },
  { role: "heading-2", className: "font-heading text-ui-heading-2", sample: "Heading two" },
  { role: "heading-3", className: "font-heading text-ui-heading-3", sample: "Heading three" },
  { role: "title", className: "font-heading text-ui-title", sample: "Card or panel title" },
  {
    role: "body",
    className: "font-body text-ui-body",
    sample:
      "Body copy should remain comfortable to scan, while control text and dense numeric data stay compact enough for application interfaces.",
  },
  {
    role: "body-small",
    className: "font-body text-ui-body-small text-muted-foreground",
    sample: "Supporting copy sits one step below body and keeps the reading measure.",
  },
  { role: "control", className: "font-control text-ui-control", sample: "Control label" },
  {
    role: "caption",
    className: "font-body text-ui-caption text-muted-foreground",
    sample: "Caption and metadata",
  },
  { role: "mono", className: "font-mono text-ui-mono tabular-nums", sample: "123,456.78 ms" },
] as const;

const densityProfiles = ["compact", "default", "comfortable"] as const;

function DensitySpecimen({ theme }: { theme: BuiltInUiThemeName }) {
  return (
    <UiTheme theme={theme} className="bg-background p-6 text-foreground">
      <div className="grid gap-6 lg:grid-cols-3">
        {densityProfiles.map((density) => (
          <div key={density} data-ui-density={density} data-testid={`density-${density}`}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{density}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-[var(--ui-surface-gap)]">
                <Input aria-label={`${density} project name`} defaultValue="Atlas migration" />
                <div className="flex flex-wrap gap-[var(--ui-control-gap)]">
                  <Button>Save</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
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

export const DensityProfiles: Story = {
  render: () => (
    <div className="grid gap-4 bg-muted/40 p-4">
      {builtInUiThemeNames.map((theme) => (
        <div key={theme} className="overflow-hidden rounded-xl border bg-background">
          <DensitySpecimen theme={theme} />
        </div>
      ))}
    </div>
  ),
};
