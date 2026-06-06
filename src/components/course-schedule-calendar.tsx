"use client";

import { ChevronLeft, ChevronRight, Mic, Presentation } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LessonType } from "@/lib/courses";
import {
  daysInMonth,
  eventsOnLocalDay,
  formatScheduleDate,
  formatScheduleRange,
  mondayBasedWeekday,
  type ScheduleEvent,
  startOfMonth,
} from "@/lib/course-schedule";
import { cn } from "@/lib/utils";

type Props = {
  events: ScheduleEvent[];
  locale: string;
  timeZone?: string;
  cohortStartsAt?: string | null;
  initialYear: number;
  initialMonth: number;
};

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function typeIcon(type: LessonType) {
  if (type === "seminar") return Mic;
  return Presentation;
}

export function CourseScheduleCalendar({
  events,
  locale,
  timeZone = "Europe/Kyiv",
  initialYear,
  initialMonth,
}: Props) {
  const t = useTranslations("Course.schedule");
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(new Date(year, month, 1)),
    [locale, year, month]
  );

  const grid = useMemo(() => {
    const first = startOfMonth(year, month);
    const offset = mondayBasedWeekday(first);
    const totalDays = daysInMonth(year, month);
    const cells: ({ day: number; events: ScheduleEvent[] } | null)[] = [];

    for (let i = 0; i < offset; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) {
      cells.push({
        day,
        events: eventsOnLocalDay(events, year, month, day, timeZone),
      });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [events, year, month, timeZone]);

  const selectedEvents =
    selectedDay != null
      ? eventsOnLocalDay(events, year, month, selectedDay, timeZone)
      : [];

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelectedDay(null);
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="border-b border-primary/15 bg-primary/5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="font-heading text-xl">{t("title")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => shiftMonth(-1)}
              aria-label={t("prevMonth")}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span
              className="min-w-36 text-center font-heading text-sm font-medium capitalize"
              suppressHydrationWarning
            >
              {monthLabel}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => shiftMonth(1)}
              aria-label={t("nextMonth")}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary" className="gap-1 bg-primary/15 text-foreground">
            <Presentation className="size-3 text-primary" />
            {t("legendLecture")}
          </Badge>
          <Badge variant="secondary" className="gap-1 bg-honey/20 text-foreground">
            <Mic className="size-3 text-honey-deep" />
            {t("legendSeminar")}
          </Badge>
          <span className="text-xs text-muted-foreground self-center">
            {t("timezone", { tz: timeZone.replace("_", " ") })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAY_KEYS.map((key) => (
            <div key={key} className="py-1">
              {t(`weekdays.${key}`)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="min-h-14 rounded-lg" />;
            }

            const hasEvents = cell.events.length > 0;
            const hasSeminar = cell.events.some((e) => e.type === "seminar");
            const isSelected = selectedDay === cell.day;

            return (
              <button
                key={cell.day}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : cell.day)}
                className={cn(
                  "relative min-h-14 rounded-lg border p-1 text-left transition-all",
                  hasEvents
                    ? "border-primary/35 bg-primary/8 hover:border-primary/55 hover:bg-primary/12"
                    : "border-transparent hover:border-foreground/10 hover:bg-muted/50",
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    hasEvents ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}
                >
                  {cell.day}
                </span>
                {hasEvents && (
                  <div className="mt-0.5 flex flex-wrap gap-0.5 px-0.5">
                    {cell.events.slice(0, 3).map((e) => {
                      const Icon = typeIcon(e.type);
                      return (
                        <Icon
                          key={e.id}
                          className={cn(
                            "size-3",
                            e.type === "seminar" ? "text-honey-deep" : "text-primary"
                          )}
                        />
                      );
                    })}
                  </div>
                )}
                {hasSeminar && (
                  <span className="absolute bottom-1 right-1 size-1.5 rounded-full bg-honey" />
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-primary/15 bg-background/60 p-4">
          {selectedDay == null ? (
            <p className="text-sm text-muted-foreground">{t("pickDay")}</p>
          ) : selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noEvents")}</p>
          ) : (
            <ul className="space-y-3">
              {selectedEvents.map((e) => {
                const Icon = typeIcon(e.type);
                return (
                  <li
                    key={e.id}
                    className="flex gap-3 rounded-lg border border-foreground/10 bg-card p-3"
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        e.type === "seminar" ? "bg-honey/20 text-honey-deep" : "bg-primary/15 text-primary"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium leading-snug">{e.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatScheduleDate(e.scheduledAt, locale, timeZone)} ·{" "}
                        {formatScheduleRange(e.scheduledAt, e.durationMinutes, locale, timeZone)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("weekDay", { week: e.weekPosition, day: e.dayPosition })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
