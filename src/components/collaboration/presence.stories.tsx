import type { Meta, StoryObj } from "@storybook/react-vite";

import { Presence, PresenceAvatar, PresenceGroup } from "./presence";

const meta = {
  title: "Components/Collaboration/Presence",
  component: Presence,
  tags: ["autodocs", "test"],
  args: { status: "online", statusLabel: "Online" },
} satisfies Meta<typeof Presence>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["online", "away", "busy", "offline"] as const).map((status) => (
        <Presence key={status} status={status} statusLabel={status}>
          <PresenceAvatar name="Ada Lovelace" status={status} statusLabel={`${status} status`} />
        </Presence>
      ))}
    </div>
  ),
};

export const GroupWithOverflow: Story = {
  render: () => (
    <PresenceGroup
      aria-label="People viewing"
      participants={[
        { id: "ada", name: "Ada", status: "online", statusLabel: "Ada online" },
        { id: "grace", name: "Grace", status: "away", statusLabel: "Grace away" },
        { id: "linus", name: "Linus", status: "busy", statusLabel: "Linus busy" },
        { id: "margaret", name: "Margaret", status: "offline", statusLabel: "Margaret offline" },
      ]}
      maxVisible={3}
      overflowLabel={(count) => `${count} more people`}
    />
  ),
};
