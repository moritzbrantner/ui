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
  ContextMenuContent,
  ContextMenuItem,
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
  DropdownMenuContent,
  DropdownMenuItem,
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

    expect(document.querySelector('[data-slot="dialog-content"]')?.className).toContain(
      "contract-dialog",
    );
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
          </DropdownMenuContent>
        </DropdownMenu>
        <ContextMenu>
          <ContextMenuTrigger>
            <button type="button">Context target</button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={onContextSelect}>Duplicate</ContextMenuItem>
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
    fireEvent.click(await screen.findByRole("menuitem", { name: "Archive" }));
    expect(onDropdownSelect).toHaveBeenCalledTimes(1);

    fireEvent.contextMenu(screen.getByRole("button", { name: "Context target" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Duplicate" }));
    expect(onContextSelect).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole("menuitem", { name: "File" }), {
      key: "Enter",
      code: "Enter",
    });
    fireEvent.click(await screen.findByRole("menuitem", { name: "New file" }));
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

    expect(
      screen.getByText("Popover title").closest('[data-slot="popover-content"]')?.className,
    ).toContain("contract-popover");
    expect(screen.getByText("Hover preview").getAttribute("data-slot")).toBe("hover-card-content");
    expect(document.querySelector('[data-slot="tooltip-content"]')?.textContent).toContain(
      "Tooltip detail",
    );
  });
});
