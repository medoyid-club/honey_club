// Прототип «условного космоса»: социальная стратегия, не симулятор.
// Ключевая идея: расстояние = когнитивная дистанция, а не километры.

export type WorldKind = "test" | "player" | "shared" | "expedition";

export type WorldDef = {
  id: string;
  name: string;
  kind: WorldKind;
  /** Минимальный уровень развития, на котором мир становится «посильным» */
  levelReq: number;
  /** Психотипическое различие с игроком, 0..1 */
  typeGap: number;
  /** Азимут на карте, градусы */
  angle: number;
  blurb: string;
};

export const WORLDS: WorldDef[] = [
  {
    id: "silence-range",
    name: "Полигон Тишины",
    kind: "test",
    levelReq: 1,
    typeGap: 0.05,
    angle: 15,
    blurb: "Тестовая планета для первых шагов: простые задания без свидетелей.",
  },
  {
    id: "first-garden",
    name: "Сад Первых Шагов",
    kind: "test",
    levelReq: 1,
    typeGap: 0.12,
    angle: 300,
    blurb: "Учебный мир с базовыми кооперативными ситуациями.",
  },
  {
    id: "mia",
    name: "Планета Мии",
    kind: "player",
    levelReq: 1,
    typeGap: 0.28,
    angle: 70,
    blurb: "Планета игрока схожего порога. Ритмы знакомые, но это чужой дом.",
  },
  {
    id: "repair-shop",
    name: "Мастерская Ремонта",
    kind: "shared",
    levelReq: 2,
    typeGap: 0.3,
    angle: 130,
    blurb: "Общий мир: сюда приходят чинить недопонимания и переделывать ошибки.",
  },
  {
    id: "agora",
    name: "Агора",
    kind: "shared",
    levelReq: 2,
    typeGap: 0.45,
    angle: 210,
    blurb: "Социально плотный мир. Быстрый, шумный, эмоционально прямой.",
  },
  {
    id: "goran",
    name: "Планета Горана",
    kind: "player",
    levelReq: 2,
    typeGap: 0.55,
    angle: 255,
    blurb: "Опытный игрок с жёстко структурированным миром. Требует выдержки.",
  },
  {
    id: "rift",
    name: "Экспедиция «Разлом»",
    kind: "expedition",
    levelReq: 3,
    typeGap: 0.6,
    angle: 170,
    blurb: "Кооперативная экспедиция вокруг трудной способности: конфликт без разрыва.",
  },
  {
    id: "observatory",
    name: "Обсерватория Различий",
    kind: "expedition",
    levelReq: 3,
    typeGap: 0.75,
    angle: 340,
    blurb: "Мир для встречи с радикально иными психотипами.",
  },
  {
    id: "archipelago",
    name: "Тихий Архипелаг",
    kind: "player",
    levelReq: 3,
    typeGap: 0.9,
    angle: 40,
    blurb: "Далёкое сообщество с чужими ритмами. Пока — едва различимый сигнал.",
  },
];

export type GrantId = "guide" | "cowork" | "shadow";

export const GRANT_LABELS: Record<GrantId, string> = {
  guide: "Местный гид (симбионт хоста)",
  cowork: "Совместная работа (общая способность)",
  shadow: "Ограниченная тень хоста",
};

export const HOME_CAPABILITIES = [
  "Дерево: полная память и история развития",
  "Симбионт-навигатор",
  "Симбионт-хранитель границ",
  "Симбионт-переводчик",
  "Ритуалы, рефлексия, мастерская развития",
];

export const TRAVEL_BASE_CAPABILITIES = [
  "Идентичность (сертификат Врат)",
  "Коммуникация",
  "Согласие",
  "Навигация",
  "Самозащита: выход и блокировка (неотзываемо)",
];

export type Mode =
  | { type: "home" }
  | { type: "travel"; worldId: string; grants: GrantId[]; pendingEvents: string[] };

export type LogEntry = { at: number; text: string };

export type CosmosState = {
  level: number;
  xp: number;
  /** Когерентность 0..100: ресурс «внешнего» режима, восстанавливается дома */
  coherence: number;
  /** Доверие между мирами, worldId -> 0..1 */
  trust: Record<string, number>;
  mode: Mode;
  log: LogEntry[];
};

export const INITIAL_STATE: CosmosState = {
  level: 1,
  xp: 0,
  coherence: 80,
  trust: {},
  mode: { type: "home" },
  log: [{ at: Date.now(), text: "Врата пройдены. Родилась ваша первая планета." }],
};

export const LEVEL_THRESHOLDS = [0, 100, 220];

export function levelForXp(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Когнитивная дистанция до мира: уровень + психотип − доверие */
export function worldDistance(state: CosmosState, world: WorldDef): number {
  const levelGap = Math.max(0, world.levelReq - state.level) * 0.22;
  const typeGap = world.typeGap * 0.55;
  const trustBonus = (state.trust[world.id] ?? 0) * 0.35;
  return clamp01(0.12 + levelGap + typeGap - trustBonus);
}

/** Радиус горизонта восприятия: растёт с уровнем, сужается при низкой когерентности */
export function horizonRadius(state: CosmosState): number {
  const byLevel = [0.42, 0.68, 0.95][Math.min(state.level, 3) - 1];
  const byCoherence = 0.75 + 0.25 * (state.coherence / 100);
  return clamp01(byLevel * byCoherence);
}

/** Без ракеты доступна только местная орбита */
export const LOCAL_ORBIT = 0.38;

export function hasRocket(state: CosmosState): boolean {
  return state.level >= 2;
}

export function travelCost(distance: number): number {
  return Math.round(12 + distance * 35);
}

export type TravelCheck = { ok: true } | { ok: false; reason: string };

export function canTravel(state: CosmosState, world: WorldDef): TravelCheck {
  const dist = worldDistance(state, world);
  if (state.mode.type !== "home") return { ok: false, reason: "Вы уже в пути." };
  if (dist > horizonRadius(state))
    return { ok: false, reason: "Мир за горизонтом восприятия — сначала развитие дома." };
  if (dist > LOCAL_ORBIT && !hasRocket(state))
    return { ok: false, reason: "Нужна ракета (уровень 2): это за пределами местной орбиты." };
  if (state.coherence < travelCost(dist))
    return { ok: false, reason: "Не хватает когерентности — отдохните дома." };
  return { ok: true };
}

function log(state: CosmosState, text: string): CosmosState {
  return { ...state, log: [{ at: Date.now(), text }, ...state.log].slice(0, 30) };
}

export function rest(state: CosmosState): CosmosState {
  if (state.mode.type !== "home") return state;
  return log(
    { ...state, coherence: Math.min(100, state.coherence + 30) },
    "Отдых дома: волновая функция снова расправилась (+30 когерентности)."
  );
}

export function localQuest(state: CosmosState): CosmosState {
  if (state.mode.type !== "home" || state.coherence < 10) return state;
  const next = applyXp({ ...state, coherence: state.coherence - 10, xp: state.xp + 18 });
  return log(next, "Локальный квест на своей планете: +18 опыта.");
}

export function depart(state: CosmosState, world: WorldDef): CosmosState {
  const check = canTravel(state, world);
  if (!check.ok) return state;
  const cost = travelCost(worldDistance(state, world));
  return log(
    {
      ...state,
      coherence: state.coherence - cost,
      mode: { type: "travel", worldId: world.id, grants: [], pendingEvents: [] },
    },
    `Старт к «${world.name}». Мембрана сужена до базовых пяти способностей (−${cost}).`
  );
}

export function acceptGuide(state: CosmosState): CosmosState {
  if (state.mode.type !== "travel" || state.mode.grants.includes("guide")) return state;
  return log(
    {
      ...state,
      coherence: Math.max(0, state.coherence - 5),
      mode: { ...state.mode, grants: [...state.mode.grants, "guide"] },
    },
    "Хост выдал грант: местный гид показывает лаконичные тропы этого мира."
  );
}

export function coWork(state: CosmosState): CosmosState {
  if (state.mode.type !== "travel" || state.coherence < 15) return state;
  const worldId = state.mode.worldId;
  const trust = Math.min(1, (state.trust[worldId] ?? 0) + 0.09);
  const grants = state.mode.grants.includes("cowork")
    ? state.mode.grants
    : [...state.mode.grants, "cowork" as GrantId];
  return log(
    {
      ...state,
      coherence: state.coherence - 15,
      trust: { ...state.trust, [worldId]: trust },
      mode: {
        ...state.mode,
        grants,
        pendingEvents: [...state.mode.pendingEvents, "Совместная работа"],
      },
    },
    "Совместная работа завершена: доверие между мирами выросло (−15 когерентности)."
  );
}

export function requestShadow(state: CosmosState): CosmosState {
  if (state.mode.type !== "travel" || state.mode.grants.includes("shadow")) return state;
  const trust = state.trust[state.mode.worldId] ?? 0;
  if (trust < 0.15) {
    return log(state, "Хост отклонил запрос тени: доверие ещё слишком мало.");
  }
  return log(
    {
      ...state,
      mode: {
        ...state.mode,
        grants: [...state.mode.grants, "shadow"],
        pendingEvents: [...state.mode.pendingEvents, "Получена ограниченная тень"],
      },
    },
    "Хост показал ограниченную тень: вы видите чуть больше, но не внутреннее поле."
  );
}

export function returnHome(state: CosmosState): CosmosState {
  if (state.mode.type !== "travel") return state;
  const events = state.mode.pendingEvents;
  const gained = events.length * 14;
  const next = applyXp({
    ...state,
    xp: state.xp + gained,
    mode: { type: "home" },
  });
  const text =
    events.length > 0
      ? `Возвращение домой. Дерево интегрировало ${events.length} событ.: +${gained} опыта.`
      : "Возвращение домой без новых событий. Центр сохранён.";
  return log(next, text);
}

function applyXp(state: CosmosState): CosmosState {
  const newLevel = levelForXp(state.xp);
  if (newLevel <= state.level) return state;
  let next: CosmosState = { ...state, level: newLevel };
  next = log(next, `Порог пройден: уровень ${newLevel}. Горизонт восприятия расширился.`);
  if (newLevel === 2) {
    next = log(next, "Получена ракета: доступны миры за пределами местной орбиты.");
  }
  return next;
}
