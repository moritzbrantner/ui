import type { Meta, StoryObj } from "@storybook/react-vite";
import { FolderIcon, InboxIcon } from "lucide-react";

import { AspectRatio } from "./aspect-ratio";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
} from "./code-block";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import {
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
} from "./description-list";
import { DirectionProvider } from "./direction";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";
import { Stat, StatDelta, StatGroup, StatLabel, StatValue } from "./stat";

function PrimitiveLayoutPreview() {
  return (
    <div className="grid w-full max-w-[920px] min-w-0 gap-4 p-4 md:grid-cols-2">
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">aspect-ratio</Badge>
        <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted">
          <div className="flex size-full items-center justify-center">Preview surface</div>
        </AspectRatio>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">carousel</Badge>
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
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">content</Badge>
        <CodeBlock>
          <CodeBlockHeader>
            <CodeBlockTitle>package.ts</CodeBlockTitle>
          </CodeBlockHeader>
          <CodeBlockContent>
            <CodeBlockCode>export const ready = true;</CodeBlockCode>
          </CodeBlockContent>
        </CodeBlock>
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button variant="outline">Toggle details</Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 text-muted-foreground">
            Package details render inside the local story.
          </CollapsibleContent>
        </Collapsible>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">data layout</Badge>
        <DescriptionList>
          <DescriptionListItem>
            <DescriptionListTerm>Status</DescriptionListTerm>
            <DescriptionListDetail>Ready</DescriptionListDetail>
          </DescriptionListItem>
        </DescriptionList>
        <DirectionProvider dir="rtl">
          <div dir="rtl" className="border border-border/60 bg-muted/35 p-3">
            RTL provider preview
          </div>
        </DirectionProvider>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">empty</Badge>
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
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">item</Badge>
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
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">resizable</Badge>
        <ResizablePanelGroup orientation="horizontal" className="h-28 border border-border/60">
          <ResizablePanel defaultSize={55} className="grid place-items-center">
            List
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={45} className="grid place-items-center">
            Detail
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">stat</Badge>
        <StatGroup>
          <Stat>
            <StatLabel>Latency</StatLabel>
            <StatValue>42ms</StatValue>
            <StatDelta variant="positive">12% faster</StatDelta>
          </Stat>
        </StatGroup>
      </section>
    </div>
  );
}

const meta = {
  title: "Components/Stable/Primitive Layout",
  component: PrimitiveLayoutPreview,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof PrimitiveLayoutPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
