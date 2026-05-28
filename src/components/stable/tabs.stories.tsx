import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[min(560px,calc(100vw-2rem))]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview content</TabsContent>
      <TabsContent value="details">Details content</TabsContent>
    </Tabs>
  ),
  play: async ({ canvas, userEvent }) => {
    const detailsTab = canvas.getByRole("tab", { name: "Details" });

    await userEvent.click(detailsTab);

    await expect(detailsTab).toHaveAttribute("data-state", "active");
    await expect(detailsTab.className).toContain("data-[state=active]:bg-background");
    await expect(canvas.getByText("Details content")).toBeVisible();
  },
};
