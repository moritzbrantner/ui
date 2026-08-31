import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { buildActivityCalendarModel } from "./model";

describe("activity calendar model", () => {
  const originalTimeZone = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "America/Los_Angeles";
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (originalTimeZone === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTimeZone;
    }
    vi.useRealTimers();
  });

  test("uses a time-zone-stable UTC date for the implicit range", () => {
    vi.setSystemTime(new Date("2026-08-31T00:30:00Z"));

    const model = buildActivityCalendarModel({
      data: [],
      levels: 5,
      weekStartsOn: 0,
      variant: "compact",
      formatMonth: () => "",
    });

    expect(model.endDate).toBe("2026-08-31");
  });
});
