# Почта medoyid-club.com

Архитектура: **Cloudflare Email Routing** (входящие) + **Resend** (исходящие из приложения) + **Gmail SMTP через Resend** (ручные ответы).

## Текущий статус

| Компонент | Статус |
|-----------|--------|
| Домен в Cloudflare DNS | ✅ `margaret.ns.cloudflare.com` |
| Resend `medoyid-club.com` | ✅ verified, region `eu-west-1`, sending enabled |
| Resend DNS (`send`, DKIM) | ✅ verified |
| Cloudflare Email Routing | ✅ MX + destination verified; **явные правила на каждый адрес** |
| Код приложения | ✅ адреса в `src/lib/email/addresses.ts` |

> **Catch-all** в dashboard может показывать Active, но на MX-серверах не срабатывает — проверено SMTP-тестом. Работают только **отдельные routing rules** (как для `hello@`).

## Адреса

| Адрес | Назначение | Входящие (Routing) | Исходящие (Resend) |
|-------|------------|--------------------|--------------------|
| `admin@` | Администрирование | → Gmail | Приглашения авторам |
| `hello@` | Первый контакт | → Gmail | — |
| `info@` | Общие вопросы | → Gmail | — |
| `courses@` | Курсы | → Gmail | Reply-To для подарков |
| `support@` | Поддержка | → Gmail | — |
| `partners@` | Партнёры | → Gmail | — |
| `media@` | СМИ | → Gmail | — |
| `security@` | Уязвимости | → Gmail | — |
| `legal@` | Юридическое | → Gmail | — |
| `noreply@` | Автоуведомления | → Gmail | Подарки, системные письма |

### Авторы

| Адрес | Автор | Slug на сайте |
|-------|-------|---------------|
| `nata-ustymenko@` | Ната Устименко | `/authors/nata-ustymenko` |
| `tetiana-gukalo@` | Тетяна Гукало | `/authors/tetiana-gukalo` |

Все входящие пересылаются в **`medoyid.club@gmail.com`**.

---

## 1. Cloudflare Email Routing (входящие)

> MCP Cloudflare не предоставляет API для Email Routing — настройка через [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/email-service/routing).

### Шаг 1: Подключить домен

1. **Compute → Email Service → Email Routing**
2. **Onboard Domain** → выбрать `medoyid-club.com`
3. Cloudflare добавит MX, SPF и DKIM на корень домена

**Важно:** Resend использует поддомен `send.medoyid-club.com` — конфликта с Routing нет.

### Шаг 2: Destination address

1. **Email Routing → Destination Addresses**
2. Добавить `medoyid.club@gmail.com`
3. Подтвердить по ссылке из письма Cloudflare

### Шаг 3: Правила маршрутизации

**Для каждого адреса — отдельное правило** (catch-all на практике не работает):

1. **Routing Rules → Create routing rule**
2. **Custom address:** local-part (см. таблицу ниже)
3. **Action:** Send to an email → `medoyid.club@gmail.com`
4. **Save** → Status: **Active**

| Custom address | Полный адрес | Статус |
|----------------|--------------|--------|
| `hello` | hello@medoyid-club.com | ✅ проверен |
| `admin` | admin@medoyid-club.com | добавить |
| `info` | info@medoyid-club.com | добавить |
| `courses` | courses@medoyid-club.com | добавить |
| `support` | support@medoyid-club.com | добавить |
| `partners` | partners@medoyid-club.com | добавить |
| `media` | media@medoyid-club.com | добавить |
| `security` | security@medoyid-club.com | добавить |
| `legal` | legal@medoyid-club.com | добавить |
| `noreply` | noreply@medoyid-club.com | добавить |
| `nata-ustymenko` | nata-ustymenko@medoyid-club.com | добавить |
| `tetiana-gukalo` | tetiana-gukalo@medoyid-club.com | добавить |

Список синхронизирован с `src/lib/email/addresses.ts` → `INBOUND_EMAIL_ALIASES`.

Catch-all можно оставить Disabled или удалить — он не нужен, если все адреса перечислены явно.

### Шаг 4: SPF (если уже есть запись от Resend)

На корне домена должна быть **одна** SPF-запись, объединяющая Routing и Resend:

```txt
v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all
```

> Resend на EU использует Amazon SES (`send.medoyid-club.com`). Проверьте в **DNS → Records**, что нет дублирующих SPF на `@`.

---

## 2. Resend — исходящие из приложения (API)

Домен **verified**, region `eu-west-1`, sending enabled.

### Переменные окружения

Локально (`.env`) и на **Vercel → Settings → Environment Variables → Production**:

```env
RESEND_API_KEY=re_...
EMAIL_FROM="Клуб медоедов <noreply@medoyid-club.com>"
NEXT_PUBLIC_BASE_URL=https://medoyid-club.com
```

`EMAIL_FROM` — только дефолт для `noreply@`. Письма с ролью `admin@`, `courses@` и т.д. берут From из `src/lib/email/addresses.ts` автоматически.

API-ключ: [Resend → API Keys](https://resend.com/api-keys) → Create → Full access (или Sending access).

### Какие адреса использует код

| Сценарий | From | Reply-To |
|----------|------|----------|
| Приглашение автору | `admin@` | `admin@` |
| Подарок курса | `noreply@` | `courses@` |

Отправка: `src/lib/email/resend.ts`. Константы SMTP для Gmail: `RESEND_SMTP`.

### Проверка API

```powershell
npm run dev
# Admin → пригласить автора — письмо от admin@medoyid-club.com
```

Или [Resend Dashboard → Emails](https://resend.com/emails) → Send test, From: `admin@medoyid-club.com`.

---

## 3. Gmail — ручные ответы через Resend SMTP

Чтобы **ответить из Gmail от имени** `courses@`, `hello@`, `nata-ustymenko@` и т.д.:

### Параметры SMTP (одинаковые для всех адресов)

| Параметр | Значение |
|----------|----------|
| SMTP-сервер | `smtp.resend.com` |
| Порт | `465` (SSL) или `587` (STARTTLS) |
| Логин | `resend` |
| Пароль | ваш `RESEND_API_KEY` (начинается с `re_`) |

### Пошагово в Gmail

1. Откройте `medoyid.club@gmail.com`
2. **⚙ Настройки → Все настройки → Аккаунты и импорт**
3. **Отправлять письма как** → **Добавить другой адрес e-mail**
4. Заполните:
   - **Имя:** `Клуб медоедов` (или имя автора для author-адресов)
   - **Email:** например `courses@medoyid-club.com`
5. **Снять галочку** «Обрабатывать как псевдоним» — нужен отдельный SMTP
6. **SMTP-сервер:** `smtp.resend.com`, порт `465`, логин `resend`, пароль = `RESEND_API_KEY`
7. **Добавить адрес e-mail**
8. Gmail отправит код подтверждения на `courses@` → придёт через Cloudflare Routing в этот же Gmail → введите код

### Какие адреса добавить в Gmail

Минимум для старта:

| Email | Имя отправителя |
|-------|-----------------|
| `hello@medoyid-club.com` | Клуб медоедов |
| `courses@medoyid-club.com` | Клуб медоедов |
| `support@medoyid-club.com` | Клуб медоедов |
| `admin@medoyid-club.com` | Клуб медоедов |
| `nata-ustymenko@medoyid-club.com` | Ната Устименко |
| `tetiana-gukalo@medoyid-club.com` | Тетяна Гукало |

Остальные (`info@`, `partners@`, …) — по мере необходимости.

### Как отвечать

При ответе на письмо, пришедшее на `courses@`, Gmail предложит отправить **от** `courses@medoyid-club.com` — выберите его в поле «От».

Если не предлагает: **Изменить** рядом с полем «От» → выберите нужный адрес → **Сделать по умолчанию** для этой переписки.

### Проверка исходящих

1. Отправьте письмо **с** `hello@medoyid-club.com` **на** свой личный ящик
2. У получателя в From должно быть `hello@medoyid-club.com`, не `@gmail.com`
3. [Resend → Emails](https://resend.com/emails) — письмо появится в логе

---

## 4. Фильтры Gmail (рекомендация)

В `medoyid.club@gmail.com` создайте ярлыки и фильтры:

| Кому (To) | Ярлык |
|-----------|-------|
| `courses@medoyid-club.com` | Курсы |
| `support@medoyid-club.com` | Поддержка |
| `partners@medoyid-club.com` | Партнёры |
| `media@medoyid-club.com` | СМИ |
| `admin@medoyid-club.com` | Администрирование |
| `hello@medoyid-club.com` | Первый контакт |
| `nata-ustymenko@medoyid-club.com` | Ната Устименко |
| `tetiana-gukalo@medoyid-club.com` | Тетяна Гукало |

Первые тестовые письма могут попасть в **Спам** — нажмите «Не спам» и создайте фильтр «Никогда не отправлять в спам» для `@medoyid-club.com`.

---

## 5. Проверка

### Входящие (после настройки Routing)

```powershell
Resolve-DnsName medoyid-club.com -Type MX
# Ожидается: route1/2/3.mx.cloudflare.net
```

Отправьте тест на `hello@medoyid-club.com` — письмо должно прийти в Gmail.

### Исходящие (Resend API)

```powershell
npm run dev
# Admin → пригласить автора — письмо от admin@medoyid-club.com
```

### Исходящие (Gmail + Resend SMTP)

Отправьте тест с `hello@medoyid-club.com` на личный ящик — в From должен быть домен, не Gmail.

---

## Схема

```text
Пользователь → courses@medoyid-club.com
                    ↓
           Cloudflare Email Routing
                    ↓
           medoyid.club@gmail.com
                    ↓
              Gmail (ответ)
                    ↓
           SMTP smtp.resend.com
                    ↓
           От: courses@medoyid-club.com

Приложение (Next.js) → Resend API → noreply@ / admin@
```
