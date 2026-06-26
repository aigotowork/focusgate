import type { Weekday } from "../types";
import { getCatalog } from "./catalogs";
import type { SupportedLocale } from "./locales";

export function formatDuration(ms: number, locale: SupportedLocale): string {
  const catalog = getCatalog(locale);
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return catalog.units.minutes(minutes);
  }

  if (minutes === 0) {
    return catalog.units.hours(hours);
  }

  return `${catalog.units.hours(hours)} ${catalog.units.minutes(minutes)}`;
}

export function formatMinutes(minutes: number, locale: SupportedLocale): string {
  return getCatalog(locale).units.minutes(minutes);
}

export function formatCount(value: number, locale: SupportedLocale): string {
  return getCatalog(locale).units.count(value);
}

export function formatWeekday(day: Weekday, locale: SupportedLocale): string {
  return getCatalog(locale).weekdays[day];
}

export function formatTime(date: Date, locale: SupportedLocale): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date);
}
