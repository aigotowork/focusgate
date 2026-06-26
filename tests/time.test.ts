import { describe, expect, it } from "vitest";
import {
  evaluateReminder,
  getCurrentReminderScheduleStart,
  getNextReminderDate,
  getNextScheduleStartDate,
  getReminderWindowState,
  getSleepSessionId,
  isReminderWindowActive,
  isScheduleActive,
  parseClockTime
} from "../src/shared/time";
import { DEFAULT_SETTINGS } from "../src/shared/defaults";
import type { RuleGroup, SleepSchedule } from "../src/shared/types";

const schedule: SleepSchedule = {
  enabled: true,
  startTime: "23:00",
  endTime: "07:00",
  days: [1, 2, 3, 4, 5]
};

const group: RuleGroup = {
  ...DEFAULT_SETTINGS.ruleGroups[0],
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

  it("returns reminder window timing for countdown surfaces", () => {
    const state = getReminderWindowState(schedule, 30, new Date("2026-06-22T22:45:00"));
    expect(state.active).toBe(true);
    expect(state.startsAt).toBe(new Date("2026-06-22T22:30:00").toISOString());
    expect(state.endsAt).toBe(new Date("2026-06-22T23:00:00").toISOString());
    expect(state.remainingMs).toBe(15 * 60000);
    expect(state.sessionId).toBe("2026-06-22");
  });

  it("finds the schedule start for a reminder window that crosses midnight", () => {
    const earlySchedule: SleepSchedule = {
      enabled: true,
      startTime: "00:10",
      endTime: "07:00",
      days: [2]
    };

    expect(getCurrentReminderScheduleStart(earlySchedule, 30, new Date("2026-06-22T23:50:00"))?.toISOString()).toBe(
      new Date("2026-06-23T00:10:00").toISOString()
    );
    expect(getReminderWindowState(earlySchedule, 30, new Date("2026-06-22T23:50:00")).sessionId).toBe("2026-06-23");
  });

  it("does not treat zero reminder minutes as an all-day reminder", () => {
    expect(isReminderWindowActive(schedule, 0, new Date("2026-06-22T12:00:00"))).toBe(false);
    expect(getReminderWindowState(schedule, 0, new Date("2026-06-22T12:00:00")).active).toBe(false);
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

  it("uses the upcoming schedule date as the reminder session across midnight", () => {
    const earlyGroup: RuleGroup = {
      ...group,
      schedule: {
        enabled: true,
        startTime: "00:10",
        endTime: "07:00",
        days: [2]
      },
      reminderMinutes: 30
    };

    const decision = evaluateReminder(earlyGroup, [], new Date("2026-06-22T23:50:00"));
    expect(decision.shouldRemind).toBe(true);
    expect(decision.sessionId).toBe("2026-06-23");
  });
});
