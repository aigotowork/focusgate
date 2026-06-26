import { describe, expect, it } from "vitest";
import {
  evaluateReminder,
  getSleepSessionId,
  isReminderWindowActive,
  isScheduleActive,
  parseClockTime
} from "../src/shared/time";
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

  it("uses the previous date as the session id after midnight", () => {
    expect(getSleepSessionId(schedule, new Date("2026-06-23T02:00:00"))).toBe("2026-06-22");
  });

  it("detects the reminder window before bedtime", () => {
    expect(isReminderWindowActive(schedule, 30, new Date("2026-06-22T22:45:00"))).toBe(true);
    expect(isReminderWindowActive(schedule, 30, new Date("2026-06-22T22:15:00"))).toBe(false);
  });

  it("does not remind twice in the same sleep session", () => {
    const decision = evaluateReminder(schedule, 30, ["2026-06-22"], new Date("2026-06-22T22:45:00"));
    expect(decision.shouldRemind).toBe(false);
    expect(decision.reason).toBe("already_reminded");
  });
});
