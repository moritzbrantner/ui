import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid2X2Icon, ListFilterIcon, StarIcon } from "lucide-react";
import { expect, waitFor } from "storybook/test";

import { Badge } from "./badge";
import { Button } from "./button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group";
import { Checkbox } from "./checkbox";
import { Kbd, KbdGroup } from "./kbd";
import { Label } from "./label";
import { LoadingBar } from "./loading-bar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "./pagination";
import { Progress } from "./progress";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Slider } from "./slider";
import { Switch } from "./switch";
import { Toggle } from "./toggle";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { ToggleSetting } from "./toggle-setting";

function PrimitiveActionsPreview() {
  return (
    <div className="grid w-full max-w-[920px] min-w-0 gap-4 p-4 md:grid-cols-2">
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">button-group</Badge>
        <ButtonGroup>
          <Button variant="outline">Preview</Button>
          <ButtonGroupSeparator />
          <ButtonGroupText>
            <Kbd>P</Kbd>
          </ButtonGroupText>
        </ButtonGroup>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">selection</Badge>
        <div className="flex items-center gap-3">
          <Checkbox id="primitive-actions-checkbox" defaultChecked />
          <Label htmlFor="primitive-actions-checkbox">Include in release</Label>
        </div>
        <RadioGroup aria-label="Release channel" defaultValue="preview">
          <div className="flex items-center gap-2">
            <RadioGroupItem id="primitive-actions-radio-draft" value="draft" />
            <Label htmlFor="primitive-actions-radio-draft">Draft</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="primitive-actions-radio-preview" value="preview" />
            <Label htmlFor="primitive-actions-radio-preview">Preview</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="primitive-actions-radio-stable" value="stable" />
            <Label htmlFor="primitive-actions-radio-stable">Stable</Label>
          </div>
        </RadioGroup>
        <div className="flex items-center gap-3">
          <Switch id="primitive-actions-switch" defaultChecked />
          <Label htmlFor="primitive-actions-switch">Publish notifications</Label>
        </div>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">feedback controls</Badge>
        <Progress aria-label="Primitive completion" value={68} />
        <LoadingBar value={72} label="Package upload" showValue />
        <Slider
          defaultValue={[30, 70]}
          minStepsBetweenThumbs={5}
          thumbAriaLabel={["Release window start", "Release window end"]}
        />
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">toggles</Badge>
        <Toggle defaultPressed aria-label="Toggle starred">
          <StarIcon />
          Starred
        </Toggle>
        <ToggleGroup type="multiple" defaultValue={["grid"]}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid2X2Icon />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <ListFilterIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleSetting
          title="Notify reviewers"
          description="Send release updates."
          defaultChecked
        />
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">kbd</Badge>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>B</Kbd>
        </KbdGroup>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">pagination</Badge>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </div>
  );
}

const meta = {
  title: "Components/Stable/Primitive Actions",
  component: PrimitiveActionsPreview,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof PrimitiveActionsPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  play: async ({ canvas, userEvent }) => {
    const previewChannel = canvas.getByRole("radio", { name: "Preview" });
    const stableChannel = canvas.getByRole("radio", { name: "Stable" });
    const releaseWindowStart = canvas.getByRole("slider", { name: "Release window start" });
    const releaseWindowEnd = canvas.getByRole("slider", { name: "Release window end" });
    const settingSwitch = canvas.getByRole("switch", { name: "Notify reviewers" });
    const switchThumb = settingSwitch.querySelector('[data-slot="switch-thumb"]');
    const getSwitchThumbOffset = (element: Element) => {
      const styles = window.getComputedStyle(element);

      return styles.getPropertyValue("translate") || styles.transform;
    };
    const initialState = settingSwitch.getAttribute("data-state");
    const initialSwitchThumbOffset = switchThumb ? getSwitchThumbOffset(switchThumb) : "";

    await userEvent.click(previewChannel);
    await expect(previewChannel).toHaveAttribute("aria-checked", "true");
    await expect(stableChannel).toHaveAttribute("aria-checked", "false");

    releaseWindowStart.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(releaseWindowStart).toHaveAttribute("aria-valuenow", "31");
    await expect(releaseWindowEnd).toHaveAttribute("aria-valuenow", "70");

    await userEvent.click(settingSwitch);

    await waitFor(() => {
      expect(settingSwitch.getAttribute("data-state")).not.toBe(initialState);
      expect(switchThumb).toBeTruthy();
      expect(getSwitchThumbOffset(switchThumb as Element)).not.toBe(initialSwitchThumbOffset);
    });
  },
};
