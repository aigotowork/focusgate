import type { ReminderDecision, RuleGroup, SleepSchedule } from "./types";

export function parseClockTime(value: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid time value: ${value}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new Error(`Invalid time value: ${value}`);
  }

  return hours * 60 + minutes;
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function isScheduleActive(schedule: SleepSchedule, date = new Date()): boolean {
  if (!schedule.enabled) {
    return false;
  }

  const start = parseClockTime(schedule.startTime);
  const end = parseClockTime(schedule.endTime);
  const now = minutesSinceMidnight(date);
  const today = date.getDay();
  const yesterday = ((today + 6) % 7) as SleepSchedule["days"][number];

  if (start === end) {
    return schedule.days.includes(today as SleepSchedule["days"][number]);
  }

  if (start < end) {
    return schedule.days.includes(today as SleepSchedule["days"][number]) && now >= start && now < end;
  }

  return (
    (schedule.days.includes(today as SleepSchedule["days"][number]) && now >= start) ||
    (schedule.days.includes(yesterday) && now < end)
  );
}

export function getSleepSessionId(schedule: SleepSchedule, date = new Date()): string {
  const start = parseClockTime(schedule.startTime);
  const end = parseClockTime(schedule.endTime);
  const now = minutesSinceMidnight(date);
  const sessionDate = new Date(date);

  if (start > end && now < end) {
    sessionDate.setDate(sessionDate.getDate() - 1);
  }

  return toLocalDateKey(sessionDate);
}

export function isReminderWindowActive(schedule: SleepSchedule, reminderMinutes: number, date = new Date()): boolean {
  if (!schedule.enabled) {
    return false;
  }

  const reminderStart = shiftClockMinutes(schedule.startTime, -Math.max(0, reminderMinutes));
  const reminderSchedule: SleepSchedule = {
    ...schedule,
    startTime: reminderStart,
    endTime: schedule.startTime
  };

  return isScheduleActive(reminderSchedule, date);
}

export function evaluateReminder(
  group: RuleGroup,
  remindedSessionIds: string[],
  date = new Date()
): ReminderDecision {
  if (!group.enabled || !group.schedule.enabled) {
    return { shouldRemind: false, reason: "disabled" };
  }

  if (!isReminderWindowActive(group.schedule, group.reminderMinutes, date)) {
    return { shouldRemind: false, reason: "outside_window" };
  }

  const sessionId = getSleepSessionId(group.schedule, date);
  const reminderKey = `${group.id}:${sessionId}`;
  if (remindedSessionIds.includes(reminderKey)) {
    return {
      shouldRemind: false,
      reason: "already_reminded",
      sessionId,
      ruleGroupId: group.id,
      ruleGroupName: group.name,
      reminderMinutes: group.reminderMinutes
    };
  }

  return {
    shouldRemind: true,
    reason: "ready",
    sessionId,
    ruleGroupId: group.id,
    ruleGroupName: group.name,
    reminderMinutes: group.reminderMinutes
  };
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} 分钟`;
  }

  if (minutes === 0) {
    return `${hours} 小时`;
  }

  return `${hours} 小时 ${minutes} 分钟`;
}

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftClockMinutes(value: string, deltaMinutes: number): string {
  const shifted = (parseClockTime(value) + deltaMinutes + 1440) % 1440;
  const hours = String(Math.floor(shifted / 60)).padStart(2, "0");
  const minutes = String(shifted % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}
