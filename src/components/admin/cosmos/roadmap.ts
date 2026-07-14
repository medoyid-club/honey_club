/** План подготовки к разработке RPG «Условный космос». */

export type RoadmapSection = {
  id: string;
  title: string;
  color: string;
};

export type RoadmapTask = {
  id: string;
  sectionId: string;
  title: string;
  days: number;
  startOn?: string;
  after?: string;
  milestone?: boolean;
};

export type RoadmapDoc = {
  start: string;
  end: string;
  sections: RoadmapSection[];
  tasks: RoadmapTask[];
};

export type ResolvedTask = RoadmapTask & {
  start: Date;
  end: Date;
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function parseDate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function resolveRoadmapTasks(doc: RoadmapDoc): ResolvedTask[] {
  const origin = parseDate(doc.start);
  const byId = new Map<string, ResolvedTask>();
  const pending = [...doc.tasks];

  while (pending.length > 0) {
    const before = pending.length;
    for (let i = pending.length - 1; i >= 0; i--) {
      const task = pending[i];
      let start: Date | null = null;

      if (task.startOn) {
        start = parseDate(task.startOn);
      } else if (task.after) {
        const dep = byId.get(task.after);
        if (!dep) continue;
        start = addDays(dep.end, 1);
      } else {
        start = origin;
      }

      const end =
        task.milestone && task.days === 0
          ? start
          : addDays(start, Math.max(task.days - 1, 0));

      byId.set(task.id, { ...task, start, end });
      pending.splice(i, 1);
    }
    if (pending.length === before) {
      throw new Error("Unresolved roadmap dependencies: " + pending.map((t) => t.id).join(", "));
    }
  }

  return doc.tasks.map((t) => byId.get(t.id)!);
}

export function dayIndex(date: Date, origin: Date): number {
  const ms = date.getTime() - origin.getTime();
  return Math.round(ms / 86_400_000);
}

export function totalRoadmapDays(doc: RoadmapDoc): number {
  const origin = parseDate(doc.start);
  const end = parseDate(doc.end);
  return dayIndex(end, origin) + 1;
}

export function formatShortDate(date: Date, locale: string): string {
  const tag = locale === "en" ? "en-US" : "ru-RU";
  return date.toLocaleDateString(tag, { day: "numeric", month: "short" });
}

export function sectionFor(sections: RoadmapSection[], id: string): RoadmapSection {
  return sections.find((s) => s.id === id)!;
}

export function tasksOnDate(tasks: ResolvedTask[], date: Date): ResolvedTask[] {
  const key = dateKey(date);
  return tasks.filter((t) => dateKey(t.start) <= key && key <= dateKey(t.end));
}

export function newTaskId(): string {
  return `t_${Date.now().toString(36)}`;
}

export function newItemId(): string {
  return `i_${Date.now().toString(36)}`;
}
