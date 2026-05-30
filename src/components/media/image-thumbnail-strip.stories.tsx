import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ImageThumbnailStrip } from "./image-thumbnail-strip";
import type { MediaGalleryItem } from "./media-gallery-types";

const thumbnailItems: MediaGalleryItem[] = [
  {
    id: "desk",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%230ea5e9'/%3E%3Cpath d='M40 160h160v32H40z' fill='%23e0f2fe'/%3E%3C/svg%3E",
    alt: "Desk thumbnail",
    title: "Desk thumbnail",
  },
  {
    id: "chair",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23a855f7'/%3E%3Ccircle cx='120' cy='106' r='58' fill='%23f3e8ff' fill-opacity='.8'/%3E%3C/svg%3E",
    alt: "Chair thumbnail",
    title: "Chair thumbnail",
  },
  {
    id: "lamp",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23eab308'/%3E%3Cpath d='M96 48h48l36 80H60z' fill='%23fef9c3'/%3E%3C/svg%3E",
    alt: "Lamp thumbnail",
    title: "Lamp thumbnail",
  },
];

const meta = {
  title: "Components/Media/Image Thumbnail Strip",
  component: ImageThumbnailStrip,
  tags: ["autodocs", "test"],
  args: {
    items: thumbnailItems,
    showCount: true,
  },
} satisfies Meta<typeof ImageThumbnailStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvas, userEvent }) => {
    const chair = canvas.getByRole("option", { name: "Chair thumbnail" });

    await expect(chair).toBeVisible();
    await userEvent.click(chair);
    await expect(chair).toHaveAttribute("aria-selected", "true");
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    size: "lg",
  },
};
