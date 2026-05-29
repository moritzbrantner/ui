import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { Button } from "../../index";
import { MOBILE_BREAKPOINT } from "../../hooks/use-mobile";
import {
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageShell,
  PageTitle,
  Navbar,
  NavbarActions,
  SectionGrid,
  Surface,
  SurfaceContent,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
  type NavbarGroup,
} from "../../shell";

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const groups: NavbarGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", href: "/overview", active: true },
      { id: "settings", label: "Settings", href: "/settings" },
    ],
  },
];

const manyGroups: NavbarGroup[] = [
  ...groups,
  {
    id: "docs",
    label: "Docs",
    items: [{ id: "guides", label: "Guides", href: "/guides" }],
  },
  {
    id: "data",
    label: "Data",
    items: [{ id: "tables", label: "Tables", href: "/tables" }],
  },
  {
    id: "account",
    label: "Account",
    items: [{ id: "profile", label: "Profile", href: "/profile" }],
  },
];

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: width < MOBILE_BREAKPOINT,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  setViewportWidth(1024);
});

describe("pattern layout and navigation", () => {
  test("renders app layout primitives with slots and classes", () => {
    render(
      <PageShell className="contract-page-shell" background="muted">
        <PageHeader>
          <div>
            <PageTitle>Component coverage</PageTitle>
            <PageDescription>Release-blocking surfaces are covered.</PageDescription>
          </div>
          <PageActions>
            <Button>Run checks</Button>
          </PageActions>
        </PageHeader>
        <PageContent>
          <SectionGrid columns="two">
            <Surface>
              <SurfaceHeader>
                <SurfaceTitle>Stable</SurfaceTitle>
                <SurfaceDescription>Primitive controls</SurfaceDescription>
              </SurfaceHeader>
              <SurfaceContent>74 components</SurfaceContent>
            </Surface>
          </SectionGrid>
        </PageContent>
      </PageShell>,
    );

    expect(
      screen.getByText("Component coverage").closest('[data-slot="page-shell"]')?.className,
    ).toContain("contract-page-shell");
    expect(
      screen.getByRole("button", { name: "Run checks" }).closest('[data-slot="page-actions"]')
        ?.className,
    ).toContain("w-full");
    expect(screen.getByRole("button", { name: "Run checks" })).toBeTruthy();
    expect(screen.getByText("74 components")).toBeTruthy();
  });

  test("navigates navbar items without owning app routing", async () => {
    const onNavigate = vi.fn();
    const renderLink = vi.fn(({ children, className, onClick, ...props }) => (
      <a {...props} className={className} href="#test" onClick={onClick}>
        {children}
      </a>
    ));

    render(
      <Navbar
        brand="Platform"
        groups={groups}
        defaultOpenGroupId="workspace"
        actionSlot={<NavbarActions themeModeSwitch />}
        onNavigate={onNavigate}
        renderLink={renderLink}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Workspace" }));
    fireEvent.click(await screen.findByRole("link", { name: /Settings/ }));

    await waitFor(() => expect(onNavigate).toHaveBeenCalledTimes(1));
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "settings" }),
      expect.objectContaining({ id: "workspace" }),
    );
    expect(renderLink).toHaveBeenCalled();
  });

  test("defaults navbar to the automatic responsive variant", () => {
    render(<Navbar brand="Platform" groups={groups} />);

    const nav = screen.getByRole("navigation", { name: "Primary navigation" });

    expect(nav.getAttribute("data-slot")).toBe("navbar");
    expect(nav.getAttribute("data-variant")).toBe("web");
  });

  test("auto variant resolves to mobile below the shared breakpoint", () => {
    setViewportWidth(MOBILE_BREAKPOINT - 1);

    render(<Navbar brand="Platform" groups={groups} />);

    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }).getAttribute("data-variant"),
    ).toBe("mobile");
  });

  test("navbar actions render only configured controls and login slots", () => {
    const { rerender } = render(<NavbarActions data-testid="actions" />);

    expect(screen.getByTestId("actions").getAttribute("data-slot")).toBe("navbar-actions");
    expect(screen.queryByRole("button", { name: /Language:/ })).toBeNull();
    expect(screen.queryByRole("switch", { name: "Color mode" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Notifications" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Open account menu" })).toBeNull();

    rerender(
      <NavbarActions
        languageSwitcher
        themeModeSwitch
        notificationMenu={{ items: [{ id: "notice", title: "Notice", unread: true }] }}
        accountMenu={{ user: { name: "Mira Brandt", initials: "MB" } }}
        loginAction={<Button>Log in</Button>}
      />,
    );

    expect(screen.getByRole("button", { name: /Language:/ })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Color mode" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Notifications, 1 unread" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open account menu" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Log in" })).toBeTruthy();
  });

  test("mobile navbars with more than three groups use a scrollable trigger row", () => {
    render(<Navbar brand="Platform" groups={manyGroups} variant="mobile" />);

    const trigger = screen.getByRole("button", { name: "Workspace" });
    const groupList = trigger.parentElement;

    expect(groupList?.className).toContain("overflow-x-auto");
    expect(groupList?.className).toContain("snap-x");
    expect(trigger.className).toContain("min-w-24");
  });
});
