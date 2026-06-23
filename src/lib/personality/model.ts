export type AxisKey = "ext" | "opn" | "con" | "agr" | "sta" | "dom" | "rec" | "enr";

export type Axes = Record<AxisKey, number>;

export const AXIS_KEYS: AxisKey[] = [
  "ext",
  "opn",
  "con",
  "agr",
  "sta",
  "dom",
  "rec",
  "enr",
];

export type RadicalId =
  | "isteroid"
  | "gipertim"
  | "shizoid"
  | "epileptoid"
  | "paranoyal"
  | "emotiv"
  | "trevozhny";

export type Radical = {
  id: RadicalId;
  axes: Axes;
};

export const RADICALS: Radical[] = [
  {
    id: "isteroid",
    axes: { ext: 85, opn: 70, con: 35, agr: 55, sta: 35, dom: 60, rec: 95, enr: 75 },
  },
  {
    id: "gipertim",
    axes: { ext: 95, opn: 75, con: 30, agr: 75, sta: 80, dom: 55, rec: 55, enr: 95 },
  },
  {
    id: "shizoid",
    axes: { ext: 20, opn: 95, con: 55, agr: 35, sta: 55, dom: 35, rec: 20, enr: 35 },
  },
  {
    id: "epileptoid",
    axes: { ext: 35, opn: 30, con: 95, agr: 35, sta: 65, dom: 75, rec: 35, enr: 55 },
  },
  {
    id: "paranoyal",
    axes: { ext: 65, opn: 55, con: 85, agr: 30, sta: 80, dom: 95, rec: 55, enr: 80 },
  },
  {
    id: "emotiv",
    axes: { ext: 45, opn: 70, con: 60, agr: 95, sta: 45, dom: 30, rec: 45, enr: 45 },
  },
  {
    id: "trevozhny",
    axes: { ext: 30, opn: 55, con: 80, agr: 70, sta: 25, dom: 30, rec: 50, enr: 35 },
  },
];

export type StatId =
  | "intellect"
  | "charisma"
  | "pressure"
  | "armor"
  | "ward"
  | "vitality"
  | "agility"
  | "initiative";

export const STAT_IDS: StatId[] = [
  "intellect",
  "charisma",
  "pressure",
  "armor",
  "ward",
  "vitality",
  "agility",
  "initiative",
];

const STAT_FORMULAS: Record<StatId, (a: Axes) => number> = {
  intellect: (a) => 0.45 * a.opn + 0.35 * a.con + 0.2 * a.sta,
  charisma: (a) => 0.45 * a.ext + 0.35 * a.rec + 0.2 * a.dom,
  pressure: (a) => 0.6 * a.dom + 0.4 * a.enr,
  armor: (a) => 0.6 * a.sta + 0.4 * (100 - a.rec),
  ward: (a) => 0.5 * a.sta + 0.3 * a.con + 0.2 * (100 - a.rec),
  vitality: (a) => 0.5 * a.sta + 0.3 * a.enr + 0.2 * a.agr,
  agility: (a) => 0.5 * a.ext + 0.3 * a.opn + 0.2 * (100 - a.con),
  initiative: (a) => 0.5 * a.enr + 0.3 * a.ext + 0.2 * a.dom,
};

export type ItemId = "none" | "plato" | "aristotle" | "dionysus" | "stoic";

export type Item = {
  id: ItemId;
  mods: Partial<Record<StatId, number>>;
};

export const ITEMS: Item[] = [
  { id: "none", mods: {} },
  { id: "plato", mods: { ward: 18, intellect: 12, charisma: -10 } },
  { id: "aristotle", mods: { intellect: 15, armor: 10, ward: 8 } },
  { id: "dionysus", mods: { charisma: 18, initiative: 10, armor: -12 } },
  { id: "stoic", mods: { armor: 20, ward: 12, charisma: -8 } },
];

export type GoalId = "work" | "friendship" | "relationship";

export type SynKey =
  | "creativity"
  | "tempo"
  | "stability"
  | "empathy"
  | "complement"
  | "conflict";

export const SYN_KEYS: SynKey[] = [
  "creativity",
  "tempo",
  "stability",
  "empathy",
  "complement",
  "conflict",
];

export const GOAL_IDS: GoalId[] = ["work", "friendship", "relationship"];

export const GOAL_SYN_KEYS: Record<GoalId, SynKey[]> = {
  work: ["stability", "complement", "creativity"],
  friendship: ["tempo", "complement", "empathy"],
  relationship: ["stability", "empathy", "complement"],
};

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function getRadicalById(id: string): Radical {
  return RADICALS.find((r) => r.id === id) ?? RADICALS[0];
}

export function getItemById(id: string): Item {
  return ITEMS.find((i) => i.id === id) ?? ITEMS[0];
}

export type ComputedStat = {
  id: StatId;
  base: number;
  delta: number;
  value: number;
};

export function computeStats(axes: Axes, item: Item): ComputedStat[] {
  return STAT_IDS.map((id) => {
    const base = clamp(STAT_FORMULAS[id](axes));
    const delta = item.mods[id] ?? 0;
    return { id, base, delta, value: clamp(base + delta) };
  });
}

export type SynergyVector = Record<SynKey, number>;

export function computeSynergy(a: Axes, b: Axes): SynergyVector {
  const avg = (k: AxisKey) => (a[k] + b[k]) / 2;
  const diff = (k: AxisKey) => Math.abs(a[k] - b[k]);
  const diversity = AXIS_KEYS.reduce((sum, key) => sum + diff(key), 0) / AXIS_KEYS.length;

  return {
    creativity: clamp(0.6 * avg("opn") + 0.4 * diversity),
    tempo: clamp(0.5 * avg("enr") + 0.5 * avg("ext")),
    stability: clamp(0.5 * avg("con") + 0.5 * avg("sta")),
    empathy: clamp(avg("agr")),
    complement: clamp(100 - Math.abs(diversity - 45) * 1.6),
    conflict: clamp(
      0.35 * avg("rec") + 0.35 * avg("dom") + 0.3 * (100 - avg("agr")) - 0.2 * avg("sta")
    ),
  };
}
