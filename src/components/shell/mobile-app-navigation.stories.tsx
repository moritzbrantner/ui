import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import {
  BellIcon,
  BookOpenIcon,
  DatabaseIcon,
  FileTextIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MessageCircleIcon,
  SettingsIcon,
  UserCircleIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "../stable/badge";
import { Button } from "../stable/button";
import { MobileAppNavigation } from "./mobile-app-navigation";
import { NavbarActions } from "./navbar-actions";
import type { NavbarGroup } from "./navbar";

const navigationGroups = [
  {
    id: "home",
    label: "Home",
    description: "Personal workspace and recent activity.",
    icon: <HomeIcon className="size-4" />,
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "#overview",
        description: "Daily status and pinned work.",
        icon: <HomeIcon className="size-4" />,
        active: true,
      },
      {
        id: "inbox",
        label: "Inbox",
        href: "#inbox",
        description: "Mentions and assigned follow-ups.",
        icon: <BellIcon className="size-4" />,
        badge: "3",
      },
    ],
  },
  {
    id: "workspace",
    label: "Work",
    description: "Package and release operations.",
    icon: <LayoutDashboardIcon className="size-4" />,
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "#dashboard",
        description: "Operational overview.",
        icon: <LayoutDashboardIcon className="size-4" />,
      },
      {
        id: "data",
        label: "Data",
        href: "#data",
        description: "Tables, reports, and exports.",
        icon: <DatabaseIcon className="size-4" />,
      },
    ],
  },
  {
    id: "docs",
    label: "Docs",
    description: "Guides and package references.",
    icon: <BookOpenIcon className="size-4" />,
    items: [
      {
        id: "guides",
        label: "Guides",
        href: "#guides",
        description: "Implementation notes.",
        icon: <BookOpenIcon className="size-4" />,
      },
      {
        id: "reference",
        label: "Reference",
        href: "#reference",
        description: "Public API documentation.",
        icon: <FileTextIcon className="size-4" />,
      },
    ],
  },
  {
    id: "team",
    label: "Team",
    description: "People and shared ownership.",
    icon: <UsersIcon className="size-4" />,
    items: [
      {
        id: "members",
        label: "Members",
        href: "#members",
        description: "Workspace member list.",
        icon: <UsersIcon className="size-4" />,
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    description: "Profile and preferences.",
    icon: <UserCircleIcon className="size-4" />,
    items: [
      {
        id: "profile",
        label: "Profile",
        href: "#profile",
        description: "Personal public profile.",
        icon: <UserCircleIcon className="size-4" />,
      },
      {
        id: "settings",
        label: "Settings",
        href: "#settings",
        description: "Workspace preferences.",
        icon: <SettingsIcon className="size-4" />,
      },
    ],
  },
] as const satisfies NavbarGroup[];

const manyNavigationGroups = [
  ...navigationGroups,
  {
    id: "messages",
    label: "Messages",
    description: "Conversations and support threads.",
    icon: <MessageCircleIcon className="size-4" />,
    items: [
      {
        id: "threads",
        label: "Threads",
        href: "#threads",
        description: "Open conversations.",
        icon: <MessageCircleIcon className="size-4" />,
      },
    ],
  },
] as const satisfies NavbarGroup[];

const meta = {
  title: "Components/Navigation/Mobile App Navigation",
  component: MobileAppNavigation,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  args: {
    brand: "Platform",
    groups: navigationGroups,
    activeItemId: "overview",
    onNavigate: fn(),
  },
  render: (args) => (
    <div className="min-h-[680px] bg-muted/30 p-4 pb-32 text-foreground">
      <div className="grid gap-4">
        <Badge className="w-fit">Mobile shell</Badge>
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold">Package operations</h1>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            The content area stays app-owned while the package provides mobile navigation chrome.
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/70 p-4 shadow-[var(--ui-shadow-surface)]">
          <p className="text-sm leading-6 text-muted-foreground">
            Scrollable product content can sit above the fixed bottom navigation.
          </p>
        </div>
      </div>
      <MobileAppNavigation {...args} />
    </div>
  ),
} satisfies Meta<typeof MobileAppNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThreeTabs: Story = {
  args: {
    maxTabs: 3,
  },
};

export const ManyGroups: Story = {
  args: {
    groups: manyNavigationGroups,
    menuDescription: "All available workspace destinations.",
  },
};

export const WithActions: Story = {
  args: {
    actionSlot: (
      <NavbarActions
        themeModeSwitch
        notificationMenu={{
          unreadCount: 2,
          items: [
            { id: "review", title: "Review requested", unread: true, meta: "Now" },
            { id: "message", title: "New workspace message", unread: true, meta: "1h" },
          ],
        }}
        accountMenu={{
          user: { name: "Mira Brandt", email: "mira@example.com", initials: "MB" },
          items: [
            { id: "profile", label: "Profile", icon: <UserCircleIcon className="size-4" /> },
            { id: "settings", label: "Settings", icon: <SettingsIcon className="size-4" /> },
            {
              id: "logout",
              label: "Sign out",
              destructive: true,
              icon: <LogOutIcon className="size-4" />,
            },
          ],
        }}
      />
    ),
    footerSlot: <Button variant="outline">Invite teammate</Button>,
  },
};

export const CustomRenderLink: Story = {
  args: {
    renderLink: ({
      children,
      className,
      href,
      onClick,
      placement,
      "aria-current": ariaCurrent,
    }) => (
      <a
        aria-current={ariaCurrent}
        data-router-link={placement}
        className={className}
        href={href ?? "#"}
        onClick={onClick}
      >
        {children}
      </a>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")[0]).toHaveAttribute("data-router-link", "tab");
  },
};

function ControlledDrawerDemo() {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="min-h-[680px] bg-muted/30 p-4 pb-32 text-foreground">
      <Button variant="outline" onClick={() => setOpen((value) => !value)}>
        Toggle menu
      </Button>
      <MobileAppNavigation
        brand={
          <span className="inline-flex items-center gap-2">
            <MenuIcon className="size-4" />
            Platform
          </span>
        }
        groups={navigationGroups}
        drawerOpen={open}
        onDrawerOpenChange={setOpen}
      />
    </div>
  );
}

export const ControlledDrawer: Story = {
  render: () => <ControlledDrawerDemo />,
};
