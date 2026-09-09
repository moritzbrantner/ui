import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { buttonVariants } from "./server";

describe("server entry boundary", () => {
  test("exports button variants without weakening the interactive Button boundary", () => {
    expect(buttonVariants({ variant: "outline", size: "sm" })).toContain("border");

    const serverSource = readFileSync("src/server.ts", "utf8");
    const variantSource = readFileSync("src/components/stable/button-variants.ts", "utf8");
    const buttonSource = readFileSync("src/components/stable/button.tsx", "utf8");

    expect(serverSource).toContain(
      'export { buttonVariants } from "./components/stable/button-variants";',
    );
    expect(variantSource).not.toContain('"use client"');
    expect(buttonSource.startsWith('"use client";')).toBe(true);
  });
});
