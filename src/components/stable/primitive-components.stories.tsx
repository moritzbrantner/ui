import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import {
  FileIcon,
  FolderIcon,
  Grid2X2Icon,
  HomeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  ListFilterIcon,
  MoreHorizontalIcon,
  SearchIcon,
  ShieldAlertIcon,
  StarIcon,
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
import { AspectRatio } from "./aspect-ratio";
import { Badge } from "./badge";
import { Button } from "./button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import { Checkbox } from "./checkbox";
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
} from "./code-block";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
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
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
} from "./description-list";
import { DirectionProvider } from "./direction";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Input } from "./input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./item";
import { Kbd, KbdGroup } from "./kbd";
import { Label } from "./label";
import { LoadingBar } from "./loading-bar";
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
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { Progress } from "./progress";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";
import { ScrollArea } from "./scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Separator } from "./separator";
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
import { Skeleton } from "./skeleton";
import { Slider } from "./slider";
import { Stat, StatDelta, StatGroup, StatLabel, StatValue } from "./stat";
import { Switch } from "./switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Textarea } from "./textarea";
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { Toggle } from "./toggle";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { ToggleSetting } from "./toggle-setting";

const primitiveComponents = [
  "alert-dialog",
  "aspect-ratio",
  "button-group",
  "carousel",
  "checkbox",
  "code-block",
  "collapsible",
  "command",
  "context-menu",
  "description-list",
  "direction",
  "drawer",
  "empty",
  "field",
  "hover-card",
  "input",
  "input-group",
  "input-otp",
  "item",
  "kbd",
  "label",
  "loading-bar",
  "menubar",
  "mobile-slide",
  "native-select",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sidebar",
  "skeleton",
  "slider",
  "stat",
  "switch",
  "table",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "toggle-setting",
] as const;

type PrimitiveSectionProps = {
  id: (typeof primitiveComponents)[number];
  title: string;
  children: React.ReactNode;
};

function PrimitiveSection({ id, title, children }: PrimitiveSectionProps) {
  return (
    <section
      data-testid={`primitive-${id}`}
      className="grid min-h-40 content-start gap-3 border border-border/60 bg-card/55 p-4 text-sm shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <Badge variant="outline">{id}</Badge>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function PrimitiveComponentsPreview() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PrimitiveSection id="alert-dialog" title="Alert Dialog">
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
        </PrimitiveSection>

        <PrimitiveSection id="aspect-ratio" title="Aspect Ratio">
          <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted">
            <div className="flex size-full items-center justify-center">Preview surface</div>
          </AspectRatio>
        </PrimitiveSection>

        <PrimitiveSection id="button-group" title="Button Group">
          <ButtonGroup>
            <Button variant="outline">Preview</Button>
            <ButtonGroupSeparator />
            <ButtonGroupText>
              <Kbd>P</Kbd>
            </ButtonGroupText>
          </ButtonGroup>
        </PrimitiveSection>

        <PrimitiveSection id="carousel" title="Carousel">
          <Carousel className="mx-10">
            <CarouselContent>
              {[1, 2, 3].map((item) => (
                <CarouselItem key={item}>
                  <div className="flex h-24 items-center justify-center border border-border/60 bg-muted/40">
                    Slide {item}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </PrimitiveSection>

        <PrimitiveSection id="checkbox" title="Checkbox">
          <div className="flex items-center gap-3">
            <Checkbox id="primitive-checkbox" defaultChecked />
            <Label htmlFor="primitive-checkbox">Include in release</Label>
          </div>
        </PrimitiveSection>

        <PrimitiveSection id="code-block" title="Code Block">
          <CodeBlock>
            <CodeBlockHeader>
              <CodeBlockTitle>package.ts</CodeBlockTitle>
            </CodeBlockHeader>
            <CodeBlockContent>
              <CodeBlockCode>export const ready = true;</CodeBlockCode>
            </CodeBlockContent>
          </CodeBlock>
        </PrimitiveSection>

        <PrimitiveSection id="collapsible" title="Collapsible">
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button variant="outline">Toggle details</Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 text-muted-foreground">
              Package details render inside the local story.
            </CollapsibleContent>
          </Collapsible>
        </PrimitiveSection>

        <PrimitiveSection id="command" title="Command">
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
        </PrimitiveSection>

        <PrimitiveSection id="context-menu" title="Context Menu">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-24 items-center justify-center border border-dashed border-border/70 bg-muted/35">
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
        </PrimitiveSection>

        <PrimitiveSection id="description-list" title="Description List">
          <DescriptionList>
            <DescriptionListItem>
              <DescriptionListTerm>Status</DescriptionListTerm>
              <DescriptionListDetail>Ready</DescriptionListDetail>
            </DescriptionListItem>
          </DescriptionList>
        </PrimitiveSection>

        <PrimitiveSection id="direction" title="Direction">
          <DirectionProvider dir="rtl">
            <div dir="rtl" className="border border-border/60 bg-muted/35 p-3">
              RTL provider preview
            </div>
          </DirectionProvider>
        </PrimitiveSection>

        <PrimitiveSection id="drawer" title="Drawer">
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
        </PrimitiveSection>

        <PrimitiveSection id="empty" title="Empty">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No packages queued</EmptyTitle>
              <EmptyDescription>New packages will appear here.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm">Create package</Button>
            </EmptyContent>
          </Empty>
        </PrimitiveSection>

        <PrimitiveSection id="field" title="Field">
          <FieldSet>
            <FieldLegend>Package metadata</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="primitive-field">Package name</FieldLabel>
                <Input id="primitive-field" defaultValue="@moritzbrantner/ui" />
                <FieldDescription>Used for package publishing.</FieldDescription>
              </Field>
              <FieldSeparator>or</FieldSeparator>
              <Field orientation="horizontal">
                <Checkbox id="primitive-field-check" aria-label="Enable preview" />
                <FieldContent>
                  <FieldTitle>Enable preview</FieldTitle>
                  <FieldDescription>Show component previews in docs.</FieldDescription>
                </FieldContent>
              </Field>
              <FieldError>Example validation message.</FieldError>
            </FieldGroup>
          </FieldSet>
        </PrimitiveSection>

        <PrimitiveSection id="hover-card" title="Hover Card">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline">Hover package</Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <strong>@moritzbrantner/ui</strong>
              <p className="mt-1 text-muted-foreground">Shared primitives for platform packages.</p>
            </HoverCardContent>
          </HoverCard>
        </PrimitiveSection>

        <PrimitiveSection id="input" title="Input">
          <Input aria-label="Package input" defaultValue="@moritzbrantner/ui" />
        </PrimitiveSection>

        <PrimitiveSection id="input-group" title="Input Group">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput aria-label="Search input group" placeholder="Search" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <Kbd>/</Kbd>
              </InputGroupText>
              <InputGroupButton size="xs">Go</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup className="mt-3">
            <InputGroupTextarea aria-label="Input group textarea" placeholder="Notes" />
          </InputGroup>
        </PrimitiveSection>

        <PrimitiveSection id="input-otp" title="Input OTP">
          <InputOTP aria-label="Package verification code" maxLength={6} value="123456">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </PrimitiveSection>

        <PrimitiveSection id="item" title="Item">
          <ItemGroup>
            <Item variant="outline" role="listitem">
              <ItemMedia variant="icon">
                <FolderIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>UI package</ItemTitle>
                <ItemDescription>Reusable platform primitives.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="sm" variant="outline">
                  Open
                </Button>
              </ItemActions>
              <ItemFooter>
                <Badge variant="secondary">Ready</Badge>
              </ItemFooter>
            </Item>
            <ItemSeparator />
          </ItemGroup>
        </PrimitiveSection>

        <PrimitiveSection id="kbd" title="Kbd">
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>B</Kbd>
          </KbdGroup>
        </PrimitiveSection>

        <PrimitiveSection id="label" title="Label">
          <div className="grid gap-2">
            <Label htmlFor="primitive-label">Release channel</Label>
            <Input id="primitive-label" defaultValue="stable" />
          </div>
        </PrimitiveSection>

        <PrimitiveSection id="menubar" title="Menubar">
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
        </PrimitiveSection>

        <PrimitiveSection id="mobile-slide" title="Mobile Slide">
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
        </PrimitiveSection>

        <PrimitiveSection id="native-select" title="Native Select">
          <NativeSelect defaultValue="ui" aria-label="Package native select">
            <NativeSelectOptGroup label="Packages">
              <NativeSelectOption value="ui">UI</NativeSelectOption>
              <NativeSelectOption value="maps">Maps</NativeSelectOption>
            </NativeSelectOptGroup>
          </NativeSelect>
        </PrimitiveSection>

        <PrimitiveSection id="navigation-menu" title="Navigation Menu">
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
        </PrimitiveSection>

        <PrimitiveSection id="pagination" title="Pagination">
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
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </PrimitiveSection>

        <PrimitiveSection id="popover" title="Popover">
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
        </PrimitiveSection>

        <PrimitiveSection id="progress" title="Progress">
          <Progress aria-label="Primitive completion" value={68} />
        </PrimitiveSection>

        <PrimitiveSection id="loading-bar" title="Loading Bar">
          <div className="grid gap-3">
            <LoadingBar value={72} label="Package upload" showValue />
            <LoadingBar indeterminate label="Package analysis" size="sm" />
          </div>
        </PrimitiveSection>

        <PrimitiveSection id="radio-group" title="Radio Group">
          <RadioGroup defaultValue="stable">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="radio-stable" value="stable" />
              <Label htmlFor="radio-stable">Stable</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="radio-preview" value="preview" />
              <Label htmlFor="radio-preview">Preview</Label>
            </div>
          </RadioGroup>
        </PrimitiveSection>

        <PrimitiveSection id="resizable" title="Resizable">
          <ResizablePanelGroup orientation="horizontal" className="h-28 border border-border/60">
            <ResizablePanel defaultSize="55%" className="grid place-items-center">
              List
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="45%" className="grid place-items-center">
              Detail
            </ResizablePanel>
          </ResizablePanelGroup>
        </PrimitiveSection>

        <PrimitiveSection id="scroll-area" title="Scroll Area">
          <ScrollArea className="h-28 border border-border/60 p-3">
            <div className="grid gap-2">
              {Array.from({ length: 8 }, (_, index) => (
                <Button key={index} size="sm" variant="ghost" className="justify-start">
                  Package row {index + 1}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </PrimitiveSection>

        <PrimitiveSection id="select" title="Select">
          <Select defaultValue="ui">
            <SelectTrigger aria-label="Package select">
              <SelectValue placeholder="Select package" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Packages</SelectLabel>
                <SelectItem value="ui">UI</SelectItem>
                <SelectSeparator />
                <SelectItem value="maps">Maps</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </PrimitiveSection>

        <PrimitiveSection id="separator" title="Separator">
          <div>
            <span>Above</span>
            <Separator className="my-3" />
            <span>Below</span>
          </div>
        </PrimitiveSection>

        <PrimitiveSection id="sidebar" title="Sidebar">
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
                        <SidebarMenuButton>
                          <Grid2X2Icon />
                          <span>Components</span>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="#">
                              <span>Primitives</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuSkeleton showIcon />
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
        </PrimitiveSection>

        <PrimitiveSection id="skeleton" title="Skeleton">
          <div className="grid gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </PrimitiveSection>

        <PrimitiveSection id="slider" title="Slider">
          <Slider defaultValue={[30, 70]} />
        </PrimitiveSection>

        <PrimitiveSection id="stat" title="Stat">
          <StatGroup>
            <Stat>
              <StatLabel>Latency</StatLabel>
              <StatValue>42ms</StatValue>
              <StatDelta variant="positive">12% faster</StatDelta>
            </Stat>
          </StatGroup>
        </PrimitiveSection>

        <PrimitiveSection id="switch" title="Switch">
          <div className="flex items-center gap-3">
            <Switch id="primitive-switch" defaultChecked />
            <Label htmlFor="primitive-switch">Publish notifications</Label>
          </div>
        </PrimitiveSection>

        <PrimitiveSection id="table" title="Table">
          <Table>
            <TableCaption>Package release table.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>UI</TableCell>
                <TableCell>Ready</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>1</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </PrimitiveSection>

        <PrimitiveSection id="textarea" title="Textarea">
          <Textarea aria-label="Package notes" defaultValue="Check Storybook before release." />
        </PrimitiveSection>

        <PrimitiveSection id="toast" title="Toast">
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
        </PrimitiveSection>

        <PrimitiveSection id="toggle" title="Toggle">
          <Toggle defaultPressed aria-label="Toggle starred">
            <StarIcon />
            Starred
          </Toggle>
        </PrimitiveSection>

        <PrimitiveSection id="toggle-group" title="Toggle Group">
          <ToggleGroup type="multiple" defaultValue={["grid"]}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid2X2Icon />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <ListFilterIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </PrimitiveSection>

        <PrimitiveSection id="toggle-setting" title="Toggle Setting">
          <ToggleSetting
            title="Notify reviewers"
            description="Send an update when package status changes."
            defaultChecked
          />
        </PrimitiveSection>
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Stable/Primitive Components",
  component: PrimitiveComponentsPreview,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PrimitiveComponentsPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  play: async ({ canvas }) => {
    for (const component of primitiveComponents) {
      await expect(canvas.getByTestId(`primitive-${component}`)).toBeVisible();
    }
  },
};
