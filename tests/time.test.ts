import { describe, expect, it } from "vitest";
import {
  evaluateReminder,
  getNextReminderDate,
  getNextScheduleStartDate,
  getSleepSessionId,
  isReminderWindowActive,
  isScheduleActive,
  parseClockTime
} from "../src/shared/time";
import type { RuleGroup, SleepSchedule } from "../src/shared/types";

const schedule: SleepSchedule = {
  enabled: true,
  startTime: "23:00",
  endTime: "07:00",
  days: [1, 2, 3, 4, 5]
};

const group: RuleGroup = {
  id: "focus",
  name: "工作时间专注",
  enabled: true,
  schedule,
  sites: [],
  commitment: "先把重要的事做完。",
  reminderMinutes: 30,
  blockMode: "standard",
  unlockMinutes: 10,
  maxUnlocksPerSession: 3,
  recordUnlockReason: true,
  createdAt: ""
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

  it("does not treat zero reminder minutes as an all-day reminder", () => {
    expect(isReminderWindowActive(schedule, 0, new Date("2026-06-22T12:00:00"))).toBe(false);
  });

  it("finds the next exact reminder start", () => {
    expect(getNextReminderDate(group, new Date("2026-06-22T21:00:00"))?.toISOString()).toBe(
      new Date("2026-06-22T22:30:00").toISOString()
    );
  });

  it("finds the next exact block start", () => {
    expect(getNextScheduleStartDate(group, new Date("2026-06-22T21:00:00"))?.toISOString()).toBe(
      new Date("2026-06-22T23:00:00").toISOString()
    );
  });

  it("does not remind twice in the same sleep session", () => {
    const decision = evaluateReminder(group, ["focus:2026-06-22"], new Date("2026-06-22T22:45:00"));
    expect(decision.shouldRemind).toBe(false);
    expect(decision.reason).toBe("already_reminded");
    expect(decision.ruleGroupId).toBe("focus");
  });
});
