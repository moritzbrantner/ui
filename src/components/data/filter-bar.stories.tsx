import type { Meta, StoryObj } from "@storybook/react-vite";
import { DownloadIcon, SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { expect, fn, screen } from "storybook/test";

import { Button } from "../stable/button";
import {
  BooleanFilterControl,
  DateRangeFilterControl,
  EnumFilterControl,
  FilterBar,
  FilterBarControls,
  NumberFilterControl,
  TagFilterControl,
  getFilterValueSummary,
  type BooleanFilterValue,
  type DateRangeFilterValue,
  type EnumFilterValue,
  type FilterBarFilter,
  type NumberFilterValue,
  type TagFilterValue,
} from "./filter-bar";

const filters: FilterBarFilter[] = [
  { id: "status", label: "Status", value: "Ready" },
  { id: "owner", label: "Owner", value: "Design system" },
];

const statusOptions = [
  { label: "Ready", value: "ready", count: 4 },
  { label: "Blocked", value: "blocked", count: 1 },
  { label: "Review", value: "review", count: 2 },
];

const priorityOptions = [
  { label: "High", value: "high", count: 3 },
  { label: "Medium", value: "medium", count: 5 },
  { label: "Low", value: "low", count: 2 },
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
  const [status, setStatus] = useState<EnumFilterValue | undefined>({
    kind: "enum",
    values: ["ready"],
  });
  const [priority, setPriority] = useState<EnumFilterValue | undefined>();
  const activeFilters = [
    status
      ? {
          id: "status",
          label: "Status",
          value: getFilterValueSummary(status, statusOptions),
        }
      : null,
    priority
      ? {
          id: "priority",
          label: "Priority",
          value: getFilterValueSummary(priority, priorityOptions),
        }
      : null,
  ].filter(Boolean) as FilterBarFilter[];

  function clearFilter(id: string) {
    if (id === "status") {
      setStatus(undefined);
    }

    if (id === "priority") {
      setPriority(undefined);
    }

    onClearFilter(id);
  }

  function clearAllFilters() {
    setStatus(undefined);
    setPriority(undefined);
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
      >
        <FilterBarControls>
          <EnumFilterControl
            label="Status"
            value={status}
            options={statusOptions}
            onValueChange={setStatus}
          />
          <EnumFilterControl
            label="Priority"
            value={priority}
            options={priorityOptions}
            onValueChange={setPriority}
          />
        </FilterBarControls>
      </FilterBar>
    </div>
  );
}

function TypedFilterBarDemo() {
  const [searchValue, setSearchValue] = useState("release");
  const [status, setStatus] = useState<EnumFilterValue | undefined>({
    kind: "enum",
    values: ["ready"],
  });
  const [amount, setAmount] = useState<NumberFilterValue | undefined>();
  const [created, setCreated] = useState<DateRangeFilterValue | undefined>();
  const [published, setPublished] = useState<BooleanFilterValue | undefined>();
  const statusOptions = [
    { label: "Ready", value: "ready", count: 4 },
    { label: "Blocked", value: "blocked", count: 1 },
    { label: "Review", value: "review", count: 2 },
  ];
  const activeFilters = [
    status
      ? {
          id: "status",
          label: "Status",
          value: getFilterValueSummary(status, statusOptions),
        }
      : null,
    amount
      ? {
          id: "amount",
          label: "Amount",
          value: getFilterValueSummary(amount),
        }
      : null,
    created
      ? {
          id: "created",
          label: "Created",
          value: getFilterValueSummary(created),
        }
      : null,
    published
      ? {
          id: "published",
          label: "Published",
          value: getFilterValueSummary(published),
        }
      : null,
  ].filter(Boolean) as FilterBarFilter[];

  function clearFilter(id: string) {
    if (id === "status") {
      setStatus(undefined);
    }

    if (id === "amount") {
      setAmount(undefined);
    }

    if (id === "created") {
      setCreated(undefined);
    }

    if (id === "published") {
      setPublished(undefined);
    }
  }

  return (
    <div className="w-full max-w-4xl min-w-0">
      <FilterBar
        searchValue={searchValue}
        searchPlaceholder="Search packages"
        onSearchChange={setSearchValue}
        filters={activeFilters}
        onClearFilter={clearFilter}
        onClearAll={() => {
          setStatus(undefined);
          setAmount(undefined);
          setCreated(undefined);
          setPublished(undefined);
        }}
      >
        <FilterBarControls>
          <EnumFilterControl
            label="Status"
            value={status}
            options={statusOptions}
            onValueChange={setStatus}
          />
          <NumberFilterControl label="Amount" value={amount} onValueChange={setAmount} />
          <DateRangeFilterControl label="Created" value={created} onValueChange={setCreated} />
          <BooleanFilterControl label="Published" value={published} onValueChange={setPublished} />
        </FilterBarControls>
      </FilterBar>
    </div>
  );
}

const denseStatusOptions = [
  { label: "Ready", value: "ready" },
  { label: "Blocked", value: "blocked" },
];

function DenseToolbarDemo() {
  const [status, setStatus] = useState<EnumFilterValue | undefined>();
  const [amount, setAmount] = useState<NumberFilterValue | undefined>({
    kind: "number",
    min: "30",
  });
  const activeFilters = [
    status
      ? {
          id: "status",
          label: "Status",
          value: getFilterValueSummary(status, denseStatusOptions),
        }
      : null,
    amount
      ? {
          id: "amount",
          label: "Amount",
          value: getFilterValueSummary(amount),
        }
      : null,
  ].filter(Boolean) as FilterBarFilter[];

  return (
    <div className="w-full max-w-3xl min-w-0">
      <FilterBar
        filters={activeFilters}
        onClearFilter={(id) => {
          if (id === "status") {
            setStatus(undefined);
          }

          if (id === "amount") {
            setAmount(undefined);
          }
        }}
      >
        <FilterBarControls className="gap-1.5">
          <EnumFilterControl
            label="Status"
            value={status}
            options={denseStatusOptions}
            onValueChange={setStatus}
          />
          <NumberFilterControl label="Amount" value={amount} onValueChange={setAmount} />
        </FilterBarControls>
      </FilterBar>
    </div>
  );
}

function TagFilterDemo() {
  const [labels, setLabels] = useState<TagFilterValue | undefined>({
    kind: "tags",
    values: ["design"],
  });

  return (
    <div className="w-full max-w-2xl min-w-0">
      <FilterBar
        filters={
          labels ? [{ id: "labels", label: "Labels", value: getFilterValueSummary(labels) }] : []
        }
        onClearFilter={() => setLabels(undefined)}
      >
        <FilterBarControls>
          <TagFilterControl label="Labels" value={labels} onValueChange={setLabels} />
        </FilterBarControls>
      </FilterBar>
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
    await userEvent.click(canvas.getByRole("button", { name: "Filter Priority" }));
    await userEvent.click(await screen.findByRole("checkbox", { name: "Filter Priority by High" }));
    await expect(canvas.getAllByText("High")[0]).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Filter Status" }));
    await userEvent.click(await screen.findByRole("checkbox", { name: "Filter Status by Review" }));
    await expect(canvas.getAllByText("Ready, Review")[0]).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Clear status filter" }));
    await expect(canvas.queryByText("Ready, Review")).not.toBeInTheDocument();
    await expect(args.onClearFilter).toHaveBeenCalledWith("status");

    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    await expect(canvas.queryByText("High")).not.toBeInTheDocument();
    await expect(args.onClearAll).toHaveBeenCalledTimes(1);
  },
};

export const TypedControls: StoryObj<typeof TypedFilterBarDemo> = {
  render: () => <TypedFilterBarDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filter Status" }));
    await userEvent.click(
      await screen.findByRole("checkbox", { name: "Filter Status by Blocked" }),
    );
    await expect(canvas.getAllByText("Ready, Blocked")[0]).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Filter Amount" }));
    await userEvent.type(await screen.findByLabelText("Minimum Amount"), "30");
    await userEvent.type(screen.getByLabelText("Maximum Amount"), "80");
    await expect(canvas.getAllByText("30-80")[0]).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Clear Amount filter" }));
    await expect(canvas.queryByText("30-80")).not.toBeInTheDocument();
  },
};

export const DenseToolbar: StoryObj<typeof DenseToolbarDemo> = {
  render: () => <DenseToolbarDemo />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByText(">= 30")[0]).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Filter Status" }));
    await userEvent.click(await screen.findByRole("checkbox", { name: "Filter Status by Ready" }));
    await expect(canvas.getAllByText("Ready")[0]).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Clear status filter" }));
    await expect(canvas.queryByText("Ready")).not.toBeInTheDocument();
    await expect(canvas.getAllByText(">= 30")[0]).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Clear amount filter" }));
    await expect(canvas.queryByText(">= 30")).not.toBeInTheDocument();
  },
};

export const TagFilter: StoryObj<typeof TagFilterDemo> = {
  render: () => <TagFilterDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filter Labels" }));
    await userEvent.type(await screen.findByLabelText("Labels tag"), "release{enter}");
    await expect(canvas.getAllByText("design, release")[0]).toBeVisible();
  },
};
