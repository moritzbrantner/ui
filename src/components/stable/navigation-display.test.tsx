import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test } from "vitest";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
  Empty,
  EmptyDescription,
  EmptyTitle,
  LoadingBar,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Progress,
  Skeleton,
  Stat,
  StatDelta,
  StatDescription,
  StatGroup,
  StatLabel,
  StatValue,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../index";

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("stable navigation and display components", () => {
  test("renders accordion, tabs, breadcrumb, pagination, and navigation menu", () => {
    render(
      <div>
        <Accordion type="single" collapsible className="contract-accordion">
          <AccordionItem value="item">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent>Panel content</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview panel</TabsContent>
          <TabsContent value="metrics">Metrics panel</TabsContent>
        </Tabs>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Components</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <NavigationMenu defaultValue="products" viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/ui">UI package</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>,
    );

    expect(screen.getByText("Details").closest('[data-slot="accordion"]')?.className).toContain(
      "contract-accordion",
    );
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    const accordionContent = screen
      .getByText("Panel content")
      .closest('[data-slot="accordion-content"]');
    expect(accordionContent?.getAttribute("data-state")).toBe("open");
    expect(accordionContent?.className).toContain("data-[state=open]:animate-accordion-down");
    expect(accordionContent?.className).not.toContain("data-open");
    expect(screen.getByText("Panel content").className).not.toContain(
      "h-(--radix-accordion-content-height)",
    );

    const activeTab = screen.getByRole("tab", { name: "Overview" });
    expect(activeTab.getAttribute("data-state")).toBe("active");
    expect(activeTab.className).toContain("data-[state=active]:bg-background");
    expect(activeTab.className).not.toContain("data-active");

    expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Home" }).className).toContain("min-h-10");
    expect(screen.getByRole("link", { name: "Home" }).className).toContain("min-w-10");
    expect(screen.getByRole("navigation", { name: "pagination" })).toBeTruthy();
    const navigationTrigger = screen.getByRole("button", { name: "Products" });
    expect(navigationTrigger.getAttribute("data-state")).toBe("open");
    expect(navigationTrigger.className).toContain("data-[state=open]");
    expect(navigationTrigger.className).toContain("gap-1");
    expect(navigationTrigger.textContent).toBe("Products");
    expect(navigationTrigger.className).not.toContain("data-popup-open");
    expect(navigationTrigger.className).not.toContain("data-open");

    const navigationContent = document.querySelector('[data-slot="navigation-menu-content"]');
    expect(navigationContent?.getAttribute("data-state")).toBe("open");
    expect(navigationContent?.className).toContain("data-[state=open]");
    expect(navigationContent?.className).not.toContain("data-open");
  });

  test("renders structured data display primitives", () => {
    render(
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>UI</TableCell>
              <TableCell>Stable</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <TableContainer data-testid="custom-table-container">
          <table>
            <tbody>
              <tr>
                <td>Nested table</td>
              </tr>
            </tbody>
          </table>
        </TableContainer>
        <DescriptionList>
          <DescriptionListItem>
            <DescriptionListTerm>Version</DescriptionListTerm>
            <DescriptionListDetail>0.8.0</DescriptionListDetail>
          </DescriptionListItem>
        </DescriptionList>
        <StatGroup>
          <Stat>
            <StatLabel>Coverage</StatLabel>
            <StatValue>45%</StatValue>
            <StatDelta>+10%</StatDelta>
            <StatDescription>Initial release-blocking target</StatDescription>
          </Stat>
        </StatGroup>
        <Empty>
          <EmptyTitle>No results</EmptyTitle>
          <EmptyDescription>Try another filter.</EmptyDescription>
        </Empty>
        <Skeleton aria-label="Loading preview" />
        <Progress aria-label="Build progress" value={55} />
        <LoadingBar aria-label="Package progress" value={70} />
      </div>,
    );

    expect(screen.getAllByRole("table")).toHaveLength(2);
    expect(screen.getByTestId("custom-table-container").getAttribute("data-slot")).toBe(
      "table-container",
    );
    expect(screen.getByText("0.8.0")).toBeTruthy();
    expect(screen.getByText("Coverage")).toBeTruthy();
    expect(screen.getByText("No results")).toBeTruthy();
    expect(screen.getByLabelText("Loading preview").getAttribute("data-slot")).toBe("skeleton");
    expect(screen.getByRole("status", { name: "Loading preview" })).toBeTruthy();
    expect(screen.getByLabelText("Loading preview").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByLabelText("Build progress").getAttribute("data-slot")).toBe("progress");
    expect(screen.getByLabelText("Package progress").getAttribute("data-slot")).toBe("loading-bar");
  });
});
