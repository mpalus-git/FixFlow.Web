import { TZDate, tz } from "@date-fns/tz";
import { format } from "date-fns";
import { enUS, pl } from "date-fns/locale";
import type { Language } from "@/shared/i18n/languages";

export const appTimeZone = "Europe/Warsaw";

const dateFnsLocales = { pl, en: enUS };

const calendarDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const localDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function parseTimestamp(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid timestamp: ${value}`);
  }
  return date;
}

function formatInAppTimeZone(value: string, pattern: string, language: Language): string {
  return format(parseTimestamp(value), pattern, {
    in: tz(appTimeZone),
    locale: dateFnsLocales[language],
  });
}

export function formatDateTime(value: string, language: Language): string {
  return formatInAppTimeZone(value, "P p", language);
}

export function formatTime(value: string, language: Language): string {
  return formatInAppTimeZone(value, "p", language);
}

export function formatDate(value: string, language: Language): string {
  return formatInAppTimeZone(value, "P", language);
}

export function formatCalendarDate(value: string, language: Language): string {
  const match = calendarDatePattern.exec(value);
  if (!match) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }
  const [, year, month, day] = match;
  const date = new TZDate(Number(year), Number(month) - 1, Number(day), appTimeZone);
  return format(date, "P", { locale: dateFnsLocales[language] });
}

export function isCalendarDate(value: string): boolean {
  const match = calendarDatePattern.exec(value);
  if (!match) {
    return false;
  }
  const [, year, month, day] = match;
  const date = new TZDate(Number(year), Number(month) - 1, Number(day), appTimeZone);
  return format(date, "yyyy-MM-dd") === value;
}

export function todayCalendarDate(now: Date = new Date()): string {
  return format(now, "yyyy-MM-dd", { in: tz(appTimeZone) });
}

export function toUtcIso(localDateTime: string): string {
  const match = localDateTimePattern.exec(localDateTime);
  if (!match) {
    throw new RangeError(`Invalid local date time: ${localDateTime}`);
  }
  const [, year, month, day, hours, minutes] = match;
  const date = new TZDate(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    appTimeZone,
  );
  return new Date(date.getTime()).toISOString();
}
