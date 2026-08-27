import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageStatus, ReadReceiptGroup, ReadReceiptParticipant } from "./message-status";

const meta = {
  title: "Components/Collaboration/Message Status",
  component: MessageStatus,
  tags: ["autodocs", "test"],
  args: { state: "sent", label: "Sent" },
} satisfies Meta<typeof MessageStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeliveryStates: Story = {
  render: () => (
    <div className="grid w-fit gap-3">
      {(["sending", "sent", "delivered", "read", "failed"] as const).map((state) => (
        <MessageStatus key={state} state={state} label={state} detail="10:42" />
      ))}
    </div>
  ),
};

export const ReadReceipts: Story = {
  args: { state: "read", label: "Read" },
  render: (args) => (
    <div className="flex items-center gap-2">
      <MessageStatus {...args} compact />
      <ReadReceiptGroup maxVisible={3} overflowLabel={(count) => `${count} more readers`}>
        <ReadReceiptParticipant label="Read by Ada" name="Ada" />
        <ReadReceiptParticipant label="Read by Grace" name="Grace" />
        <ReadReceiptParticipant label="Read by Linus" name="Linus" />
        <ReadReceiptParticipant label="Read by Margaret" name="Margaret" />
      </ReadReceiptGroup>
    </div>
  ),
};
