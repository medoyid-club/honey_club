import type { BmcBlock, BmcDoc, BmcItem, BmcLink } from "./business-model";

type ItemDef = {
  id: string;
  textRu: string;
  textEn: string;
  status?: BmcItem["status"];
};

type BlockDef = {
  id: BmcBlock["id"];
  titleRu: string;
  titleEn: string;
  subtitleRu: string;
  subtitleEn: string;
  items: ItemDef[];
};

type LinkDef = {
  from: BmcLink["from"];
  to: BmcLink["to"];
  labelRu: string;
  labelEn: string;
};

const META = {
  productRu: "RPG «Условный космос»",
  productEn: 'RPG "Conditional Cosmos"',
  versionRu: "0.1 — черновик подготовительной фазы",
  versionEn: "0.1 — preparatory phase draft",
  updated: "2026-07-14",
  noteRu:
    "Курсы, оплата обучения и авторский контент Honey Club в эту канву не входят — это параллельная бизнес-модель платформы. Игра может получать органический трафик от школы, но монетизация и ценность описаны здесь автономно.",
  noteEn:
    "Honey Club courses, learning payments, and author content are not part of this canvas — that is a parallel business model for the platform. The game may receive organic traffic from the school, but monetization and value are described here autonomously.",
};

const BLOCK_DEFS: BlockDef[] = [
  {
    id: "partners",
    titleRu: "Ключевые партнёры",
    titleEn: "Key partners",
    subtitleRu: "Кто помогает создавать и распространять ценность",
    subtitleEn: "Who helps create and distribute value",
    items: [
      {
        id: "p1",
        textRu: "Сообщество TWM — методологическая экспертиза, канонические тесты",
        textEn: "TWM community — methodological expertise, canonical tests",
        status: "hypothesis",
      },
      {
        id: "p2",
        textRu: "Honey Club (технический мост): единый аккаунт, без слияния бизнес-моделей",
        textEn: "Honey Club (technical bridge): single account, without merging business models",
        status: "hypothesis",
      },
      {
        id: "p3",
        textRu: "Open-source экосистема Janet/GP — локальный клиент, без vendor lock-in",
        textEn: "Janet/GP open-source ecosystem — local client, no vendor lock-in",
        status: "hypothesis",
      },
      {
        id: "p4",
        textRu: "Юридические / privacy-консультанты — GDPR, этика психотипирования",
        textEn: "Legal / privacy consultants — GDPR, ethics of psychotyping",
        status: "deferred",
      },
      {
        id: "p5",
        textRu: "Грантовые и культурные фонды (некоммерческий контур)",
        textEn: "Grant and cultural foundations (non-commercial track)",
        status: "hypothesis",
      },
      {
        id: "p6",
        textRu: "Playtest-сообщества: кооп-игроки, фасилитаторы групповой рефлексии",
        textEn: "Playtest communities: co-op players, group reflection facilitators",
        status: "hypothesis",
      },
    ],
  },
  {
    id: "activities",
    titleRu: "Ключевые виды деятельности",
    titleEn: "Key activities",
    subtitleRu: "Что команда делает каждый день",
    subtitleEn: "What the team does every day",
    items: [
      {
        id: "a1",
        textRu: "Геймдизайн: Врата → Древо → Сосуд, дистанция как близость",
        textEn: "Game design: Gates → Tree → Vessel, distance as closeness",
        status: "hypothesis",
      },
      {
        id: "a2",
        textRu: "TWM-валидация: прогон механик через канонические тесты",
        textEn: "TWM validation: run mechanics through canonical tests",
        status: "hypothesis",
      },
      {
        id: "a3",
        textRu: "Разработка локального клиента (Janet/GP PoC → MVP)",
        textEn: "Local client development (Janet/GP PoC → MVP)",
        status: "hypothesis",
      },
      {
        id: "a4",
        textRu: "Проектирование этичной монетизации (без эксплуатации внимания)",
        textEn: "Designing ethical monetization (without attention exploitation)",
        status: "hypothesis",
      },
      {
        id: "a5",
        textRu: "Playtesting с сегментами: рефлексивные игроки, кооп-пары",
        textEn: "Playtesting with segments: reflective players, co-op pairs",
        status: "deferred",
      },
      {
        id: "a6",
        textRu: "Модерация границ приватности и consent-механик travel",
        textEn: "Moderating privacy boundaries and travel consent mechanics",
        status: "deferred",
      },
    ],
  },
  {
    id: "resources",
    titleRu: "Ключевые ресурсы",
    titleEn: "Key resources",
    subtitleRu: "Активы, без которых модель не работает",
    subtitleEn: "Assets without which the model cannot work",
    items: [
      {
        id: "r1",
        textRu: "IP: OPM-модель (Врата, Древо, Аватар, Сосуд) + карта условного космоса",
        textEn: "IP: OPM model (Gates, Tree, Avatar, Vessel) + conditional cosmos map",
        status: "validated",
      },
      {
        id: "r2",
        textRu: "TWM-архитектура профиля: иммутабельные тесты → проекции, не ярлык-клетка",
        textEn: "TWM profile architecture: immutable tests → projections, not a label cage",
        status: "validated",
      },
      {
        id: "r3",
        textRu: "Команда: геймдизайн + TWM + локальный стек (Janet/GP)",
        textEn: "Team: game design + TWM + local stack (Janet/GP)",
        status: "hypothesis",
      },
      {
        id: "r4",
        textRu: "Прототип в sandbox: игровой цикл дом / путешествие / интеграция",
        textEn: "Sandbox prototype: home / travel / integration game loop",
        status: "validated",
      },
      {
        id: "r5",
        textRu: "Репутация этичного продукта: no dark patterns, цифровой суверенитет",
        textEn: "Reputation as an ethical product: no dark patterns, digital sovereignty",
        status: "hypothesis",
      },
      {
        id: "r6",
        textRu: "Минимальная инфраструктура: локальные данные, опциональный sync",
        textEn: "Minimal infrastructure: local data, optional sync",
        status: "hypothesis",
      },
    ],
  },
  {
    id: "value",
    titleRu: "Ценностное предложение",
    titleEn: "Value proposition",
    subtitleRu: "Какую проблему решаем и что получает игрок",
    subtitleEn: "What problem we solve and what the player gets",
    items: [
      {
        id: "v1",
        textRu: "RPG самопознания: рост через встречу с «другим», а не через grind и conquest",
        textEn: "Self-discovery RPG: growth through meeting the \"other\", not through grind and conquest",
        status: "hypothesis",
      },
      {
        id: "v2",
        textRu: "Персональная карта мира: дистанция = когнитивная близость, не километры",
        textEn: "Personal world map: distance = cognitive closeness, not kilometers",
        status: "validated",
      },
      {
        id: "v3",
        textRu: "Безопасное путешествие: consent, гранты хоста, право выхода без отзыва",
        textEn: "Safe travel: consent, host grants, right to leave without revocation",
        status: "hypothesis",
      },
      {
        id: "v4",
        textRu: "Профиль — не диагноз и не социальный ранг, а текущая осанка (posture)",
        textEn: "Profile is not a diagnosis or social rank, but current posture",
        status: "validated",
      },
      {
        id: "v5",
        textRu: "Кооператив без PvP-токсичности: совместная работа снижает дистанцию",
        textEn: "Co-op without PvP toxicity: joint work reduces distance",
        status: "hypothesis",
      },
      {
        id: "v6",
        textRu: "Игра, которая не крадёт внимание: нет lootbox, streak-шантажа, FOMO-механик",
        textEn: "A game that does not steal attention: no loot boxes, streak shaming, or FOMO mechanics",
        status: "hypothesis",
      },
    ],
  },
  {
    id: "segments",
    titleRu: "Потребительские сегменты",
    titleEn: "Customer segments",
    subtitleRu: "Для кого создаём игру (приоритет сверху вниз)",
    subtitleEn: "Who we build the game for (priority top to bottom)",
    items: [
      {
        id: "s1",
        textRu: "Ядро: люди 25–45, интерес к самопознанию и кооп-играм, устали от exploitative F2P",
        textEn: "Core: people 25–45, interested in self-discovery and co-op games, tired of exploitative F2P",
        status: "hypothesis",
      },
      {
        id: "s2",
        textRu: "Рефлексивные одиночки: хотят «мир для практики», не MMO-хаос",
        textEn: "Reflective solo players: want a \"world for practice\", not MMO chaos",
        status: "hypothesis",
      },
      {
        id: "s3",
        textRu: "Пары / малые группы: дружба, отношения, совместное развитие через кооп-квесты",
        textEn: "Pairs / small groups: friendship, relationships, joint growth through co-op quests",
        status: "hypothesis",
      },
      {
        id: "s4",
        textRu: "Выпускники / участники Honey Club — органический, не обязательный вход",
        textEn: "Honey Club graduates / participants — organic, non-mandatory entry",
        status: "deferred",
      },
      {
        id: "s5",
        textRu: "Фасилитаторы TWM / групповых практик — B2B2C через guided sessions",
        textEn: "TWM / group practice facilitators — B2B2C through guided sessions",
        status: "deferred",
      },
    ],
  },
  {
    id: "relations",
    titleRu: "Отношения с клиентами",
    titleEn: "Customer relationships",
    subtitleRu: "Как строим связь с игроками",
    subtitleEn: "How we build relationships with players",
    items: [
      {
        id: "rel1",
        textRu: "Self-service: игрок управляет своим Древом, границами и travel-consent",
        textEn: "Self-service: player manages their Tree, boundaries, and travel consent",
        status: "hypothesis",
      },
      {
        id: "rel2",
        textRu: "Co-creation: shared worlds и экспедиции — совместное создание смысла",
        textEn: "Co-creation: shared worlds and expeditions — joint meaning-making",
        status: "hypothesis",
      },
      {
        id: "rel3",
        textRu: "Доверие через прозрачность: видно, что видит хост; тень — только по grant",
        textEn: "Trust through transparency: visible what the host sees; shadow only by grant",
        status: "hypothesis",
      },
      {
        id: "rel4",
        textRu: "Медленное сообщество: Discord/Telegram, без алгоритмической ленты",
        textEn: "Slow community: Discord/Telegram, without an algorithmic feed",
        status: "deferred",
      },
      {
        id: "rel5",
        textRu: "Поддержка через документацию и этический FAQ, не через pressure-support",
        textEn: "Support through documentation and ethical FAQ, not pressure-support",
        status: "deferred",
      },
    ],
  },
  {
    id: "channels",
    titleRu: "Каналы",
    titleEn: "Channels",
    subtitleRu: "Как игрок узнаёт, пробует и получает продукт",
    subtitleEn: "How the player discovers, tries, and receives the product",
    items: [
      {
        id: "ch1",
        textRu: "Локальный клиент (desktop → mobile): скачивание, offline-first",
        textEn: "Local client (desktop → mobile): download, offline-first",
        status: "hypothesis",
      },
      {
        id: "ch2",
        textRu: "Landing / сайт игры — отдельно от каталога курсов",
        textEn: "Landing / game site — separate from the course catalog",
        status: "hypothesis",
      },
      {
        id: "ch3",
        textRu: "Sandbox-прототип и devblog — ранние последователи",
        textEn: "Sandbox prototype and devblog — early adopters",
        status: "validated",
      },
      {
        id: "ch4",
        textRu: "itch.io / early access — нишевый релиз без App Store давления",
        textEn: "itch.io / early access — niche release without App Store pressure",
        status: "deferred",
      },
      {
        id: "ch5",
        textRu: "Cross-promo Honey Club — вторичный канал, не core",
        textEn: "Honey Club cross-promo — secondary channel, not core",
        status: "deferred",
      },
      {
        id: "ch6",
        textRu: "Конференции, TWM-сообщество, сарафанное радио",
        textEn: "Conferences, TWM community, word of mouth",
        status: "deferred",
      },
    ],
  },
  {
    id: "costs",
    titleRu: "Структура издержек",
    titleEn: "Cost structure",
    subtitleRu: "Главные статьи расходов (bootstrapped MVP)",
    subtitleEn: "Main expense items (bootstrapped MVP)",
    items: [
      {
        id: "c1",
        textRu: "Разработка: геймдизайн + локальный клиент (Janet/GP) — основная статья",
        textEn: "Development: game design + local client (Janet/GP) — main expense",
        status: "hypothesis",
      },
      {
        id: "c2",
        textRu: "Юридика и compliance: privacy, возрастной рейтинг, этика типирования",
        textEn: "Legal and compliance: privacy, age rating, ethics of typing",
        status: "deferred",
      },
      {
        id: "c3",
        textRu: "Минимальный хостинг / sync (если нужен) — не тяжёлый MMO-бэкенд",
        textEn: "Minimal hosting / sync (if needed) — not a heavy MMO backend",
        status: "hypothesis",
      },
      {
        id: "c4",
        textRu: "Community moderation (лёгкая) — жалобы, блокировки, антиспam",
        textEn: "Community moderation (light) — reports, blocks, anti-spam",
        status: "deferred",
      },
      {
        id: "c5",
        textRu: "Без paid UA на старте — органический рост и playtests",
        textEn: "No paid UA at launch — organic growth and playtests",
        status: "hypothesis",
      },
      {
        id: "c6",
        textRu: "Контент миров (квесты, NPC-ситуации) — авторский труд, не видеопродакшн",
        textEn: "World content (quests, NPC situations) — author labor, not video production",
        status: "hypothesis",
      },
    ],
  },
  {
    id: "revenue",
    titleRu: "Потоки доходов",
    titleEn: "Revenue streams",
    subtitleRu: "Как игра зарабатывает без эксплуатации внимания",
    subtitleEn: "How the game earns without attention exploitation",
    items: [
      {
        id: "rev1",
        textRu: "Базовая игра — бесплатно / pay-what-you-want (ядро доступно всем)",
        textEn: "Base game — free / pay-what-you-want (core available to everyone)",
        status: "hypothesis",
      },
      {
        id: "rev2",
        textRu: "Подписка на sync/backup/облачные сохранения — не pay-to-win",
        textEn: "Subscription for sync/backup/cloud saves — not pay-to-win",
        status: "hypothesis",
      },
      {
        id: "rev3",
        textRu: "Донаты / Patreon / «поддержать Древо» — добровольная модель",
        textEn: "Donations / Patreon / \"support the Tree\" — voluntary model",
        status: "hypothesis",
      },
      {
        id: "rev4",
        textRu: "Косметика Аватара и ритуалов — без gameplay advantage",
        textEn: "Avatar and ritual cosmetics — without gameplay advantage",
        status: "deferred",
      },
      {
        id: "rev5",
        textRu: "Гранты и некоммерческое финансирование — параллельный поток",
        textEn: "Grants and non-commercial funding — parallel stream",
        status: "hypothesis",
      },
      {
        id: "rev6",
        textRu: "❌ Нет: реклама, lootbox, battle pass, streak-штрафы, продажа профиля",
        textEn: "❌ No: ads, loot boxes, battle pass, streak penalties, selling profile data",
        status: "validated",
      },
    ],
  },
];

const LINK_DEFS: LinkDef[] = [
  { from: "segments", to: "value", labelRu: "проблема → решение", labelEn: "problem → solution" },
  { from: "value", to: "relations", labelRu: "ценность → опыт", labelEn: "value → experience" },
  { from: "channels", to: "segments", labelRu: "доставка → аудитория", labelEn: "delivery → audience" },
  { from: "activities", to: "value", labelRu: "деятельность → продукт", labelEn: "activities → product" },
  { from: "resources", to: "activities", labelRu: "ресурсы → работа", labelEn: "resources → work" },
  { from: "partners", to: "resources", labelRu: "партнёры → ресурсы", labelEn: "partners → resources" },
  { from: "revenue", to: "segments", labelRu: "кто платит", labelEn: "who pays" },
  { from: "costs", to: "activities", labelRu: "издержки ← работа", labelEn: "costs ← work" },
];

export function getBmcDefaults(locale: string): BmcDoc {
  const en = locale === "en";

  return {
    note: en ? META.noteEn : META.noteRu,
    product: en ? META.productEn : META.productRu,
    version: en ? META.versionEn : META.versionRu,
    updated: META.updated,
    blocks: BLOCK_DEFS.map((block) => ({
      id: block.id,
      title: en ? block.titleEn : block.titleRu,
      subtitle: en ? block.subtitleEn : block.subtitleRu,
      items: block.items.map((item) => ({
        id: item.id,
        text: en ? item.textEn : item.textRu,
        ...(item.status ? { status: item.status } : {}),
      })),
    })),
    links: LINK_DEFS.map((link) => ({
      from: link.from,
      to: link.to,
      label: en ? link.labelEn : link.labelRu,
    })),
  };
}
