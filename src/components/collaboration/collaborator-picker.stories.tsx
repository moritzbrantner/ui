import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { CollaboratorPicker } from "./collaborator-picker";

function PickerExample() {
  const [selectedIds, setSelectedIds] = React.useState(["ada"]);
  return (
    <CollaboratorPicker
      className="w-80"
      participants={[
        { id: "ada", name: "Ada Lovelace", secondaryText: "Engineering", presenceLabel: "Online" },
        { id: "grace", name: "Grace Hopper", secondaryText: "Research", presenceLabel: "Away" },
        { id: "linus", name: "Linus Torvalds", secondaryText: "Platform" },
        { id: "disabled", name: "Unavailable participant", disabled: true },
      ]}
      selectedIds={selectedIds}
      onSelectedIdsChange={setSelectedIds}
      multiple
      inputLabel="Find collaborators"
      getRemoveLabel={(participant) => `Remove ${participant.name}`}
      placeholder="Search people"
      emptyContent="No people found"
    />
  );
}

const meta = {
  title: "Components/Collaboration/Collaborator Picker",
  component: CollaboratorPicker,
  tags: ["autodocs", "test"],
  args: {
    participants: [],
    selectedIds: [],
    onSelectedIdsChange: () => undefined,
    multiple: true,
    inputLabel: "Find collaborators",
    getRemoveLabel: (participant) => `Remove ${participant.name}`,
  },
} satisfies Meta<typeof CollaboratorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiSelect: Story = {
  args: {
    participants: [],
    selectedIds: [],
    onSelectedIdsChange: () => undefined,
    multiple: true,
    inputLabel: "Find collaborators",
    getRemoveLabel: (participant) => `Remove ${participant.name}`,
  },
  render: () => <PickerExample />,
};

export const Loading: Story = {
  args: {
    participants: [],
    selectedIds: [],
    onSelectedIdsChange: () => undefined,
    multiple: true,
    inputLabel: "Find collaborators",
    getRemoveLabel: (participant) => `Remove ${participant.name}`,
    loading: true,
    loadingContent: "Loading people",
  },
};
