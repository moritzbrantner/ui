import { describe, expect, test } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  test("omits falsey class values", () => {
    expect(cn("font-medium", false && "hidden", undefined, null, "tracking-tight")).toBe(
      "font-medium tracking-tight",
    );
  });

  test("keeps the later conflicting Tailwind class", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
