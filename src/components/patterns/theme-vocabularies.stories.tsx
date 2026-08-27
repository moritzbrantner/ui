import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { UiTheme } from "../../themes";
import {
  AlertRail,
  DeltaCell,
  KpiStrip,
  MapLegend,
  OperationalTable,
  SparklineCell,
} from "./atlas-operations";
import {
  AnnotationThread,
  DocumentOutline,
  DocumentPage,
  OcrDiff,
  PageThumbnailRail,
  TranslationPair,
} from "./paper-documents";
import {
  AchievementUnlock,
  CompletionRing,
  ReactionBurst,
  RewardChecklist,
  ShareSuccessCard,
  StreakIndicator,
} from "./pop-rewards-extended";
import {
  ProductEmptyState,
  ProductFormActions,
  InlineEdit,
  ResourceCard,
  ResponsiveToolbar,
  SettingsSection,
} from "./product-patterns";
import {
  ExpandingCard,
  KineticBreadcrumbs,
  KineticList,
  MorphingDialog,
  PanelStack,
  SpatialSegmentedControl,
} from "./pulse-spatial";
import {
  CitationTrail,
  InterpretationCompare,
  LemmaAnchor,
  MarginaliaRail,
  PassageNavigator,
  WitnessMatrix,
} from "./scholia-research";
import {
  BeforeAfter,
  InspectorPanel,
  LayerStack,
  MediaTransport,
  Playhead,
  Scrubber,
  TimelineTrack,
  ToolShelf,
} from "./studio-tools";
import {
  CommandDeck,
  GlassDock,
  HudPanel,
  LaunchCard,
  QuickSwitcher,
  StatusCapsule,
} from "./zleek-shells";

const meta = {
  title: "Design System/Theme Vocabularies",
  tags: ["autodocs", "test"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto grid w-full max-w-6xl gap-5 p-6">{children}</div>;
}

export const AtlasOperations: Story = {
  globals: { designSystem: "atlas" },
  render: () => (
    <UiTheme theme="atlas">
      <Frame>
        <KpiStrip
          items={[
            {
              id: "throughput",
              label: "Throughput",
              value: "12.4k",
              delta: "+8.1%",
              tone: "positive",
              meta: "requests/min",
            },
            {
              id: "latency",
              label: "P95 latency",
              value: "84ms",
              delta: "-12.3%",
              tone: "positive",
              meta: "last 15 min",
            },
            {
              id: "errors",
              label: "Errors",
              value: "0.7%",
              delta: "+0.2%",
              tone: "negative",
              meta: "rolling hour",
            },
          ]}
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <OperationalTable
            caption="Service operations"
            columns={[
              { key: "service", label: "Service" },
              { key: "region", label: "Region" },
              { key: "trend", label: "Trend" },
              { key: "latency", label: "Latency", align: "right" },
            ]}
            rows={[
              {
                id: "api",
                cells: {
                  service: "API",
                  region: "eu-central",
                  trend: <SparklineCell values={[3, 5, 4, 7, 8, 6]} />,
                  latency: <DeltaCell value="42ms" delta={-12.3} />,
                },
              },
              {
                id: "media",
                cells: {
                  service: "Media",
                  region: "us-east",
                  trend: <SparklineCell values={[8, 7, 7, 5, 4, 5]} />,
                  latency: "91ms",
                },
              },
            ]}
          />
          <div className="grid content-start gap-4">
            <MapLegend
              items={[
                { id: "base", label: "Base", color: "var(--map-layer-base)" },
                { id: "route", label: "Route", color: "var(--map-layer-accent)" },
                { id: "alerts", label: "Alerts", color: "var(--map-layer-critical)" },
              ]}
            />
            <AlertRail
              items={[
                {
                  id: 1,
                  title: "Latency threshold crossed",
                  detail: "media/us-east",
                  timestamp: "10:42",
                  severity: "warning",
                },
                { id: 2, title: "Route recovered", detail: "edge/eu", timestamp: "10:38" },
              ]}
            />
          </div>
        </div>
      </Frame>
    </UiTheme>
  ),
};

export const StudioTools: Story = {
  globals: { designSystem: "studio" },
  render: () => {
    const [playing, setPlaying] = React.useState(false);
    const [time, setTime] = React.useState(18);
    const [selectedLayer, setSelectedLayer] = React.useState<React.Key>("titles");
    const [tool, setTool] = React.useState("select");
    return (
      <UiTheme theme="studio">
        <Frame>
          <MediaTransport
            playing={playing}
            currentTime={time}
            duration={90}
            onPlayingChange={setPlaying}
            onSeek={setTime}
          />
          <div className="relative">
            <TimelineTrack
              duration={90}
              segments={[
                { id: "intro", label: "Intro", start: 0, end: 18 },
                { id: "scene", label: "Main scene", start: 18, end: 63 },
                { id: "outro", label: "Outro", start: 63, end: 90 },
              ]}
            />
            <Playhead position={time / 90} />
          </div>
          <Scrubber
            aria-label="Timeline scrubber"
            value={time}
            min={0}
            max={90}
            onValueChange={setTime}
          />
          <ToolShelf
            tools={[
              { id: "select", label: "Select", shortcut: "V" },
              { id: "cut", label: "Cut", shortcut: "C" },
              { id: "text", label: "Text", shortcut: "T" },
            ]}
            activeTool={tool}
            onToolChange={setTool}
          />
          <div className="grid gap-4 lg:grid-cols-[18rem_1fr_18rem]">
            <LayerStack
              layers={[
                { id: "titles", label: "Titles" },
                { id: "video", label: "Video" },
                { id: "audio", label: "Audio", depth: 1 },
              ]}
              selectedId={selectedLayer}
              onSelect={setSelectedLayer}
            />
            <BeforeAfter
              before={<div className="grid size-full place-items-center bg-muted">Original</div>}
              after={<div className="grid size-full place-items-center bg-primary/20">Grade</div>}
            />
            <InspectorPanel
              groups={[
                {
                  id: "transform",
                  label: "Transform",
                  content: (
                    <label className="grid gap-1 text-xs">
                      Scale
                      <input type="range" defaultValue="70" className="h-9 w-full" />
                    </label>
                  ),
                },
                {
                  id: "opacity",
                  label: "Appearance",
                  content: (
                    <label className="grid gap-1 text-xs">
                      Opacity
                      <input type="range" defaultValue="100" className="h-9 w-full" />
                    </label>
                  ),
                },
              ]}
            />
          </div>
        </Frame>
      </UiTheme>
    );
  },
};

export const ScholiaResearch: Story = {
  globals: { designSystem: "scholia" },
  render: () => (
    <UiTheme theme="scholia">
      <Frame>
        <PassageNavigator work="Aristotle, Physics" book="III" chapter="1" locator="201a10–11" />
        <InterpretationCompare
          readings={[
            {
              id: "actuality",
              label: "Actuality reading",
              preferred: true,
              source: "Physics III.1",
              children: (
                <>
                  Change is the <LemmaAnchor noteCount={2}>actuality</LemmaAnchor> of what exists
                  potentially.
                </>
              ),
            },
            {
              id: "process",
              label: "Process reading",
              source: "Alternative construal",
              children:
                "The formulation can be read as characterizing an unfolding process without making actuality static.",
            },
          ]}
        />
        <CitationTrail
          items={[
            { id: "a", author: "Aristotle", work: "Physics III.1", locator: "201a10–11" },
            { id: "b", author: "Aquinas", work: "In Physicorum", locator: "III, lect. 2" },
            { id: "c", author: "Commentary", work: "Modern interpretation" },
          ]}
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <WitnessMatrix
            witnesses={["A", "B", "C"]}
            rows={[
              {
                id: "energeia",
                lemma: "ἐντελέχεια",
                readings: { A: "ἐντελέχεια", B: "ἐνέργεια", C: "ἐντελέχεια" },
              },
            ]}
          />
          <MarginaliaRail
            notes={[
              {
                id: 1,
                label: "Terminology",
                locator: "201a10",
                children: "The Greek term supports more than one English rendering.",
              },
              {
                id: 2,
                label: "Dependency",
                locator: "201a11",
                children: "Potentiality is presupposed by the definition.",
              },
            ]}
          />
        </div>
      </Frame>
    </UiTheme>
  ),
};

export const PaperDocuments: Story = {
  globals: { designSystem: "paper" },
  render: () => (
    <UiTheme theme="paper">
      <Frame>
        <div className="grid gap-4 lg:grid-cols-[8rem_1fr_18rem]">
          <PageThumbnailRail
            selectedId="2"
            pages={[1, 2, 3].map((page) => ({ id: String(page), label: `Page ${page}` }))}
          />
          <DocumentPage pageNumber={2} header="Research notes" footer="Imported 25 Aug 2026">
            <h1 className="font-heading text-2xl font-semibold">A document-first work surface</h1>
            <p className="mt-4">
              Paper keeps reading, OCR correction, translation, and annotation visually quiet.
            </p>
            <TranslationPair
              className="mt-5"
              source="Omne quod movetur ab alio movetur."
              translation="Everything that is moved is moved by another."
              sourceLanguage="Latin"
              translationLanguage="English"
            />
          </DocumentPage>
          <DocumentOutline
            activeId="section-2"
            items={[
              { id: "intro", label: "Introduction", page: 1 },
              { id: "section-2", label: "Source text", page: 2 },
              { id: "notes", label: "Notes", level: 2, page: 4 },
            ]}
          />
        </div>
        <OcrDiff
          original={"The quick brown fox\njumps over the lazy dog."}
          extracted={"The quick brown fox\njurnps over the lazy dog."}
        />
        <AnnotationThread
          entries={[
            {
              id: 1,
              author: "Editor",
              timestamp: "10:14",
              body: "Check the OCR reading against the scan.",
            },
            {
              id: 2,
              author: "Translator",
              timestamp: "10:19",
              body: "Keep the technical term consistent with page 1.",
            },
          ]}
        />
      </Frame>
    </UiTheme>
  ),
};

export const ZleekShells: Story = {
  globals: { designSystem: "zleek" },
  render: () => (
    <UiTheme theme="zleek" className="min-h-screen bg-background">
      <Frame>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <GlassDock
            actions={[
              { id: "home", label: "Home" },
              { id: "launch", label: "Launch" },
              { id: "logs", label: "Logs" },
            ]}
            activeId="launch"
          />
          <StatusCapsule status="healthy" label="All systems nominal" detail="12 services" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <LaunchCard
            eyebrow="Deployment"
            title="Launch production"
            description="A focused glass surface for high-value actions."
            action={
              <button
                type="button"
                className="min-h-10 rounded bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                Launch
              </button>
            }
          />
          <CommandDeck
            items={[
              {
                id: "deploy",
                label: "Deploy current build",
                description: "Production / eu-central",
                shortcut: "⌘↵",
              },
              {
                id: "rollback",
                label: "Rollback",
                description: "Restore previous release",
                shortcut: "⌘R",
              },
            ]}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <QuickSwitcher
            items={[
              { id: "prod", label: "Production", detail: "primary" },
              { id: "stage", label: "Staging", detail: "preview" },
            ]}
            value="prod"
          />
          <HudPanel
            metrics={[
              { id: 1, label: "CPU", value: "41%" },
              { id: 2, label: "Memory", value: "6.8 GB" },
              { id: 3, label: "Latency", value: "84 ms" },
              { id: 4, label: "Deploy", value: "#1482" },
            ]}
          />
        </div>
      </Frame>
    </UiTheme>
  ),
};

export const ProductPatterns: Story = {
  globals: { designSystem: "bobba" },
  render: () => (
    <UiTheme theme="bobba">
      <Frame>
        <ResponsiveToolbar
          primary={
            <>
              <button type="button" className="min-h-10 rounded border px-2 py-1">
                Filter
              </button>
              <button type="button" className="min-h-10 rounded border px-2 py-1">
                Sort
              </button>
            </>
          }
          secondary={<InlineEdit value="Workspace name" />}
          overflow={
            <button type="button" className="min-h-10 rounded border px-2 py-1">
              More
            </button>
          }
        />
        <SettingsSection
          title="Workspace"
          description="General product settings remain theme-agnostic."
        >
          <label className="grid gap-1 text-sm">
            Name
            <input
              className="h-9 rounded border bg-background px-2 py-1.5"
              defaultValue="Example"
            />
          </label>
          <ProductFormActions
            primary={
              <button
                type="button"
                className="min-h-10 rounded bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                Save
              </button>
            }
            secondary={
              <button type="button" className="min-h-10 rounded border px-3 py-2 text-sm">
                Cancel
              </button>
            }
          />
        </SettingsSection>
        <div className="grid gap-4 md:grid-cols-2">
          <ResourceCard
            title="Project Atlas"
            description="Reusable resource presentation rather than a Bobba-specific component."
            meta="Updated today"
          />
          <ProductEmptyState
            title="No archived projects"
            description="Create or import a project to see it here."
            action={
              <button
                type="button"
                className="min-h-10 rounded bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                Create project
              </button>
            }
          />
        </div>
      </Frame>
    </UiTheme>
  ),
};

export const PopRewardsExtended: Story = {
  globals: { designSystem: "pop" },
  render: () => {
    const [items, setItems] = React.useState([
      { id: "profile", label: "Complete profile", checked: true },
      { id: "publish", label: "Publish first project", checked: false },
      { id: "share", label: "Share with someone", checked: false },
    ]);
    return (
      <UiTheme theme="pop">
        <Frame>
          <div className="flex flex-wrap items-center gap-4">
            <CompletionRing value={72} />
            <StreakIndicator days={7} best={12} />
            <ReactionBurst reaction="👏" count={18} active>
              Applaud
            </ReactionBurst>
          </div>
          <RewardChecklist
            items={items}
            onCheckedChange={(id, checked) =>
              setItems((current) =>
                current.map((item) => (item.id === id ? { ...item, checked } : item)),
              )
            }
          />
          <AchievementUnlock
            open
            title="First public project"
            description="Your work is live and ready to share."
          />
          <ShareSuccessCard
            title="Project published"
            description="Invite people into the moment rather than ending on a neutral toast."
            preview={<div className="grid h-full place-items-center bg-primary/10">Preview</div>}
            actions={
              <button
                type="button"
                className="min-h-10 rounded bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                Share now
              </button>
            }
          />
        </Frame>
      </UiTheme>
    );
  },
};

export const PulseSpatial: Story = {
  globals: { designSystem: "pulse" },
  render: () => {
    const [segment, setSegment] = React.useState("canvas");
    const [list, setList] = React.useState([
      { id: "a", content: "First item" },
      { id: "b", content: "Second item" },
    ]);
    const [panel, setPanel] = React.useState(0);
    return (
      <UiTheme theme="pulse">
        <Frame>
          <SpatialSegmentedControl
            items={[
              { id: "canvas", label: "Canvas" },
              { id: "layers", label: "Layers" },
              { id: "history", label: "History" },
            ]}
            value={segment}
            onValueChange={setSegment}
          />
          <KineticBreadcrumbs
            items={[
              { id: "workspace", label: "Workspace" },
              { id: "project", label: "Project" },
              { id: "scene", label: "Scene 04" },
            ]}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid content-start gap-2">
              <button
                type="button"
                className="min-h-10 justify-self-start rounded border px-3 py-2 text-sm"
                onClick={() =>
                  setList((current) => [
                    ...current,
                    { id: `item-${current.length + 1}`, content: "New item" },
                  ])
                }
              >
                Add item
              </button>
              <KineticList items={list} />
            </div>
            <ExpandingCard
              title="Spatial detail"
              summary="Expand while preserving where the surface came from."
            >
              The content is revealed as a continuation of the same object.
            </ExpandingCard>
          </div>
          <PanelStack
            activeIndex={panel}
            onActiveIndexChange={setPanel}
            panels={[
              { id: "one", title: "Choose source", content: "Select the starting material." },
              { id: "two", title: "Adjust", content: "Tune the transformation." },
              { id: "three", title: "Review", content: "Confirm the resulting state." },
            ]}
          />
          <MorphingDialog
            trigger="Open morphing dialog"
            title="Continuous dialog"
            description="The trigger becomes the surface instead of spawning an unrelated overlay."
          >
            Dialog content preserves spatial continuity.
          </MorphingDialog>
        </Frame>
      </UiTheme>
    );
  },
};
