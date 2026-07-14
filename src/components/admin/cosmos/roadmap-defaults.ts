import type { RoadmapDoc } from "./roadmap";

type SectionDef = {
  id: string;
  color: string;
  titleRu: string;
  titleEn: string;
};

type TaskDef = {
  id: string;
  sectionId: string;
  titleRu: string;
  titleEn: string;
  days: number;
  startOn?: string;
  after?: string;
  milestone?: boolean;
};

const SECTION_DEFS: SectionDef[] = [
  { id: "market", color: "#7dd3fc", titleRu: "Анализ рынка и аудитории", titleEn: "Market & audience analysis" },
  {
    id: "business",
    color: "#a78bfa",
    titleRu: "Бизнес-план и модель устойчивости",
    titleEn: "Business plan & sustainability model",
  },
  { id: "design", color: "#fbbf24", titleRu: "Дизайн и концепт игры", titleEn: "Game design & concept" },
  { id: "twm", color: "#34d399", titleRu: "TWM-архитектура", titleEn: "TWM architecture" },
  {
    id: "legal",
    color: "#fb7185",
    titleRu: "Юридические и этические вопросы",
    titleEn: "Legal & ethical considerations",
  },
  {
    id: "tech",
    color: "#60a5fa",
    titleRu: "Техническая проверка концепции",
    titleEn: "Technical concept validation",
  },
  { id: "ready", color: "#f472b6", titleRu: "Готовность к разработке", titleEn: "Development readiness" },
];

const TASK_DEFS: TaskDef[] = [
  {
    id: "a1",
    sectionId: "market",
    titleRu: "Анализ конкурентов (RPG самопознания, кооп-игры, псих. типирование)",
    titleEn: "Competitor analysis (self-discovery RPG, co-op games, psychotyping)",
    days: 5,
    startOn: "2026-07-13",
  },
  {
    id: "a2",
    sectionId: "market",
    titleRu: "Анализ целевой аудитории и сегментов игроков",
    titleEn: "Target audience & player segment analysis",
    days: 4,
    after: "a1",
  },
  {
    id: "a3",
    sectionId: "market",
    titleRu: "Валидация спроса (интервью, опросы, тестовые концепты)",
    titleEn: "Demand validation (interviews, surveys, test concepts)",
    days: 5,
    after: "a2",
  },
  {
    id: "b1",
    sectionId: "business",
    titleRu: "Модель монетизации без эксплуатации внимания",
    titleEn: "Monetization model without attention exploitation",
    days: 4,
    after: "a3",
  },
  {
    id: "b2",
    sectionId: "business",
    titleRu: "Финансовая модель и бюджет разработки",
    titleEn: "Financial model & development budget",
    days: 4,
    after: "b1",
  },
  {
    id: "b3",
    sectionId: "business",
    titleRu: "План привлечения финансирования / грантов",
    titleEn: "Funding / grant acquisition plan",
    days: 3,
    after: "b2",
  },
  {
    id: "c1",
    sectionId: "design",
    titleRu: "GDD: Врата, Древо, Сосуд, Дистанция как близость",
    titleEn: "GDD: Gates, Tree, Vessel, Distance as closeness",
    days: 6,
    startOn: "2026-07-13",
  },
  {
    id: "c2",
    sectionId: "design",
    titleRu: "Прогрессия и награды (без дофаминовой эксплуатации)",
    titleEn: "Progression & rewards (without dopamine exploitation)",
    days: 4,
    after: "c1",
  },
  {
    id: "c3",
    sectionId: "design",
    titleRu: "Социальные механики и границы приватности",
    titleEn: "Social mechanics & privacy boundaries",
    days: 4,
    after: "c2",
  },
  {
    id: "d1",
    sectionId: "twm",
    titleRu: "Таблица авторитетов для профиля / Древа игрока",
    titleEn: "Authority table for player profile / Tree",
    days: 4,
    startOn: "2026-07-13",
  },
  {
    id: "d2",
    sectionId: "twm",
    titleRu: "Прогон игры через Канонические Тесты TWM",
    titleEn: "Run game through TWM Canonical Tests",
    days: 5,
    after: "d1",
  },
  {
    id: "d3",
    sectionId: "twm",
    titleRu: "OPM-модель (Врата, Древо, Аватар, Сосуд)",
    titleEn: "OPM model (Gates, Tree, Avatar, Vessel)",
    days: 5,
    after: "d2",
  },
  {
    id: "e1",
    sectionId: "legal",
    titleRu: "Защита данных и цифровой суверенитет игрока",
    titleEn: "Data protection & player digital sovereignty",
    days: 4,
    after: "c3",
  },
  {
    id: "e2",
    sectionId: "legal",
    titleRu: "Возрастной рейтинг и этика психотипирования",
    titleEn: "Age rating & ethics of psychotyping",
    days: 3,
    after: "e1",
  },
  {
    id: "e3",
    sectionId: "legal",
    titleRu: "Черновик соглашения и политики приватности",
    titleEn: "Draft agreement & privacy policy",
    days: 3,
    after: "e2",
  },
  {
    id: "f1",
    sectionId: "tech",
    titleRu: "Оценка стека (Janet/GP, локальный клиент)",
    titleEn: "Stack assessment (Janet/GP, local client)",
    days: 3,
    after: "d3",
  },
  {
    id: "f2",
    sectionId: "tech",
    titleRu: "PoC: рождение Врат и первого Древа",
    titleEn: "PoC: birth of Gates and first Tree",
    days: 5,
    after: "f1",
  },
  {
    id: "g1",
    sectionId: "ready",
    titleRu: "Сведение бизнес-плана, дизайна и архитектуры",
    titleEn: "Consolidate business plan, design, and architecture",
    days: 3,
    after: "e3",
  },
  {
    id: "g2",
    sectionId: "ready",
    titleRu: "Питч / презентация для стейкхолдеров",
    titleEn: "Pitch / presentation for stakeholders",
    days: 2,
    after: "g1",
  },
  {
    id: "g3",
    sectionId: "ready",
    titleRu: "Запуск разработки",
    titleEn: "Development launch",
    days: 0,
    after: "f2",
    milestone: true,
  },
];

export function getRoadmapDefaults(locale: string): RoadmapDoc {
  const en = locale === "en";

  return {
    start: "2026-07-13",
    end: "2026-08-23",
    sections: SECTION_DEFS.map((s) => ({
      id: s.id,
      color: s.color,
      title: en ? s.titleEn : s.titleRu,
    })),
    tasks: TASK_DEFS.map((t) => ({
      id: t.id,
      sectionId: t.sectionId,
      title: en ? t.titleEn : t.titleRu,
      days: t.days,
      ...(t.startOn ? { startOn: t.startOn } : {}),
      ...(t.after ? { after: t.after } : {}),
      ...(t.milestone ? { milestone: t.milestone } : {}),
    })),
  };
}
