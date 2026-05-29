import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, within } from "storybook/test";
import {
  BookOpenIcon,
  DatabaseIcon,
  FileTextIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageCircleIcon,
  SettingsIcon,
  UserCircleIcon,
  UserPlusIcon,
} from "lucide-react";

import { Button } from "../stable/button";
import { NavbarActions } from "./navbar-actions";
import { Navbar, type NavbarGroup } from "./navbar";

const navigationGroups = [
  {
    id: "discover",
    label: "Discover",
    eyebrow: "Public",
    description: "Open routes for visitors.",
    icon: <HomeIcon className="size-4" />,
    items: [
      {
        id: "about",
        label: "About",
        href: "#about",
        description: "Project overview and status.",
        icon: <BookOpenIcon className="size-4" />,
      },
      {
        id: "docs",
        label: "Docs",
        href: "#docs",
        description: "Published component references.",
        icon: <FileTextIcon className="size-4" />,
        meta: "New",
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    eyebrow: "Private",
    description: "Tools for package development.",
    icon: <LayoutDashboardIcon className="size-4" />,
    items: [
      {
        id: "components",
        label: "Components",
        href: "#components",
        description: "Reusable UI primitives and patterns.",
        icon: <DatabaseIcon className="size-4" />,
        active: true,
      },
      {
        id: "settings",
        label: "Settings",
        href: "#settings",
        description: "Workspace configuration.",
        icon: <SettingsIcon className="size-4" />,
      },
    ],
  },
] as const satisfies NavbarGroup[];

const manyNavigationGroups = [
  ...navigationGroups,
  {
    id: "learn",
    label: "Learn",
    eyebrow: "Guides",
    description: "Reference material and examples.",
    icon: <BookOpenIcon className="size-4" />,
    items: [
      {
        id: "tutorials",
        label: "Tutorials",
        href: "#tutorials",
        description: "Step-by-step implementation notes.",
        icon: <BookOpenIcon className="size-4" />,
      },
    ],
  },
  {
    id: "data",
    label: "Data",
    eyebrow: "Tables",
    description: "Reusable data surfaces.",
    icon: <DatabaseIcon className="size-4" />,
    items: [
      {
        id: "grid",
        label: "Data grid",
        href: "#grid",
        description: "Rows, columns, and selection.",
        icon: <DatabaseIcon className="size-4" />,
      },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    eyebrow: "Account",
    description: "Personal account surfaces.",
    icon: <UserCircleIcon className="size-4" />,
    items: [
      {
        id: "me",
        label: "My profile",
        href: "#me",
        description: "Public profile and preferences.",
        icon: <UserCircleIcon className="size-4" />,
      },
    ],
  },
] as const satisfies NavbarGroup[];

const meta = {
  title: "Components/Navigation/Navbar",
  component: Navbar,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "fullscreen",
    a11y: {
      test: "todo",
    },
  },
  args: {
    brand: "Platform",
    groups: navigationGroups,
    activeItemId: "components",
  },
  render: (args) => (
    <div className="min-h-[420px] bg-background p-6 text-foreground">
      <Navbar {...args} />
    </div>
  ),
} satisfies Meta<typeof Navbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Web: Story = {
  args: {
    variant: "web",
    defaultOpenGroupId: "workspace",
    actionSlot: (
      <NavbarActions
        languageSwitcher
        themeModeSwitch
        notificationMenu={{
          unreadCount: 2,
          items: [
            {
              id: "follow",
              title: "Jules followed you",
              description: "Open the profile page to review their public activity.",
              unread: true,
              meta: "2m",
              icon: <UserPlusIcon className="size-4" />,
            },
            {
              id: "message",
              title: "New workspace message",
              description: "The product team mentioned you in the launch thread.",
              unread: true,
              meta: "1h",
              icon: <MessageCircleIcon className="size-4" />,
            },
          ],
          onMarkAllRead: () => {},
        }}
        accountMenu={{
          user: {
            name: "Mira Brandt",
            email: "mira@example.com",
            initials: "MB",
          },
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
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = (await canvas.findAllByRole("button", { name: "Open account menu" })).find(
      (element) => {
        const styles = window.getComputedStyle(element);

        return styles.display !== "none" && styles.visibility !== "hidden";
      },
    );

    if (!trigger) {
      throw new Error("Expected a visible account menu trigger.");
    }

    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.click(trigger);

    const profileItems = await screen.findAllByRole("menuitem", { name: "Profile" });
    const accountMenu = profileItems[0]?.closest('[role="menu"]');

    await expect(profileItems.length).toBeGreaterThan(0);
    await expect(accountMenu).not.toBeNull();
    await expect(accountMenu).toHaveAttribute("data-state", "open");
    await expect(
      within(accountMenu as HTMLElement).getByText("mira@example.com"),
    ).toBeInTheDocument();
  },
};

export const PublicWithoutAuth: Story = {
  args: {
    variant: "web",
    defaultOpenGroupId: "discover",
    actionSlot: <NavbarActions languageSwitcher themeModeSwitch />,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /Language:/ })).toBeInTheDocument();
    await expect(canvas.getByRole("switch", { name: "Color mode" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Open account menu" })).toBeNull();
  },
};

export const LoggedOutWithLogin: Story = {
  args: {
    variant: "web",
    defaultOpenGroupId: "discover",
    actionSlot: (
      <NavbarActions
        languageSwitcher
        themeModeSwitch
        loginAction={<Button size="sm">Log in</Button>}
      />
    ),
  },
};

export const Minimal: Story = {
  args: {
    variant: "web",
    defaultOpenGroupId: null,
    actionSlot: null,
  },
};

export const Desktop: Story = {
  args: {
    variant: "desktop",
    defaultOpenGroupId: "workspace",
  },
};

export const Mobile: Story = {
  args: {
    variant: "mobile",
    defaultOpenGroupId: "workspace",
  },
};

export const MobileManyGroups: Story = {
  args: {
    variant: "mobile",
    groups: manyNavigationGroups,
    defaultOpenGroupId: "workspace",
    actionSlot: <NavbarActions loginAction={<Button>Log in</Button>} />,
  },
};

export const OpensSubmenu: Story = {
  args: {
    variant: "desktop",
    defaultOpenGroupId: null,
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /Discover/ });

    await userEvent.click(trigger);

    await expect(await screen.findByRole("link", { name: /About/ })).toBeInTheDocument();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
