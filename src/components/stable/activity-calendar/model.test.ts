import { describe, expect, test } from "vitest";

import { buildActivityCalendarModel } from "./model";

describe("activity calendar model", () => {
  test("uses the stable date snapshot supplied for the implicit range", () => {
    const model = buildActivityCalendarModel({
      data: [],
      implicitEndDate: "2026-08-31",
      levels: 5,
      weekStartsOn: 0,
      variant: "compact",
      formatMonth: () => "",
    });

    expect(model.endDate).toBe("2026-08-31");
  });
});
