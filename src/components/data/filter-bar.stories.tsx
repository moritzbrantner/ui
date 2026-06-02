import type { Meta, StoryObj } from "@storybook/react-vite";
import { DownloadIcon, PlusIcon, SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { expect, fn } from "storybook/test";

import { Button } from "../stable/button";
import { FilterBar, type FilterBarFilter } from "./filter-bar";

const filters: FilterBarFilter[] = [
  { id: "status", label: "Status", value: "Ready" },
  { id: "owner", label: "Owner", value: "Design system" },
];

const availableFilters: FilterBarFilter[] = [
  { id: "status", label: "Status", value: "Ready" },
  { id: "owner", label: "Owner", value: "Design system" },
  { id: "priority", label: "Priority", value: "High" },
  { id: "type", label: "Type", value: "Component" },
];

type InteractiveFilterBarProps = {
  onSearchChange?: (value: string) => void;
  onClearFilter?: (id: string) => void;
  onClearAll?: () => void;
};

function InteractiveFilterBar({
  onSearchChange = () => undefined,
  onClearFilter = () => undefined,
  onClearAll = () => undefined,
}: InteractiveFilterBarProps) {
  const [searchValue, setSearchValue] = useState("release");
  const [activeFilters, setActiveFilters] = useState<FilterBarFilter[]>([
    availableFilters[0],
    availableFilters[1],
  ]);
  const inactiveFilters = availableFilters.filter(
    (filter) => !activeFilters.some((activeFilter) => activeFilter.id === filter.id),
  );

  function addFilter(filter: FilterBarFilter) {
    setActiveFilters((currentFilters) =>
      currentFilters.some((currentFilter) => currentFilter.id === filter.id)
        ? currentFilters
        : [...currentFilters, filter],
    );
  }

  function clearFilter(id: string) {
    setActiveFilters((currentFilters) =>
      currentFilters.filter((currentFilter) => currentFilter.id !== id),
    );
    onClearFilter(id);
  }

  function clearAllFilters() {
    setActiveFilters([]);
    onClearAll();
  }

  return (
    <div className="w-full max-w-[720px] min-w-0">
      <FilterBar
        searchValue={searchValue}
        searchPlaceholder="Search rows"
        filters={activeFilters}
        onSearchChange={(value) => {
          setSearchValue(value);
          onSearchChange(value);
        }}
        onClearFilter={clearFilter}
        onClearAll={activeFilters.length > 0 ? clearAllFilters : undefined}
        actions={
          inactiveFilters.length > 0 ? (
            <>
              {inactiveFilters.map((filter) => (
                <Button
                  key={filter.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addFilter(filter)}
                >
                  <PlusIcon />
                  Add {filter.label}
                </Button>
              ))}
            </>
          ) : undefined
        }
      />
    </div>
  );
}

const meta = {
  title: "Components/Forms & Inputs/Filter Bar",
  component: FilterBar,
  tags: ["autodocs", "test"],
  args: {
    searchValue: "release",
    searchPlaceholder: "Search rows",
    filters,
    onSearchChange: fn(),
    onClearFilter: fn(),
    onClearAll: fn(),
  },
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.clear(canvas.getByPlaceholderText("Search rows"));
    await userEvent.type(canvas.getByPlaceholderText("Search rows"), "tokens");
    await userEvent.click(canvas.getByRole("button", { name: "Clear status filter" }));
    await expect(canvas.getByText("Owner")).toBeVisible();
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button type="button" variant="outline" size="sm">
          <SlidersHorizontalIcon />
          View
        </Button>
        <Button type="button" size="sm">
          <DownloadIcon />
          Export
        </Button>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "View" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Export" })).toBeVisible();
  },
};

export const InteractiveFilters: StoryObj<typeof InteractiveFilterBar> = {
  render: (args) => <InteractiveFilterBar {...args} />,
  args: {
    onSearchChange: fn(),
    onClearFilter: fn(),
    onClearAll: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Priority" }));
    await expect(canvas.getByText("Priority")).toBeVisible();
    await expect(canvas.getByText("High")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Clear status filter" }));
    await expect(canvas.queryByText("Status")).not.toBeInTheDocument();
    await expect(args.onClearFilter).toHaveBeenCalledWith("status");

    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    await expect(canvas.queryByText("Owner")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Priority")).not.toBeInTheDocument();
    await expect(args.onClearAll).toHaveBeenCalledTimes(1);
  },
};
