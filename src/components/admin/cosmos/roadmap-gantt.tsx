"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DocEditToolbar } from "./doc-edit-toolbar";
import {
  dayIndex,
  formatShortDate,
  newTaskId,
  resolveRoadmapTasks,
  sectionFor,
  tasksOnDate,
  totalRoadmapDays,
  type ResolvedTask,
  type RoadmapSection,
  type RoadmapTask,
} from "./roadmap";
import { useRoadmapDoc } from "./roadmap-store";

const LABEL_W = 280;
const ROW_H = 36;
const SECTION_PAD = 8;
const DAY_W = 14;

function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

type BarProps = {
  task: ResolvedTask;
  sections: RoadmapSection[];
  totalDays: number;
  origin: Date;
  selected: boolean;
  onSelect: (task: ResolvedTask | null) => void;
};

function TaskBar({ task, sections, totalDays, origin, selected, onSelect }: BarProps) {
  const section = sectionFor(sections, task.sectionId);
  const left = dayIndex(task.start, origin) * DAY_W;
  const span = Math.max(dayIndex(task.end, origin) - dayIndex(task.start, origin) + 1, 1);
  const width = span * DAY_W - 4;

  if (task.milestone) {
    const x = left + DAY_W / 2;
    return (
      <button
        type="button"
        className="absolute top-1/2 z-10 -translate-y-1/2 focus:outline-none"
        style={{ left: x - 8 }}
        onClick={() => onSelect(selected ? null : task)}
        aria-label={task.title}
      >
        <span
          className={`block size-4 rotate-45 border-2 transition-transform ${selected ? "scale-125" : "hover:scale-110"}`}
          style={{ backgroundColor: section.color, borderColor: section.color }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`absolute top-1.5 h-7 overflow-hidden rounded-md px-2 text-left text-[10px] leading-tight text-black/80 transition-all focus:outline-none ${selected ? "ring-2 ring-white/60 ring-offset-1 ring-offset-background" : "hover:brightness-110"}`}
      style={{
        left: left + 2,
        width,
        backgroundColor: section.color,
        opacity: selected ? 1 : 0.88,
      }}
      onClick={() => onSelect(selected ? null : task)}
      title={task.title}
    >
      <span className="line-clamp-2">{task.title}</span>
    </button>
  );
}

export function RoadmapGantt() {
  const t = useTranslations("Cosmos.roadmap");
  const locale = useLocale();
  const [doc, setDoc, resetDoc] = useRoadmapDoc();

  const origin = useMemo(() => new Date(doc.start + "T00:00:00"), [doc.start]);
  const endDate = useMemo(() => new Date(doc.end + "T00:00:00"), [doc.end]);

  const tasks = useMemo(() => {
    try {
      return resolveRoadmapTasks(doc);
    } catch {
      return [];
    }
  }, [doc]);

  const totalDays = totalRoadmapDays(doc);
  const chartW = totalDays * DAY_W;
  const today = todayDate();
  const todayIdx = dayIndex(today, origin);
  const inRange = today >= origin && today <= endDate;

  const [selected, setSelected] = useState<ResolvedTask | null>(null);
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);

  const rows = doc.sections.flatMap((section) => {
    const sectionTasks = tasks.filter((task) => task.sectionId === section.id);
    return [
      { type: "section" as const, section },
      ...sectionTasks.map((task) => ({ type: "task" as const, task })),
    ];
  });

  const bodyH = rows.reduce(
    (h, row) => h + (row.type === "section" ? SECTION_PAD + 24 : ROW_H),
    0,
  );
  const activeToday = inRange ? tasksOnDate(tasks, today) : [];

  function weekTicks(): { day: number; label: string }[] {
    const ticks: { day: number; label: string }[] = [];
    for (let d = 0; d < totalDays; d += 7) {
      const date = new Date(origin);
      date.setDate(date.getDate() + d);
      ticks.push({ day: d, label: formatShortDate(date, locale) });
    }
    return ticks;
  }

  function updateTask(id: string, patch: Partial<RoadmapTask>): void {
    setDoc((d) => ({
      ...d,
      tasks: d.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    }));
    if (selected?.id === id) {
      setSelected((s) => (s ? { ...s, ...patch } : s));
    }
  }

  function deleteTask(id: string): void {
    setDoc((d) => ({
      ...d,
      tasks: d.tasks.filter((task) => task.id !== id && task.after !== id),
    }));
    setSelected(null);
  }

  function addTask(sectionId: string): void {
    const inSection = doc.tasks.filter((task) => task.sectionId === sectionId);
    const last = inSection[inSection.length - 1];
    const id = newTaskId();
    const task: RoadmapTask = {
      id,
      sectionId,
      title: t("newTaskTitle"),
      days: 3,
      ...(last ? { after: last.id } : { startOn: doc.start }),
    };
    setDoc((d) => ({ ...d, tasks: [...d.tasks, task] }));
    setEditing(true);
  }

  return (
    <div className="space-y-4">
      <DocEditToolbar
        editing={editing}
        onToggleEdit={() => setEditing((v) => !v)}
        onReset={resetDoc}
        editLabel={t("edit")}
        doneLabel={t("doneEdit")}
        resetLabel={t("reset")}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-xs">
          {doc.sections.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.title}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatShortDate(origin, locale)} — {formatShortDate(endDate, locale)} · {totalDays}{" "}
          {t("daysShort")}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/40">
        <div style={{ minWidth: LABEL_W + chartW + 32 }}>
          <div className="flex border-b border-border/50" style={{ paddingLeft: LABEL_W }}>
            <div className="relative h-12 flex-1" style={{ width: chartW }}>
              {weekTicks().map(({ day, label }) => (
                <div
                  key={day}
                  className="absolute top-0 border-l border-border/30 pl-1 pt-2 text-[10px] text-muted-foreground"
                  style={{ left: day * DAY_W }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex">
            <div className="shrink-0 border-r border-border/50 bg-background/50" style={{ width: LABEL_W }}>
              {rows.map((row) => {
                if (row.type === "section") {
                  return (
                    <div
                      key={`label-${row.section.id}`}
                      className="flex items-end justify-between px-3 pt-2"
                      style={{ height: SECTION_PAD + 24 }}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {row.section.title}
                      </span>
                      {editing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[10px]"
                          onClick={() => addTask(row.section.id)}
                        >
                          +
                        </Button>
                      )}
                    </div>
                  );
                }
                const isSel = selected?.id === row.task.id;
                return (
                  <button
                    key={`label-${row.task.id}`}
                    type="button"
                    className={`flex w-full items-center px-3 text-left text-xs leading-snug transition-colors hover:bg-foreground/5 ${isSel ? "bg-primary/10 font-medium text-foreground" : "text-muted-foreground"}`}
                    style={{ height: ROW_H }}
                    onClick={() => setSelected(isSel ? null : row.task)}
                  >
                    <span className="line-clamp-2">{row.task.title}</span>
                  </button>
                );
              })}
            </div>

            <div
              className="relative flex-1"
              style={{ width: chartW, height: bodyH }}
              onMouseLeave={() => setHoverDay(null)}
            >
              <svg className="pointer-events-none absolute inset-0" width={chartW} height={bodyH} aria-hidden>
                {Array.from({ length: totalDays + 1 }, (_, d) => (
                  <line
                    key={d}
                    x1={d * DAY_W}
                    y1={0}
                    x2={d * DAY_W}
                    y2={bodyH}
                    stroke="currentColor"
                    strokeOpacity={d % 7 === 0 ? 0.12 : 0.04}
                  />
                ))}
                {inRange && (
                  <line
                    x1={todayIdx * DAY_W + DAY_W / 2}
                    y1={0}
                    x2={todayIdx * DAY_W + DAY_W / 2}
                    y2={bodyH}
                    stroke="#f472b6"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                  />
                )}
                {hoverDay !== null && hoverDay >= 0 && hoverDay < totalDays && (
                  <rect
                    x={hoverDay * DAY_W}
                    y={0}
                    width={DAY_W}
                    height={bodyH}
                    fill="currentColor"
                    opacity={0.06}
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex">
                {Array.from({ length: totalDays }, (_, d) => (
                  <div
                    key={d}
                    className="h-full"
                    style={{ width: DAY_W }}
                    onMouseEnter={() => setHoverDay(d)}
                  />
                ))}
              </div>

              <div className="relative">
                {rows.map((row) => {
                  if (row.type === "section") {
                    return <div key={`row-${row.section.id}`} style={{ height: SECTION_PAD + 24 }} />;
                  }
                  return (
                    <div
                      key={`row-${row.task.id}`}
                      className="relative border-b border-border/20"
                      style={{ height: ROW_H }}
                    >
                      <TaskBar
                        task={row.task}
                        sections={doc.sections}
                        totalDays={totalDays}
                        origin={origin}
                        selected={selected?.id === row.task.id}
                        onSelect={setSelected}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {selected ? t("selectedTask") : t("todayPlan")}
          </p>

          {selected && editing ? (
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">{t("fieldTitle")}</span>
                <Input
                  value={selected.title}
                  onChange={(e) => updateTask(selected.id, { title: e.target.value })}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">{t("fieldDays")}</span>
                <Input
                  type="number"
                  min={0}
                  value={selected.days}
                  onChange={(e) => updateTask(selected.id, { days: Number(e.target.value) || 0 })}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">{t("fieldSection")}</span>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={selected.sectionId}
                  onChange={(e) => updateTask(selected.id, { sectionId: e.target.value })}
                >
                  {doc.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={Boolean(selected.milestone)}
                  onChange={(e) =>
                    updateTask(selected.id, {
                      milestone: e.target.checked,
                      days: e.target.checked ? 0 : selected.days || 1,
                    })
                  }
                />
                {t("fieldMilestone")}
              </label>
              <Button type="button" variant="destructive" size="sm" onClick={() => deleteTask(selected.id)}>
                {t("deleteTask")}
              </Button>
            </div>
          ) : selected ? (
            <div className="space-y-1">
              <p className="font-medium">{selected.title}</p>
              <p className="text-muted-foreground">
                {formatShortDate(selected.start, locale)}
                {selected.milestone
                  ? ` · ${t("milestone")}`
                  : ` — ${formatShortDate(selected.end, locale)} (${selected.days} ${t("daysShort")})`}
              </p>
              <p className="text-xs text-muted-foreground">
                {sectionFor(doc.sections, selected.sectionId).title}
              </p>
            </div>
          ) : inRange && activeToday.length > 0 ? (
            <ul className="space-y-2">
              {activeToday.map((task) => (
                <li key={task.id}>
                  <button type="button" className="text-left hover:text-primary" onClick={() => setSelected(task)}>
                    {task.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              {inRange ? t("noTasksToday") : t("outOfRange")}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("contextTitle")}
          </p>
          <p className="leading-relaxed text-muted-foreground">{t("contextBody")}</p>
          {inRange && (
            <p className="mt-2 text-xs text-primary">
              {t("todayProgress", { date: formatShortDate(today, locale), day: todayIdx + 1, total: totalDays })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
