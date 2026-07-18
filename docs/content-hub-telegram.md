# Telegram Content Hub

Автоматически перехватывает посты из каналов авторов, обрабатывает через Gemini и публикует в [@MedoyidClub](https://t.me/MedoyidClub), а также синхронизирует блог и видеотеку на сайте.

## Каналы

| Автор | Telegram | ID |
|-------|----------|-----|
| Тетяна Гукало | @tetianagukalo | `-1002194774103` |
| Ната Устименко | @nata_philosopher | `-1002197650405` |
| Клуб медоедов | @MedoyidClub | `-1004491478231` |

Бот: [@MedoyidClub_bot](https://t.me/MedoyidClub_bot) — **админ** в каналах авторов и канале клуба.

## Настройка

### 1. Переменные окружения (`.env.local`)

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...   # случайная строка
GEMINI_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

Опционально: Facebook URL авторов, slug Тетяны (`CONTENT_HUB_TETIANA_SLUG`), если страница автора ещё не создана.

### 2. YouTube OAuth

Скопируйте в `secrets/youtube/` из `D:\work\ether_description`:

- `token.json`
- `client_secret_*.json`

### 3. Supabase migration

```bash
supabase db push
# или примените supabase/migrations/20260718100000_content_hub_processed.sql
```

### 4. Локальная разработка

```bash
npm run dev          # терминал 1
npm run content-hub:poll   # терминал 2 — long polling → localhost webhook
```

### 5. Production (Vercel)

```bash
npm run content-hub:webhook
```

Регистрирует webhook: `{NEXT_PUBLIC_BASE_URL}/api/telegram/webhook`

## Pipeline

```
Канал автора (channel_post)
  → определение автора по chat_id
  → dedup (content_hub_processed)
  → YouTube API: описания видео @honey_erbe / @medoyid-club
  → Gemini: фильтр, теги, HTML для клуба, blog markdown
  → Telegram: copyMessage / sendMessage → @MedoyidClub
  → Supabase: blog_posts + videos (видеотека)
```

## Теги

- Ната: `#NataUstimenko`
- Тетяна: `#TetianaGukalo`
- + 3–5 тематических тегов от Gemini

## Безопасность

- **Не коммитьте** `sur.txt`, `.env.local`, `secrets/`
- Если токен бота попал в git/чат — отзовите через [@BotFather](https://t.me/BotFather) и выпустите новый
