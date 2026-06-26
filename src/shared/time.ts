import type { SleepSchedule } from "./types";

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
