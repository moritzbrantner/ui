import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowRightIcon,
  BellIcon,
  BookOpenIcon,
  CheckIcon,
  FileTextIcon,
  LibraryIcon,
  MapPinnedIcon,
  RadioTowerIcon,
  RefreshCwIcon,
  SparklesIcon,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CelebrationCallout,
  ConnectionStatus,
  LiveIndicator,
  LoadingBar,
  MetricStrip,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  UiTheme,
} from "./index";

function ThemeShowcaseFrame({ children }: { children: React.ReactNode }) {
  return <div className="w-[min(980px,calc(100vw-2rem))]">{children}</div>;
}

function ScholiaArchiveDemo() {
  const metadataRows = [
    ["Repository", "Municipal archive"],
    ["Date range", "1420-1435"],
    ["Language", "Latin"],
    ["Witnesses", "4 compared"],
  ] as const;

  return (
    <UiTheme theme="scholia" className="rounded-[var(--ui-radius-overlay)] bg-background p-5">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--ui-radius-surface)] border border-border bg-card p-[var(--ui-card-padding)] shadow-[var(--ui-shadow-surface)]">
          <div className="grid gap-1">
            <h2 className="font-heading text-lg font-semibold leading-snug">Source collation</h2>
            <p className="text-sm text-muted-foreground">
              Archival reading surfaces with quiet workbench controls.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Reviewed</Badge>
            <Badge variant="outline">2 citations</Badge>
            <Button size="sm">
              <BookOpenIcon />
              Open source
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Card data-interactive="true">
            <CardHeader>
              <CardTitle>Transcribed excerpt</CardTitle>
              <CardDescription>Highlighted passages use document tokens.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <article
                className="grid gap-3 rounded-[var(--ui-radius-surface)] border bg-card p-4 font-body text-sm leading-7 text-card-foreground"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--document-ruled-background) 1px, transparent 1px)",
                  backgroundSize: "100% 1.75rem",
                }}
              >
                <p>
                  The witness records a civic oath with a{" "}
                  <mark className="rounded-sm bg-[var(--document-highlight)] px-1 text-inherit">
                    rubricated obligation clause
                  </mark>{" "}
                  and two later corrections in the outer margin.
                </p>
                <blockquote className="border-l-2 border-[var(--document-quote)] pl-3 text-muted-foreground">
                  Source readings remain legible while citations and annotations retain distinct
                  accents.
                </blockquote>
                <div className="flex flex-wrap gap-2 font-control text-xs">
                  <Badge className="bg-[var(--document-citation)] text-primary-foreground">
                    fol. 12r
                  </Badge>
                  <Badge variant="outline">edition note</Badge>
                  <Badge variant="secondary">parallel witness</Badge>
                </div>
              </article>

              <div className="grid gap-2 rounded-[var(--ui-radius-surface)] border border-[var(--document-annotation)]/40 bg-muted/55 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <FileTextIcon className="size-4 text-[var(--document-annotation)]" />
                  Annotation queue
                </div>
                <p className="text-muted-foreground">
                  Two uncertain abbreviations and one place-name normalization are ready for review.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Source metadata</CardTitle>
                <CardDescription>Compact reference facts.</CardDescription>
              </CardHeader>
              <CardContent className="grid text-sm">
                {metadataRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Margin note</CardTitle>
                <CardDescription>Editorial context.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="rounded-[var(--ui-radius-control)] border-l-2 border-[var(--document-margin-note)] bg-muted/50 p-3">
                  Compare the place-name form against the regional gazetteer before finalizing the
                  apparatus entry.
                </div>
                <div className="grid gap-2">
                  <Button variant="secondary" size="sm">
                    <LibraryIcon />
                    View witnesses
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPinnedIcon />
                    Locate source
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UiTheme>
  );
}

function PopConsumerDemo() {
  return (
    <UiTheme theme="pop" className="rounded-[var(--ui-radius-overlay)] bg-background p-5">
      <div className="grid gap-4">
        <CelebrationCallout
          title="Creator kit unlocked"
          description="Three polished templates are ready. Pick one, customize the details, and share it with your audience."
          progress={68}
          action={
            <Button>
              Start creating
              <ArrowRightIcon />
            </Button>
          }
          secondaryAction={<Button variant="ghost">Browse templates</Button>}
        />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card data-interactive="true">
            <CardHeader>
              <CardTitle>Launch checklist</CardTitle>
              <CardDescription>Playful surfaces with useful structure.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Tabs defaultValue="draft">
                <TabsList>
                  <TabsTrigger value="draft">Draft</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                  <TabsTrigger value="share">Share</TabsTrigger>
                </TabsList>
                <TabsContent value="draft" className="grid gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>Ready</Badge>
                    <Badge variant="secondary">3 assets</Badge>
                    <Badge variant="outline">Pop theme</Badge>
                  </div>
                  <Progress value={68} aria-label="Creator kit progress" />
                </TabsContent>
                <TabsContent value="review">Review copy, images, and publish settings.</TabsContent>
                <TabsContent value="share">Generate the final share links.</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card data-interactive="true">
            <CardHeader>
              <CardTitle>Community pulse</CardTitle>
              <CardDescription>Consumer activity without app-specific state.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between gap-3 rounded-[var(--ui-radius-control)] bg-muted/50 p-3">
                <span className="text-sm font-medium">New reactions</span>
                <Badge variant="secondary">128</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[var(--ui-radius-control)] bg-muted/50 p-3">
                <span className="text-sm font-medium">Shares queued</span>
                <Badge variant="outline">24</Badge>
              </div>
              <Button variant="secondary">
                <SparklesIcon />
                Celebrate milestone
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </UiTheme>
  );
}

function PulseRealtimeDemo() {
  return (
    <UiTheme theme="pulse" className="rounded-[var(--ui-radius-overlay)] bg-background p-5">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--ui-radius-surface)] border border-border/60 bg-card p-[var(--ui-card-padding)] shadow-[var(--ui-shadow-surface)]">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold leading-snug">Realtime command surface</h2>
            <p className="text-sm text-muted-foreground">Active controls backed by live tokens.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LiveIndicator status="streaming" label="Stream" detail="1.2k/min" />
            <Button>
              <RefreshCwIcon />
              Sync now
            </Button>
          </div>
        </div>
        <MetricStrip
          items={[
            {
              id: "latency",
              label: "Latency",
              value: "42ms",
              delta: "-8%",
              deltaTone: "positive",
              description: "from baseline",
              icon: RadioTowerIcon,
            },
            {
              id: "events",
              label: "Events",
              value: "18.4k",
              delta: "+14%",
              deltaTone: "positive",
              description: "last hour",
              icon: BellIcon,
            },
            {
              id: "workers",
              label: "Workers",
              value: "24",
              delta: "healthy",
              deltaTone: "neutral",
              description: "all regions",
              icon: CheckIcon,
            },
          ]}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <ConnectionStatus status="syncing" />
          <ConnectionStatus status="synced" onSync={() => undefined} />
          <ConnectionStatus status="disconnected" onReconnect={() => undefined} />
        </div>
        <Card data-interactive="true">
          <CardHeader>
            <CardTitle>Live activity</CardTitle>
            <CardDescription>Continuous motion is reserved for active status.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <LiveIndicator status="active" label="Operators" detail="4 online" />
              <LiveIndicator status="syncing" label="Replication" detail="Applying changes" />
              <LiveIndicator status="healthy" label="Workers" detail="24 healthy" pulse={false} />
              <LiveIndicator status="alert" label="Queue pressure" detail="Retry rate elevated" />
            </div>
            <LoadingBar value={64} showValue label="Event processing" />
          </CardContent>
        </Card>
      </div>
    </UiTheme>
  );
}

const meta = {
  title: "Design System/Theme Showcase",
  tags: ["autodocs", "test"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const PopConsumerSurface: Story = {
  render: () => (
    <ThemeShowcaseFrame>
      <PopConsumerDemo />
    </ThemeShowcaseFrame>
  ),
};

export const ScholiaArchiveSurface: Story = {
  render: () => (
    <ThemeShowcaseFrame>
      <ScholiaArchiveDemo />
    </ThemeShowcaseFrame>
  ),
};

export const PulseRealtimeSurface: Story = {
  render: () => (
    <ThemeShowcaseFrame>
      <PulseRealtimeDemo />
    </ThemeShowcaseFrame>
  ),
};

export const SideBySide: Story = {
  render: () => (
    <div className="grid w-[min(1180px,calc(100vw-2rem))] gap-4 xl:grid-cols-2">
      <PopConsumerDemo />
      <PulseRealtimeDemo />
    </div>
  ),
};
