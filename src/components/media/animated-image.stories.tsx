import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AnimatedImage } from "./animated-image";

const staticImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%2314b8a6'/%3E%3Ccircle cx='208' cy='180' r='84' fill='%23f8fafc' fill-opacity='.85'/%3E%3Cpath d='M348 92h152v176H348z' fill='%230f172a' fill-opacity='.28'/%3E%3C/svg%3E";

const animatedImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%233b82f6'/%3E%3Ccircle cx='432' cy='180' r='84' fill='%23f8fafc' fill-opacity='.85'/%3E%3Cpath d='M140 92h152v176H140z' fill='%230f172a' fill-opacity='.28'/%3E%3C/svg%3E";

const meta = {
  title: "Components/Media/Animated Image",
  component: AnimatedImage,
  tags: ["autodocs", "test"],
  args: {
    alt: "Animated product preview",
    animatedSrc: animatedImage,
    className: "aspect-video w-80",
    staticSrc: staticImage,
  },
} satisfies Meta<typeof AnimatedImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HoverAndFocus: Story = {
  play: async ({ canvas, userEvent }) => {
    const image = canvas.getByAltText("Animated product preview");

    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", staticImage);
    await userEvent.hover(image);
    await expect(image).toHaveAttribute("src", animatedImage);
  },
};

export const DelayedPlayback: Story = {
  args: {
    playDelayMs: 150,
  },
};
