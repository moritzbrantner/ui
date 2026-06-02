import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FileIcon,
  HomeIcon,
  LayoutDashboardIcon,
  MoreHorizontalIcon,
  SearchIcon,
  ShieldAlertIcon,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "./command";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./context-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "./menubar";
import {
  MobileSlide,
  MobileSlideBody,
  MobileSlideClose,
  MobileSlideContent,
  MobileSlideDescription,
  MobileSlideFooter,
  MobileSlideHeader,
  MobileSlideTitle,
  MobileSlideTrigger,
} from "./mobile-slide";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar";
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

function PrimitiveOverlaysPreview() {
  return (
    <div className="grid w-full max-w-[1040px] min-w-0 gap-4 p-4 md:grid-cols-2">
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">alert-dialog</Badge>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <ShieldAlertIcon />
              Open review
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <ShieldAlertIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>Publish package?</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm the package catalog before release.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Publish</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">command</Badge>
        <Command className="h-48">
          <CommandInput placeholder="Search commands" />
          <CommandList>
            <CommandEmpty>No command found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem>
                <SearchIcon />
                Search packages
                <CommandShortcut>SP</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">menus</Badge>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-20 items-center justify-center border border-dashed border-border/70 bg-muted/35">
            Right click menu target
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>View</ContextMenuLabel>
            <ContextMenuItem>
              Refresh <ContextMenuShortcut>R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuCheckboxItem checked>Show grid</ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuRadioGroup value="comfortable">
              <ContextMenuRadioItem value="comfortable">Comfortable</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Package</MenubarLabel>
              <MenubarItem>
                New <MenubarShortcut>N</MenubarShortcut>
              </MenubarItem>
              <MenubarCheckboxItem checked>Autosave</MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarRadioGroup value="preview">
                <MenubarRadioItem value="preview">Preview</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">drawers</Badge>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer preview</DrawerTitle>
              <DrawerDescription>Bottom drawer package details.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <MobileSlide>
          <MobileSlideTrigger asChild>
            <Button variant="outline">Open slide</Button>
          </MobileSlideTrigger>
          <MobileSlideContent showCloseButton>
            <MobileSlideHeader>
              <MobileSlideTitle>Filters</MobileSlideTitle>
              <MobileSlideDescription>Review queue controls.</MobileSlideDescription>
            </MobileSlideHeader>
            <MobileSlideBody>Only show blockers.</MobileSlideBody>
            <MobileSlideFooter>
              <MobileSlideClose asChild>
                <Button>Apply</Button>
              </MobileSlideClose>
            </MobileSlideFooter>
          </MobileSlideContent>
        </MobileSlide>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">navigation</Badge>
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Packages</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#">
                  <HomeIcon />
                  Overview
                </NavigationMenuLink>
                <NavigationMenuLink href="#">
                  <FileIcon />
                  Releases
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Package details</PopoverTitle>
              <PopoverDescription>Popover content for compact controls.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline">Hover package</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <strong>@moritzbrantner/ui</strong>
            <p className="mt-1 text-muted-foreground">Shared primitives for platform packages.</p>
          </HoverCardContent>
        </HoverCard>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">sidebar</Badge>
        <SidebarProvider className="h-56 min-h-0 overflow-hidden border border-border/60">
          <Sidebar collapsible="none" className="w-52">
            <SidebarHeader>
              <SidebarInput placeholder="Search" />
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Packages</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <LayoutDashboardIcon />
                        <span>Overview</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction aria-label="More">
                        <MoreHorizontalIcon />
                      </SidebarMenuAction>
                      <SidebarMenuBadge>3</SidebarMenuBadge>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton showIcon />
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            <span>Primitives</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarTrigger />
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="p-4">
            <Badge variant="outline" className="w-fit">
              Inset
            </Badge>
          </SidebarInset>
        </SidebarProvider>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">toast</Badge>
        <ToastProvider>
          <Toast open>
            <div className="grid gap-1">
              <ToastTitle>Primitives mounted</ToastTitle>
              <ToastDescription>Toast primitives render in Storybook.</ToastDescription>
            </div>
            <ToastAction altText="Open package">Open</ToastAction>
          </Toast>
          <ToastViewport className="relative top-auto right-auto max-w-none p-0" />
        </ToastProvider>
      </section>
    </div>
  );
}

const meta = {
  title: "Components/Stable/Primitive Overlays",
  component: PrimitiveOverlaysPreview,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof PrimitiveOverlaysPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
