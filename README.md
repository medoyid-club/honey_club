# Honey Club

Обучающая платформа с онлайн-курсами, лекциями и семинарами. На последующих этапах — социальная RPG-среда с картой мира, профилями персонажей, квестами и матчингом по интересам и типу личности.

Подробное техническое задание: [`ТЗ.txt`](./%D0%A2%D0%97.txt).

## Этапы

1. **Этап 1 — Образовательная платформа (текущий):** публичный сайт, каталог курсов, регистрация/вход, профиль, оплата, блог, админка.
2. **Этап 2 — Социальная RPG:** карта мира с псевдолокациями, матчинг, квесты, флэшмобы, чат.

## Технологический стек

| Слой | Технология |
|---|---|
| Frontend / сайт | Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| База данных / Auth / Storage | Supabase (PostgreSQL, Auth, Storage, Realtime; PostGIS — на этапе 2) |
| Платежи | Stripe |
| Email / уведомления | Resend |
| Аналитика | PostHog |
| Мониторинг ошибок | Sentry |
| Хостинг / деплой | Vercel |
| Карта (этап 2) | Mapbox GL JS / MapLibre |
| Внутренние уведомления команды | Slack |

## Структура проекта

```
src/
  app/
    layout.tsx            # корневой layout (header + footer)
    page.tsx              # главная страница
    courses/
      page.tsx            # каталог курсов
      [slug]/page.tsx     # страница курса
    login/page.tsx        # вход (заглушка, до Supabase Auth)
  components/
    site-header.tsx
    site-footer.tsx
    course-card.tsx
    ui/                   # компоненты shadcn/ui (base-nova)
  lib/
    courses.ts            # демо-данные курсов
    utils.ts
```

## Локальный запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production-сборка
npm run lint     # ESLint
```

Требования: Node.js 20+ (проверено на 22).

## Переменные окружения

Секреты хранятся в `.env.local` (не коммитится). Шаблон будет добавлен как `.env.example` при подключении Supabase/Stripe.

## Дальнейшие шаги

- [ ] Подключить Supabase (БД, Auth, Storage)
- [ ] Реальные данные курсов вместо демо
- [ ] Оплата через Stripe
- [ ] Страницы FAQ, контакты, правовые документы
- [ ] Деплой на Vercel
