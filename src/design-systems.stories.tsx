import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  ActivityIcon,
  ArrowRightIcon,
  BarChart3Icon,
  BookOpenIcon,
  GaugeIcon,
  FileTextIcon,
  ImageIcon,
  Layers3Icon,
  PaletteIcon,
  SearchIcon,
} from "lucide-react";

import { Badge } from "./components/stable/badge";
import { Button } from "./components/stable/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/stable/card";
import { Checkbox } from "./components/stable/checkbox";
import { Input } from "./components/stable/input";
import { Label } from "./components/stable/label";
import { NativeSelect, NativeSelectOption } from "./components/stable/native-select";
import { Progress } from "./components/stable/progress";
import { RadioGroup, RadioGroupItem } from "./components/stable/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/stable/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/stable/select";
import { Separator } from "./components/stable/separator";
import { Slider } from "./components/stable/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/stable/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/stable/tabs";
import { ThemeModeSwitch } from "./components/stable/theme-mode-switch";
import { UiTheme, uiThemeLabels, uiThemeProfiles, type UiThemeProfile } from "./themes";

type SystemProfile = UiThemeProfile & {
  icon: typeof Layers3Icon;
};

const systemIcons = {
  bobba: Layers3Icon,
  zleek: PaletteIcon,
  atlas: BarChart3Icon,
  studio: ImageIcon,
  paper: FileTextIcon,
  scholia: BookOpenIcon,
  pop: ActivityIcon,
  pulse: GaugeIcon,
} as const satisfies Record<UiThemeProfile["name"], typeof Layers3Icon>;

const surfaceDescriptions = {
  neutral: "Clean surfaces with moderate radius",
  glass: "Glass effects with strong depth",
  dense: "Flat data panels with tighter controls",
  creative: "Vivid panels with creative accents",
  document: "Paper texture with quiet controls",
  consumer: "Bright elevated cards with animated affordances",
  kinetic: "Choreographed movement for interaction-heavy surfaces",
} as const satisfies Record<UiThemeProfile["surface"], string>;

const densityLabels = {
  compact: "High density",
  balanced: "Balanced spacing",
  comfortable: "Comfortable spacing",
} as const satisfies Record<UiThemeProfile["density"], string>;

const systems = Object.values(uiThemeProfiles).map((profile) => ({
  ...profile,
  icon: systemIcons[profile.name],
})) as readonly SystemProfile[];

const meta = {
  title: "Design System/Theme Catalog",
  tags: ["autodocs", "test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bobba: Story = {
  globals: { designSystem: "bobba" },
  render: () => <DesignSystemShowcase systemId="bobba" />,
};

export const Zleek: Story = {
  globals: { designSystem: "zleek" },
  render: () => <DesignSystemShowcase systemId="zleek" />,
};

export const Atlas: Story = {
  globals: { designSystem: "atlas" },
  render: () => <DesignSystemShowcase systemId="atlas" />,
};

export const Studio: Story = {
  globals: { designSystem: "studio" },
  render: () => <DesignSystemShowcase systemId="studio" />,
};

export const Paper: Story = {
  globals: { designSystem: "paper" },
  render: () => <DesignSystemShowcase systemId="paper" />,
};

export const Scholia: Story = {
  globals: { designSystem: "scholia" },
  render: () => <DesignSystemShowcase systemId="scholia" />,
};

export const Pop: Story = {
  globals: { designSystem: "pop" },
  render: () => <DesignSystemShowcase systemId="pop" />,
};

export const Pulse: Story = {
  globals: { designSystem: "pulse" },
  render: () => <DesignSystemShowcase systemId="pulse" />,
};

function DesignSystemShowcase({ systemId }: { systemId: UiThemeProfile["name"] }) {
  const system = systems.find((item) => item.name === systemId) ?? systems[0];

  return (
    <UiTheme theme={system.name} className="min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 lg:px-10">
        <section className="grid gap-6 lg:hidden">
          <HeroPanel system={system} />
          <SystemProfileCard system={system} />
        </section>

        <ResizablePanelGroup orientation="horizontal" className="hidden min-h-[360px] lg:flex">
          <ResizablePanel defaultSize="66%" minSize="48%" className="grid min-w-0 pr-6">
            <HeroPanel system={system} />
          </ResizablePanel>
          <ResizableHandle
            withHandle
            aria-label="Resize system profile preview"
            className="bg-border/80 transition-colors hover:bg-primary"
          />
          <ResizablePanel defaultSize="34%" minSize="24%" maxSize="45%" className="min-w-0 pl-6">
            <SystemProfileCard system={system} className="h-full" />
          </ResizablePanel>
        </ResizablePanelGroup>

        <section className="grid gap-6 lg:hidden">
          <ComponentPreview />
          <DataPreview />
        </section>

        <ResizablePanelGroup orientation="horizontal" className="hidden min-h-[620px] lg:flex">
          <ResizablePanel defaultSize="56%" minSize="42%" className="min-w-0 pr-6">
            <ComponentPreview className="h-full" />
          </ResizablePanel>
          <ResizableHandle
            withHandle
            aria-label="Resize component previews"
            className="bg-border/80 transition-colors hover:bg-primary"
          />
          <ResizablePanel defaultSize="44%" minSize="32%" className="min-w-0 pl-6">
            <DataPreview className="h-full" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </UiTheme>
  );
}

function HeroPanel({ system }: { system: SystemProfile }) {
  const Icon = system.icon;

  return (
    <div className="grid content-center gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{system.label}</Badge>
        <Badge variant="outline">{densityLabels[system.density]}</Badge>
      </div>
      <div className="grid gap-3">
        <h1 className="text-4xl font-semibold tracking-normal lg:text-5xl">
          {uiThemeLabels[system.name]}
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">{system.description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {system.bestFor.map((item) => (
          <Badge key={item} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button>
          <Icon />
          Primary action
        </Button>
        <Button variant="secondary">
          Review system
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}

function SystemProfileCard({ system, className }: { system: SystemProfile; className?: string }) {
  return (
    <Card data-interactive="true" data-ui-hover-growth="none" className={className}>
      <CardHeader>
        <CardTitle level={2}>System profile</CardTitle>
        <CardDescription>{surfaceDescriptions[system.surface]}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <TokenSwatches />
        <ThemePersonalityPreview system={system} />
        <StatusSwatches />
        <ChartSwatches />
        <Separator />
        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">72%</span>
          </div>
          <Progress value={72} aria-label="System profile completion" />
        </div>
      </CardContent>
    </Card>
  );
}

function TokenSwatches() {
  const tokens = [
    ["Background", "var(--background)", "var(--foreground)"],
    ["Primary", "var(--primary)", "var(--primary-foreground)"],
    ["Secondary", "var(--secondary)", "var(--secondary-foreground)"],
    ["Accent", "var(--accent)", "var(--accent-foreground)"],
    ["Muted", "var(--muted)", "var(--muted-foreground)"],
    ["Card", "var(--card)", "var(--card-foreground)"],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3">
      {tokens.map(([label, background, foreground]) => (
        <div
          key={label}
          className="flex h-20 items-end rounded-md border p-3 text-sm font-medium"
          style={{ background, color: foreground }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function ThemePersonalityPreview({ system }: { system: SystemProfile }) {
  if (system.name === "bobba") {
    return (
      <div className="grid gap-3 rounded-[var(--ui-card-radius)] border bg-card p-4 text-card-foreground">
        <div className="flex items-center justify-between gap-4">
          <div className="grid gap-1">
            <span className="text-sm font-medium">Rounded shell</span>
            <span className="text-xs text-muted-foreground">Friendly default controls</span>
          </div>
          <ThemeModeSwitch defaultMode="light" aria-label="Bobba color mode" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Control", "Surface", "Overlay"].map((label) => (
            <div
              key={label}
              className="grid h-12 place-items-center border bg-background px-2 text-xs font-medium"
              style={{ borderRadius: `var(--ui-radius-${label.toLowerCase()})` }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (system.name === "atlas") {
    return (
      <div className="grid gap-3 rounded-[var(--ui-card-radius)] border bg-card p-3 text-card-foreground">
        <div className="grid grid-cols-3 gap-1 text-xs">
          {[
            ["Base", "var(--map-layer-base)"],
            ["Route", "var(--map-layer-accent)"],
            ["Alert", "var(--map-layer-critical)"],
          ].map(([label, color]) => (
            <div key={label} className="grid gap-1">
              <span
                className="h-6 rounded-[var(--ui-radius-control)]"
                style={{ background: color }}
              />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <div className="grid divide-y rounded-[var(--ui-radius-control)] border text-xs">
          {[
            ["Throughput", "+12.4%", "var(--data-positive)"],
            ["Latency", "-3.1%", "var(--data-negative)"],
          ].map(([label, value, color]) => (
            <div key={label} className="flex items-center justify-between px-2 py-1.5">
              <span>{label}</span>
              <span className="font-medium" style={{ color }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (system.name === "studio") {
    return (
      <div className="grid gap-3 rounded-[var(--ui-card-radius)] border bg-[var(--editor-canvas)] p-3 text-card-foreground">
        <div
          className="relative h-20 overflow-hidden rounded-[var(--ui-radius-surface)] border"
          style={{
            backgroundImage:
              "linear-gradient(var(--editor-canvas-grid) 1px, transparent 1px), linear-gradient(90deg, var(--editor-canvas-grid) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <span className="absolute inset-y-3 left-8 w-1 rounded-full bg-[var(--editor-playhead)]" />
          <span className="absolute right-4 bottom-4 left-14 h-7 rounded-[var(--ui-radius-control)] bg-[var(--editor-layer)]" />
          <span className="absolute top-4 right-10 left-5 h-5 rounded-[var(--ui-radius-control)] bg-[var(--editor-selection)]" />
        </div>
        <div className="h-3 rounded-[var(--ui-radius-control)] bg-[var(--editor-timeline)]" />
      </div>
    );
  }

  if (system.name === "paper" || system.name === "scholia") {
    return (
      <div
        className="grid gap-2 rounded-[var(--ui-card-radius)] border bg-card p-4 font-body text-sm text-card-foreground"
        style={{
          backgroundImage: "linear-gradient(var(--document-ruled-background) 1px, transparent 1px)",
          backgroundSize: "100% 1.5rem",
        }}
      >
        <p>
          The archive note includes a{" "}
          <mark className="rounded-sm bg-[var(--document-highlight)] px-1 text-inherit">
            highlighted clause
          </mark>{" "}
          and a cited source.
        </p>
        <div className="border-l-2 border-[var(--document-quote)] pl-3 text-muted-foreground">
          Document quote and margin notes stay quiet but legible.
        </div>
      </div>
    );
  }

  return null;
}

function StatusSwatches() {
  const tokens = [
    ["Success", "var(--success)", "var(--success-foreground)"],
    ["Warning", "var(--warning)", "var(--warning-foreground)"],
    ["Info", "var(--info)", "var(--info-foreground)"],
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2">
      {tokens.map(([label, background, foreground]) => (
        <div
          key={label}
          className="grid h-14 place-items-center rounded-md border px-2 text-xs font-medium"
          style={{ background, color: foreground }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function ChartSwatches() {
  const tokens = Array.from({ length: 10 }, (_, index) => `var(--chart-${index + 1})`);

  return (
    <div className="grid grid-cols-10 gap-1" aria-label="Chart token swatches">
      {tokens.map((background, index) => (
        <div
          key={background}
          className="h-8 rounded-sm border border-border/70"
          style={{ background }}
          title={`Chart ${index + 1}`}
        />
      ))}
    </div>
  );
}

function ComponentPreview({ className }: { className?: string }) {
  const [confidence, setConfidence] = useState([72]);
  const [contrast, setContrast] = useState([36, 84]);
  const [density, setDensity] = useState("comfortable");
  const [shipChannel, setShipChannel] = useState("preview");
  const [nativeChannel, setNativeChannel] = useState("canary");
  const [includeIcons, setIncludeIcons] = useState(true);
  const [includeForms, setIncludeForms] = useState(true);
  const [includeTables, setIncludeTables] = useState(false);

  return (
    <Card data-interactive="true" data-ui-hover-growth="none" className={className}>
      <CardHeader>
        <CardTitle level={2}>Controls and status</CardTitle>
        <CardDescription>
          Buttons, sliders, radio groups, checkbox selects, and menu selects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="grid gap-5">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input aria-label="Search projects" placeholder="Search projects" />
              <Button variant="outline">
                <SearchIcon />
                Search
              </Button>
            </div>
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra small</Button>
                <Button size="sm" variant="secondary">
                  Small
                </Button>
                <Button size="lg" variant="outline">
                  Large
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label="Search status">
                  <SearchIcon />
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="controls" className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Active jobs" value="24" />
              <Metric label="Review queue" value="8" />
              <Metric label="Passed" value="96%" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-4 rounded-md border bg-card p-4 text-card-foreground">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Label htmlFor="system-confidence">Confidence</Label>
                    <span className="font-medium">{confidence[0]}%</span>
                  </div>
                  <Slider
                    id="system-confidence"
                    value={confidence}
                    max={100}
                    step={1}
                    onValueChange={setConfidence}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Label htmlFor="contrast-range">Contrast range</Label>
                    <span className="font-medium">
                      {contrast[0]}-{contrast[1]}%
                    </span>
                  </div>
                  <Slider
                    id="contrast-range"
                    value={contrast}
                    min={0}
                    max={100}
                    step={2}
                    onValueChange={setContrast}
                  />
                </div>
              </div>

              <div className="grid gap-4 rounded-md border bg-card p-4 text-card-foreground">
                <Label>Review density</Label>
                <RadioGroup
                  value={density}
                  onValueChange={setDensity}
                  className="grid gap-2 sm:grid-cols-3"
                >
                  {["compact", "comfortable", "spacious"].map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <RadioGroupItem value={value} />
                      <span className="capitalize">{value}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-3 rounded-md border bg-card p-4 text-card-foreground">
                <Label>Status checks</Label>
                {[
                  ["icons", "Icon buttons", includeIcons, setIncludeIcons],
                  ["forms", "Form states", includeForms, setIncludeForms],
                  ["tables", "Table density", includeTables, setIncludeTables],
                ].map(([id, label, checked, setChecked]) => (
                  <label
                    key={id as string}
                    className="flex items-center justify-between gap-4 rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <span>{label as string}</span>
                    <Checkbox
                      checked={checked as boolean}
                      onCheckedChange={(nextChecked) =>
                        (setChecked as (value: boolean) => void)(nextChecked === true)
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-3 rounded-md border bg-card p-4 text-card-foreground">
                <div className="grid gap-2">
                  <Label htmlFor="ship-channel">Ship channel</Label>
                  <Select value={shipChannel} onValueChange={setShipChannel}>
                    <SelectTrigger id="ship-channel" className="w-full">
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="preview">Preview</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="native-channel">Native select</Label>
                  <NativeSelect
                    id="native-channel"
                    className="w-full"
                    value={nativeChannel}
                    onChange={(event) => setNativeChannel(event.currentTarget.value)}
                  >
                    <NativeSelectOption value="alpha">Alpha</NativeSelectOption>
                    <NativeSelectOption value="beta">Beta</NativeSelectOption>
                    <NativeSelectOption value="canary">Canary</NativeSelectOption>
                    <NativeSelectOption value="stable">Stable</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="states" className="flex flex-wrap gap-3">
            <Badge>Ready</Badge>
            <Badge variant="secondary">Queued</Badge>
            <Badge variant="outline">Draft</Badge>
            <Badge variant="destructive">Blocked</Badge>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button size="sm">
          <ActivityIcon />
          Run check
        </Button>
      </CardFooter>
    </Card>
  );
}

function DataPreview({ className }: { className?: string }) {
  const rows = [
    ["Maps", "Atlas", "Dense"],
    ["Media editor", "Studio", "Creative"],
    ["OCR", "Paper", "Research"],
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle level={2}>Data and product patterns</CardTitle>
        <CardDescription>Shared tokens across tabular, status, and workflow UI.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>System</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([name, system, mode]) => (
              <TableRow key={name}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{system}</TableCell>
                <TableCell>{mode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="grid gap-3">
          {[64, 42, 88].map((value, index) => (
            <div key={value} className="grid grid-cols-[72px_1fr_44px] items-center gap-3 text-sm">
              <span className="text-muted-foreground">Signal {index + 1}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
              </div>
              <span className="text-right font-medium">{value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-4 text-card-foreground">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
