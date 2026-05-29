import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import {
  Button,
} from "../../index";
import {
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageShell,
  PageTitle,
  PlatformNavbar,
  PlatformNavbarActions,
  SectionGrid,
  Surface,
  SurfaceContent,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
  type PlatformNavbarGroup,
} from "../../shell";

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const groups: PlatformNavbarGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", href: "/overview", active: true },
      { id: "settings", label: "Settings", href: "/settings" },
    ],
  },
];

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

  test("navigates platform navbar items without owning app routing", async () => {
    const onNavigate = vi.fn();
    const renderLink = vi.fn(({ children, className, onClick, ...props }) => (
      <a {...props} className={className} href="#test" onClick={onClick}>
        {children}
      </a>
    ));

    render(
      <PlatformNavbar
        brand="Platform"
        groups={groups}
        defaultOpenGroupId="workspace"
        actionSlot={<PlatformNavbarActions themeModeSwitch />}
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

  test("defaults platform navbar to the automatic responsive variant", () => {
    render(<PlatformNavbar brand="Platform" groups={groups} />);

    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }).getAttribute("data-variant"),
    ).toBe("web");
  });
});
