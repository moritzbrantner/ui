import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ImageCarousel } from "./image-carousel";
import type { MediaGalleryItem } from "./media-gallery-types";

const galleryItems: MediaGalleryItem[] = [
  {
    id: "studio",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 960 540'%3E%3Crect width='960' height='540' fill='%230ea5e9'/%3E%3Cpath d='M120 420 340 190l160 130 120-90 220 190z' fill='%23f8fafc' fill-opacity='.78'/%3E%3C/svg%3E",
    alt: "Studio workspace",
    title: "Studio workspace",
    caption: "Wide hero frame",
  },
  {
    id: "detail",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 960 540'%3E%3Crect width='960' height='540' fill='%23f97316'/%3E%3Ccircle cx='480' cy='270' r='148' fill='%23fff7ed' fill-opacity='.8'/%3E%3C/svg%3E",
    alt: "Object detail",
    title: "Object detail",
    caption: "Centered product study",
  },
  {
    id: "field",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 960 540'%3E%3Crect width='960' height='540' fill='%2322c55e'/%3E%3Cpath d='M0 370h960v170H0z' fill='%23166534' fill-opacity='.46'/%3E%3Ccircle cx='780' cy='130' r='72' fill='%23fef9c3'/%3E%3C/svg%3E",
    alt: "Outdoor scene",
    title: "Outdoor scene",
    caption: "Campaign backdrop",
  },
];

const meta = {
  title: "Components/Media/Image Carousel",
  component: ImageCarousel,
  tags: ["autodocs", "test"],
  args: {
    items: galleryItems,
  },
  decorators: [
    (Story) => (
      <div className="w-[calc(100vw-2rem)] max-w-[520px] min-w-0 overflow-hidden">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByAltText("Studio workspace")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Next image" }));
    await expect(canvas.getByRole("button", { name: /Object detail/ })).toHaveAttribute(
      "data-active",
      "true",
    );
  },
};

export const Contain: Story = {
  args: {
    layout: "contain",
  },
};
