export type CourseLevel = "Начальный" | "Средний" | "Продвинутый";

export type CourseFormat = "Курс" | "Лекция" | "Семинар";

export type Course = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  author: string;
  format: CourseFormat;
  level: CourseLevel;
  durationHours: number;
  lessons: number;
  priceRub: number;
  tags: string[];
};

export const courses: Course[] = [
  {
    slug: "osnovy-samopoznaniya",
    title: "Основы самопознания",
    summary:
      "Базовый курс о типах личности, сильных сторонах и зонах роста.",
    description:
      "Вводный курс, с которого начинается путь в Honey Club. Разбираем модели личности, учимся определять свой темперамент, ценности и цели. К концу курса вы соберёте первый профиль персонажа «Я».",
    author: "Анна Светлова",
    format: "Курс",
    level: "Начальный",
    durationHours: 12,
    lessons: 18,
    priceRub: 4900,
    tags: ["личность", "саморазвитие", "старт"],
  },
  {
    slug: "kommunikatsiya-i-empatiya",
    title: "Коммуникация и эмпатия",
    summary: "Как слышать других и быть услышанным в любом контексте.",
    description:
      "Практический курс о навыках общения: активное слушание, эмпатия, управление конфликтами и построение доверия. Много упражнений и разборов реальных ситуаций.",
    author: "Игорь Дронов",
    format: "Курс",
    level: "Средний",
    durationHours: 16,
    lessons: 24,
    priceRub: 6900,
    tags: ["общение", "эмпатия", "софт-скиллы"],
  },
  {
    slug: "strategiya-i-tseli",
    title: "Стратегия и цели",
    summary: "Постановка целей, приоритеты и личная стратегия развития.",
    description:
      "Семинар о том, как ставить достижимые цели и выстраивать стратегию жизни и карьеры. Разберём методики планирования и научимся отслеживать прогресс.",
    author: "Мария Кольцова",
    format: "Семинар",
    level: "Средний",
    durationHours: 8,
    lessons: 10,
    priceRub: 5400,
    tags: ["цели", "стратегия", "планирование"],
  },
  {
    slug: "liderstvo-i-komandy",
    title: "Лидерство и команды",
    summary: "Роли в команде, мотивация и совместное достижение результата.",
    description:
      "Продвинутый курс для тех, кто ведёт за собой. Изучаем командные роли, мотивацию, делегирование и здоровую обратную связь.",
    author: "Сергей Орлов",
    format: "Курс",
    level: "Продвинутый",
    durationHours: 20,
    lessons: 28,
    priceRub: 9900,
    tags: ["лидерство", "команда", "бизнес"],
  },
  {
    slug: "vvedenie-v-igrovye-mehaniki",
    title: "Введение в игровые механики",
    summary: "Открытая лекция о геймификации обучения и развития.",
    description:
      "Бесплатная вводная лекция о том, как игровые механики помогают учиться и расти. Заглянем за кулисы будущей социальной RPG-карты Honey Club.",
    author: "Команда Honey Club",
    format: "Лекция",
    level: "Начальный",
    durationHours: 2,
    lessons: 1,
    priceRub: 0,
    tags: ["геймификация", "rpg", "введение"],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function formatPrice(priceRub: number): string {
  if (priceRub === 0) return "Бесплатно";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(priceRub);
}
