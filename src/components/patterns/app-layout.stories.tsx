import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import {
  ActionBar,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageShell,
  PageTitle,
  SectionGrid,
  Surface,
  SurfaceAction,
  SurfaceContent,
  SurfaceDescription,
  SurfaceFooter,
  SurfaceHeader,
  SurfaceTitle,
} from "./app-layout";
import { Badge } from "../stable/badge";
import { Button } from "../stable/button";
import { CommandPalette } from "./command-palette";
import { PlatformNavbar } from "./platform-navbar";
import { Stat, StatDelta, StatDescription, StatGroup, StatLabel, StatValue } from "../stable/stat";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../stable/table";

type DashboardDemoProps = {
  onRefresh?: () => void;
};

const releaseRows = [
  { name: "@moritzbrantner/ui", status: "Ready", owner: "Design system" },
  { name: "@moritzbrantner/maps", status: "Review", owner: "Geo tools" },
  { name: "@moritzbrantner/storytelling", status: "Preview", owner: "Media" },
] as const;

function DashboardDemo({ onRefresh = () => undefined }: DashboardDemoProps) {
  return (
    <PageShell background="muted" maxWidth="wide" className="mx-auto max-w-[calc(100vw-2rem)]">
      <PageHeader>
        <div className="grid gap-2">
          <Badge variant="outline" className="w-fit">
            Platform
          </Badge>
          <PageTitle>Package operations</PageTitle>
          <PageDescription>
            Monitor package readiness, active reviews, and follow-up work across the shared platform
            workspace.
          </PageDescription>
        </div>
        <PageActions>
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
          <Button>New release</Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <StatGroup>
          <Stat>
            <StatLabel>Ready packages</StatLabel>
            <StatValue>18</StatValue>
            <StatDelta variant="positive">+4 this week</StatDelta>
          </Stat>
          <Stat>
            <StatLabel>Open reviews</StatLabel>
            <StatValue>6</StatValue>
            <StatDescription>Two need design review.</StatDescription>
          </Stat>
          <Stat>
            <StatLabel>Release confidence</StatLabel>
            <StatValue>92%</StatValue>
            <StatDelta>Stable</StatDelta>
          </Stat>
        </StatGroup>

        <SectionGrid columns="sidebar-right">
          <Surface>
            <SurfaceHeader>
              <div>
                <SurfaceTitle>Release queue</SurfaceTitle>
                <SurfaceDescription>Packages currently staged for verification.</SurfaceDescription>
              </div>
              <SurfaceAction>
                <Badge variant="secondary">3 items</Badge>
              </SurfaceAction>
            </SurfaceHeader>
            <SurfaceContent className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {releaseRows.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.owner}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SurfaceContent>
          </Surface>

          <Surface variant="muted">
            <SurfaceHeader>
              <SurfaceTitle>Review focus</SurfaceTitle>
              <SurfaceDescription>
                Keep interactive examples and typed exports aligned before the next publish.
              </SurfaceDescription>
            </SurfaceHeader>
            <SurfaceContent className="mt-4 grid gap-3">
              <Badge className="w-fit">Storybook</Badge>
              <Badge variant="outline" className="w-fit">
                Type checks
              </Badge>
              <Badge variant="secondary" className="w-fit">
                Smoke tests
              </Badge>
            </SurfaceContent>
            <SurfaceFooter>
              <Button size="sm" variant="outline">
                View checklist
              </Button>
            </SurfaceFooter>
          </Surface>
        </SectionGrid>
      </PageContent>
    </PageShell>
  );
}

const meta = {
  title: "Components/Layout/App Shell",
  component: DashboardDemo,
  tags: ["autodocs", "test"],
  args: {
    onRefresh: fn(),
  },
} satisfies Meta<typeof DashboardDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DashboardPage: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Refresh" }));

    await expect(args.onRefresh).toHaveBeenCalledTimes(1);
  },
};

export const CenteredHeader: Story = {
  render: () => (
    <PageShell background="none" maxWidth="default">
      <PageHeader align="center">
        <Badge variant="outline">Preview</Badge>
        <PageTitle>Centered launch page</PageTitle>
        <PageDescription>
          A compact page header for focused empty states, onboarding screens, and feature previews.
        </PageDescription>
        <PageActions>
          <Button>Start review</Button>
          <Button variant="outline">Open docs</Button>
        </PageActions>
      </PageHeader>
    </PageShell>
  ),
};

export const SurfaceVariants: Story = {
  render: () => (
    <PageShell background="muted">
      <SectionGrid columns="three">
        {(["default", "muted", "transparent"] as const).map((variant) => (
          <Surface key={variant} variant={variant}>
            <SurfaceHeader>
              <SurfaceTitle className="capitalize">{variant}</SurfaceTitle>
              <SurfaceDescription>Surface styling for reusable page sections.</SurfaceDescription>
            </SurfaceHeader>
            <SurfaceContent className="mt-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Use this variant where the surrounding page needs a distinct panel treatment.
              </p>
            </SurfaceContent>
          </Surface>
        ))}
      </SectionGrid>
    </PageShell>
  ),
};

export const StickyActionBar: Story = {
  render: () => (
    <PageShell background="none" maxWidth="default">
      <Surface>
        <SurfaceHeader>
          <SurfaceTitle>Release settings</SurfaceTitle>
          <SurfaceDescription>
            Sticky actions remain available after a long form or review panel.
          </SurfaceDescription>
        </SurfaceHeader>
        <SurfaceContent className="mt-4 grid gap-3">
          {["Package metadata", "Visual review", "Compatibility notes"].map((item) => (
            <div key={item} className="border border-border/60 bg-muted/25 p-3">
              {item}
            </div>
          ))}
        </SurfaceContent>
        <SurfaceFooter>
          <ActionBar sticky className="w-full">
            <Button variant="outline">Cancel</Button>
            <Button>Save changes</Button>
          </ActionBar>
        </SurfaceFooter>
      </Surface>
    </PageShell>
  ),
};

export const ComprehensiveAppShell: Story = {
  render: () => (
    <PageShell background="muted" maxWidth="wide" className="mx-auto max-w-[calc(100vw-2rem)]">
      <PlatformNavbar
        brand="Platform"
        variant="mobile"
        groups={[
          {
            id: "workspace",
            label: "Workspace",
            description: "Primary operating surfaces.",
            items: [
              { id: "overview", label: "Overview", href: "#overview", active: true },
              { id: "data", label: "Data", href: "#data", badge: "Live" },
            ],
          },
          {
            id: "admin",
            label: "Admin",
            description: "Fixture-only app controls.",
            items: [
              { id: "members", label: "Members", href: "#members" },
              { id: "settings", label: "Settings", href: "#settings" },
            ],
          },
        ]}
        activeItemId="overview"
        defaultOpenGroupId={null}
        languageSwitcher
        themeModeSwitch
        notificationMenu={{
          unreadCount: 1,
          items: [{ id: "review", title: "Review requested", unread: true, meta: "Now" }],
        }}
        accountMenu={{
          user: { name: "Ada Lovelace", email: "ada@example.com", initials: "AL" },
          items: [{ id: "profile", label: "Profile" }],
        }}
      />
      <PageHeader>
        <div className="grid gap-2">
          <PageTitle>Comprehensive app shell</PageTitle>
          <PageDescription>
            Navigation, shell layout, account controls, notifications, theme switching, and command
            palette composition without route or auth ownership.
          </PageDescription>
        </div>
        <PageActions>
          <Button variant="outline">Review</Button>
          <Button>Publish</Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        <SectionGrid columns="sidebar-right">
          <Surface>
            <SurfaceHeader>
              <SurfaceTitle>Operational surface</SurfaceTitle>
              <SurfaceDescription>
                Reusable shell components around app-owned state.
              </SurfaceDescription>
            </SurfaceHeader>
            <SurfaceContent className="mt-4">
              <p className="text-sm leading-6 text-muted-foreground">
                This story provides a representative visual target for app-scale layouts.
              </p>
            </SurfaceContent>
          </Surface>
          <Surface variant="muted">
            <SurfaceHeader>
              <SurfaceTitle>Fixture status</SurfaceTitle>
              <SurfaceDescription>Callbacks and data are Storybook-only.</SurfaceDescription>
            </SurfaceHeader>
          </Surface>
        </SectionGrid>
      </PageContent>
      <CommandPalette
        open={false}
        groups={[
          {
            id: "commands",
            label: "Commands",
            actions: [{ id: "publish", label: "Publish release" }],
          },
        ]}
      />
    </PageShell>
  ),
};
