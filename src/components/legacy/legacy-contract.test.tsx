import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import * as root from "../../index";
import { componentRegistry } from "../../component-registry";
import { DataTable } from "./data-table";

describe("legacy component contract", () => {
  test("keeps DataTable available only through legacy paths with migration metadata", () => {
    render(
      <DataTable columns={[{ accessorKey: "name", header: "Name" }]} data={[{ name: "UI" }]} />,
    );

    expect(screen.getByText("UI")).toBeTruthy();
    expect(Object.hasOwn(root, "DataTable")).toBe(false);

    const entry = componentRegistry.find((component) => component.name === "data-table");
    expect(entry?.tier).toBe("legacy");
    expect(entry?.deprecatedSince).toBe("0.8.0");
    expect(entry?.migration).toContain("@moritzbrantner/ui/components/patterns/data-grid");
  });
});
