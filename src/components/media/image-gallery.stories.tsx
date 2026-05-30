import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ImageGallery } from "./image-gallery";
import type { MediaGalleryItem } from "./media-gallery-types";

const galleryItems: MediaGalleryItem[] = [
  {
    id: "cover",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'%3E%3Crect width='640' height='480' fill='%236366f1'/%3E%3Cpath d='M80 380 250 190l98 96 86-68 126 162z' fill='%23eef2ff' fill-opacity='.82'/%3E%3C/svg%3E",
    alt: "Cover study",
    title: "Cover study",
    caption: "Primary campaign frame",
  },
  {
    id: "portrait",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'%3E%3Crect width='640' height='480' fill='%23f43f5e'/%3E%3Ccircle cx='320' cy='210' r='112' fill='%23fff1f2' fill-opacity='.78'/%3E%3C/svg%3E",
    alt: "Portrait crop",
    title: "Portrait crop",
    caption: "Avatar composition",
  },
  {
    id: "texture",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'%3E%3Crect width='640' height='480' fill='%230f766e'/%3E%3Cpath d='M0 120h640M0 240h640M0 360h640M160 0v480M320 0v480M480 0v480' stroke='%23ccfbf1' stroke-opacity='.5' stroke-width='12'/%3E%3C/svg%3E",
    alt: "Texture grid",
    title: "Texture grid",
    caption: "Background system",
  },
];

const meta = {
  title: "Components/Media/Image Gallery",
  component: ImageGallery,
  tags: ["autodocs", "test"],
  args: {
    columns: 3,
    items: galleryItems,
    showOverlay: true,
  },
} satisfies Meta<typeof ImageGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Grid: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("button", { name: /Cover study/ })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /Portrait crop/ }));
    await expect(canvas.getByRole("button", { name: /Portrait crop/ })).toHaveAttribute(
      "data-selected",
      "true",
    );
  },
};

export const Masonry: Story = {
  args: {
    variant: "masonry",
  },
};

export const Stack: Story = {
  args: {
    variant: "stack",
  },
};
