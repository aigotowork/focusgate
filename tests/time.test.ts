import { describe, expect, it } from "vitest";
import { isScheduleActive, parseClockTime } from "../src/shared/time";
import type { SleepSchedule } from "../src/shared/types";

const schedule: SleepSchedule = {
  enabled: true,
  startTime: "23:00",
  endTime: "07:00",
  days: [1, 2, 3, 4, 5]
};

describe("sleep schedule", () => {
  it("parses HH:mm values into minutes", () => {
    expect(parseClockTime("23:15")).toBe(1395);
  });

  it("treats late night as active on a selected day", () => {
    expect(isScheduleActive(schedule, new Date("2026-06-22T23:30:00"))).toBe(true);
  });

  it("treats after-midnight time as part of the previous selected day", () => {
    expect(isScheduleActive(schedule, new Date("2026-06-23T02:00:00"))).toBe(true);
  });

  it("is inactive outside the configured window", () => {
    expect(isScheduleActive(schedule, new Date("2026-06-23T12:00:00"))).toBe(false);
  });
});
