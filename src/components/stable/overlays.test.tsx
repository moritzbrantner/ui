import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../index";

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function expectOpenState(element: Element | null) {
  expect(element?.getAttribute("data-state")).toBe("open");
}

function expectStateSelectorClass(element: Element | null, selector = "data-[state=open]") {
  const className = element?.getAttribute("class") ?? "";

  expect(className).toContain(selector);
  expect(className).not.toContain("data-open");
  expect(className).not.toContain("data-closed");
}

function expectNoStaleStateSelectors(element: Element | null) {
  const className = element?.getAttribute("class") ?? "";

  expect(className).not.toContain("data-open");
  expect(className).not.toContain("data-closed");
}

describe("stable overlays", () => {
  test("renders dialog, alert dialog, sheet, and drawer content with accessible names", () => {
    render(
      <div>
        <Dialog open>
          <DialogContent className="contract-dialog">
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription>Dialog description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete item</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Sheet open>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet title</SheetTitle>
              <SheetDescription>Sheet description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Drawer open>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer title</DrawerTitle>
              <DrawerDescription>Drawer description</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </div>,
    );

    const dialogOverlay = document.querySelector('[data-slot="dialog-overlay"]');
    const dialogContent = document.querySelector('[data-slot="dialog-content"]');
    const alertDialogOverlay = document.querySelector('[data-slot="alert-dialog-overlay"]');
    const alertDialogContent = document.querySelector('[data-slot="alert-dialog-content"]');
    const sheetOverlay = document.querySelector('[data-slot="sheet-overlay"]');
    const sheetContent = document.querySelector('[data-slot="sheet-content"]');
    const drawerOverlay = document.querySelector('[data-slot="drawer-overlay"]');
    const drawerContent = document.querySelector('[data-slot="drawer-content"]');

    expect(dialogContent?.className).toContain("contract-dialog");
    for (const element of [
      dialogOverlay,
      dialogContent,
      alertDialogOverlay,
      alertDialogContent,
      sheetOverlay,
      sheetContent,
      drawerOverlay,
      drawerContent,
    ]) {
      expectOpenState(element);
      expectNoStaleStateSelectors(element);
    }

    for (const element of [
      dialogOverlay,
      dialogContent,
      alertDialogOverlay,
      alertDialogContent,
      sheetOverlay,
      sheetContent,
      drawerOverlay,
    ]) {
      expectStateSelectorClass(element);
    }

    expect(screen.getByText("Dialog title")).toBeTruthy();
    expect(screen.getByText("Delete item")).toBeTruthy();
    expect(screen.getByText("Sheet title")).toBeTruthy();
    expect(screen.getByText("Drawer title")).toBeTruthy();
  });

  test("opens menu overlays and calls item callbacks", async () => {
    const onDropdownSelect = vi.fn();
    const onContextSelect = vi.fn();
    const onMenubarSelect = vi.fn();

    render(
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onDropdownSelect}>Archive</DropdownMenuItem>
            <DropdownMenuCheckboxItem checked>Show grid</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="comfortable">
              <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ContextMenu>
          <ContextMenuTrigger>
            <button type="button">Context target</button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={onContextSelect}>Duplicate</ContextMenuItem>
            <ContextMenuCheckboxItem checked>Show guides</ContextMenuCheckboxItem>
            <ContextMenuRadioGroup value="compact">
              <ContextMenuRadioItem value="compact">Compact</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={onMenubarSelect}>New file</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Open menu" }), {
      key: "Enter",
      code: "Enter",
    });
    const dropdownItem = await screen.findByRole("menuitem", { name: "Archive" });
    const dropdownContent = document.querySelector('[data-slot="dropdown-menu-content"]');
    expectOpenState(dropdownContent);
    expectStateSelectorClass(dropdownContent);
    expect(
      document.querySelector('[data-slot="dropdown-menu-checkbox-item"]')?.className,
    ).toContain("pl-8");
    expect(
      document.querySelector('[data-slot="dropdown-menu-checkbox-item-indicator"]')?.className,
    ).toContain("left-2");
    expect(
      document.querySelector('[data-slot="dropdown-menu-radio-item-indicator"]')?.className,
    ).toContain("left-2");
    fireEvent.click(dropdownItem);
    expect(onDropdownSelect).toHaveBeenCalledTimes(1);

    fireEvent.contextMenu(screen.getByRole("button", { name: "Context target" }));
    const contextItem = await screen.findByRole("menuitem", { name: "Duplicate" });
    const contextContent = document.querySelector('[data-slot="context-menu-content"]');
    expectOpenState(contextContent);
    expectStateSelectorClass(contextContent);
    expect(document.querySelector('[data-slot="context-menu-checkbox-item"]')?.className).toContain(
      "pl-8",
    );
    expect(
      document.querySelector('[data-slot="context-menu-checkbox-item"] span')?.className,
    ).toContain("left-2");
    expect(
      document.querySelector('[data-slot="context-menu-radio-item"] span')?.className,
    ).toContain("left-2");
    fireEvent.click(contextItem);
    expect(onContextSelect).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole("menuitem", { name: "File" }), {
      key: "Enter",
      code: "Enter",
    });
    const menubarItem = await screen.findByRole("menuitem", { name: "New file" });
    const menubarContent = document.querySelector('[data-slot="menubar-content"]');
    expectOpenState(menubarContent);
    expectStateSelectorClass(menubarContent);
    fireEvent.click(menubarItem);
    expect(onMenubarSelect).toHaveBeenCalledTimes(1);
  });

  test("renders popover, hover card, and tooltip content slots", () => {
    render(
      <TooltipProvider>
        <Popover open>
          <PopoverTrigger asChild>
            <Button>Open popover</Button>
          </PopoverTrigger>
          <PopoverContent className="contract-popover">
            <PopoverHeader>
              <PopoverTitle>Popover title</PopoverTitle>
              <PopoverDescription>Popover detail</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
        <HoverCard open>
          <HoverCardTrigger asChild>
            <Button>Preview person</Button>
          </HoverCardTrigger>
          <HoverCardContent forceMount>Hover preview</HoverCardContent>
        </HoverCard>
        <Tooltip open>
          <TooltipTrigger asChild>
            <Button>Explain action</Button>
          </TooltipTrigger>
          <TooltipContent forceMount>Tooltip detail</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const popoverContent = screen
      .getByText("Popover title")
      .closest('[data-slot="popover-content"]');
    const hoverCardContent = screen
      .getByText("Hover preview")
      .closest('[data-slot="hover-card-content"]');
    const tooltipContent = document.querySelector('[data-slot="tooltip-content"]');

    expect(popoverContent?.className).toContain("contract-popover");
    expectOpenState(popoverContent);
    expectStateSelectorClass(popoverContent);
    expectOpenState(hoverCardContent);
    expectStateSelectorClass(hoverCardContent);
    expect(["delayed-open", "instant-open", "open"]).toContain(
      tooltipContent?.getAttribute("data-state"),
    );
    expectStateSelectorClass(tooltipContent, "data-[state=delayed-open]");
    expect(tooltipContent?.textContent).toContain("Tooltip detail");
  });
});
