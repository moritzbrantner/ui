import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { Spinner } from "./spinner";
import { Switch } from "./switch";

describe("stable component contract", () => {
  test("renders stable primitives with slots, merged classes, and accessible states", () => {
    render(
      <Card className="contract-card">
        <CardHeader>
          <CardTitle>Stable surface</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="contract-button">Save</Button>
          <Badge className="contract-badge">Ready</Badge>
          <Label htmlFor="stable-input">Name</Label>
          <Input id="stable-input" aria-invalid="true" className="contract-input" />
          <Checkbox aria-label="Accept terms" disabled />
          <Switch aria-label="Enable notifications" />
          <Spinner aria-label="Loading stable preview" />
        </CardContent>
      </Card>,
    );

    expect(screen.getByText("Stable surface")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("data-slot")).toBe("button");
    expect(screen.getByRole("button", { name: "Save" }).className).toContain("contract-button");
    expect(screen.getByLabelText("Name").getAttribute("data-slot")).toBe("input");
    expect(screen.getByLabelText("Name").className).toContain("contract-input");
    expect(screen.getByRole("checkbox", { name: "Accept terms" }).hasAttribute("disabled")).toBe(
      true,
    );
    expect(screen.getByRole("switch", { name: "Enable notifications" })).toBeTruthy();
    expect(screen.getByLabelText("Loading stable preview")).toBeTruthy();
  });
});
