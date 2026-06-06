import type { LessonType } from "@/lib/courses";

export type ScheduleEvent = {
  id: string;
  title: string;
  type: LessonType;
  scheduledAt: string;
  durationMinutes: number;
  weekPosition: number;
  dayPosition: number;
};

export function hasScheduledLessons(events: ScheduleEvent[]): boolean {
  return events.some((e) => e.scheduledAt);
}

export function formatScheduleTime(
  iso: string,
  locale: string,
  timeZone = "Europe/Kyiv"
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(iso));
}

export function formatScheduleDate(
  iso: string,
  locale: string,
  timeZone = "Europe/Kyiv"
): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(new Date(iso));
}

export function formatScheduleRange(
  startIso: string,
  durationMinutes: number,
  locale: string,
  timeZone = "Europe/Kyiv"
): string {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const fmt = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
  return `${fmt.format(start)}–${fmt.format(end)}`;
}

/** Calendar grid helpers (Monday-first week). */
export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 0 = Monday … 6 = Sunday */
export function mondayBasedWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function localDateKey(date: Date, timeZone = "Europe/Kyiv"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
}

export function calendarDayKey(
  year: number,
  month: number,
  day: number
): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function eventsOnLocalDay(
  events: ScheduleEvent[],
  year: number,
  month: number,
  day: number,
  timeZone = "Europe/Kyiv"
): ScheduleEvent[] {
  const key = calendarDayKey(year, month, day);
  return events.filter(
    (e) => localDateKey(new Date(e.scheduledAt), timeZone) === key
  );
}

export function initialCalendarMonth(
  events: ScheduleEvent[],
  cohortStartsAt: string | null
): { year: number; month: number } {
  const source = cohortStartsAt ?? events.find((e) => e.scheduledAt)?.scheduledAt;
  if (!source) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  const d = new Date(source);
  return { year: d.getFullYear(), month: d.getMonth() };
}
