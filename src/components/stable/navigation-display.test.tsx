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
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
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
    expect(screen.getByText("Panel content")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Overview" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "pagination" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Products" })).toBeTruthy();
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

    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getByText("0.8.0")).toBeTruthy();
    expect(screen.getByText("Coverage")).toBeTruthy();
    expect(screen.getByText("No results")).toBeTruthy();
    expect(screen.getByLabelText("Loading preview").getAttribute("data-slot")).toBe("skeleton");
    expect(screen.getByLabelText("Build progress").getAttribute("data-slot")).toBe("progress");
    expect(screen.getByLabelText("Package progress").getAttribute("data-slot")).toBe("loading-bar");
  });
});
