import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  QueryBuilder,
  createQueryBuilderGroup,
  evaluateQueryBuilderExpression,
  serializeQueryBuilderExpression,
  type QueryBuilderField,
} from "./query-builder";

const fields: QueryBuilderField[] = [
  { id: "name", label: "Name", type: "text" },
  { id: "rows", label: "Rows", type: "number" },
];

describe("QueryBuilder", () => {
  test("idFactory creates deterministic group and rule ids", () => {
    let index = 0;
    const expression = createQueryBuilderGroup(fields, (kind) => `${kind}-${++index}`);

    expect(expression.id).toBe("group-1");
    expect(expression.rules[0]?.id).toBe("rule-2");
  });

  test("operatorLabels override built-in labels", () => {
    render(
      <QueryBuilder
        fields={fields}
        defaultExpression={{
          id: "root",
          combinator: "and",
          rules: [{ id: "rule-name", fieldId: "name", operator: "contains", value: "atlas" }],
        }}
        operatorLabels={{ contains: "matches text" }}
      />,
    );

    expect(screen.getByText("matches text")).toBeTruthy();
  });

  test("emptyMessage renders for empty fields", () => {
    render(<QueryBuilder fields={[]} emptyMessage="No filters available." />);

    expect(screen.getByText("No filters available.")).toBeTruthy();
  });

  test("serializes and evaluates expressions", () => {
    const expression = {
      id: "root",
      combinator: "and" as const,
      rules: [
        { id: "rule-name", fieldId: "name", operator: "contains", value: "ui" },
        { id: "rule-rows", fieldId: "rows", operator: "gte", value: 10 },
      ],
    };

    expect(serializeQueryBuilderExpression(expression)).toBe(JSON.stringify(expression));
    expect(
      evaluateQueryBuilderExpression(expression, { name: "UI package", rows: 12 }, fields),
    ).toBe(true);
    expect(
      evaluateQueryBuilderExpression(expression, { name: "API package", rows: 12 }, fields),
    ).toBe(false);
  });
});
