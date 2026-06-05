# Чек-лист: открытие Stripe для немецкого ИП (Einzelunternehmen)

Пошаговый план запуска боевых платежей для «Клуб медоедов» — от регистрации
бизнеса до первого реального платежа.

Легенда:
- 🧾 — твоя часть / с бухгалтером (Steuerberater)
- 🛠️ — техническая часть (код / Vercel)

> ⚠️ Это не налоговая консультация. Пункты по НДС/налогам обязательно сверь с
> немецким Steuerberater — для цифровых курсов на аудиторию ЕС это критично.

---

## Этап 0. Подготовка (до Stripe) 🧾

- [ ] **Gewerbeanmeldung** — зарегистрировать ИП в Gewerbeamt (или онлайн).
      Вид деятельности: онлайн-образование / цифровые продукты.
- [ ] Получить **Steuernummer** от Finanzamt (после *Fragebogen zur steuerlichen
      Erfassung* через ELSTER).
- [ ] Запросить **USt-IdNr** (VAT ID) — нужен для продаж по ЕС и для OSS.
- [ ] Решить с бухгалтером режим НДС:
  - **Kleinunternehmer (§19)** — без НДС внутри Германии, НО на трансграничные
    цифровые B2C-продажи в ЕС **не распространяется** → всё равно нужен **OSS**
    и НДС по стране покупателя.
  - **Regelbesteuerung** — стандартный НДС 19% + вычеты.
- [ ] Зарегистрироваться в **OSS** (через BZSt/ELSTER), если продаёте курсы
      физлицам в других странах ЕС.
- [ ] Открыть бизнес-счёт с **IBAN (DE или SEPA)** для выплат Stripe
      (немецкий банк / Wise EUR / Revolut Business EUR и т.п.).

## Этап 1. Создание аккаунта Stripe 🧾

- [ ] Регистрация на dashboard.stripe.com, **страна аккаунта = Germany**
      (поменять потом нельзя!).
- [ ] Business type = **Individual / Sole proprietor (Einzelunternehmen)**.
- [ ] Данные: имя, адрес в Германии, Steuernummer/USt-IdNr,
      сайт `https://www.medoyid-club.com`, описание (онлайн-курсы).
- [ ] **Statement descriptor** (как платёж видно в выписке) — напр. `MEDOYID CLUB`.
- [ ] Привязать **IBAN** для выплат, настроить payout schedule.

## Этап 2. Верификация (KYC) 🧾

- [ ] Загрузить документ личности владельца (паспорт / Personalausweis).
- [ ] Подтвердить адрес при запросе (Meldebescheinigung / счёт за коммуналку).
- [ ] Дождаться статуса аккаунта **«Payments enabled / Active»**.

## Этап 3. Налоги и валюта в Stripe 🧾🛠️

- [ ] В Settings → Tax внести **USt-IdNr**.
- [ ] (Опц.) Включить **Stripe Tax** — автоматический расчёт MwSt/OSS по стране
      покупателя (упрощает отчётность, есть комиссия).
- [ ] Базовая валюта расчёта — **EUR** (в коде уже `eur` ✅).
- [ ] (Опц.) **Adaptive Pricing** — показывает покупателю цену в локальной валюте.
      Тумблер, кода не требует.

## Этап 4. Методы оплаты 🧾

Settings → Payment methods:
- [ ] **Cards** (Visa/Mastercard) — базово.
- [ ] **Apple Pay / Google Pay** (для Checkout верификация домена автоматическая).
- [ ] **PayPal** (доступен немецкому аккаунту — тумблер).
- [ ] **Revolut Pay** (EEA/UK — тумблер).
- [ ] (Опц.) **Klarna**, **SEPA Direct Debit**, **giropay/Bancontact**.

> Чекаут уже на динамических методах (без `payment_method_types`), поэтому всё
> включённое появится автоматически — править код не нужно.

## Этап 5. Безопасность ключей 🛠️ (ключи даёт владелец)

- [ ] Создать **Restricted API Key (`rk_live_…`)** вместо `sk_live` с минимальными
      правами: Checkout Sessions (write), PaymentIntents (read), Webhooks.
- [ ] Ключи только через env, не в репозитории (✅).

## Этап 6. Webhook (боевой) 🛠️

- [ ] Endpoint: `https://www.medoyid-club.com/api/stripe/webhook`.
- [ ] События: **`checkout.session.completed`** (минимум). Для отложенных
      PayPal/SEPA добавить `checkout.session.async_payment_succeeded` и
      `checkout.session.async_payment_failed`.
- [ ] Скопировать **Signing secret (`whsec_…`)** боевого endpoint.

## Этап 7. Прод-переменные в Vercel 🛠️ (Production)

- [ ] `STRIPE_SECRET_KEY` = `rk_live_…` (боевой restricted).
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_…` (боевого endpoint).
- [ ] `NEXT_PUBLIC_BASE_URL` = `https://www.medoyid-club.com` (✅).
- [ ] Редеплой.

## Этап 8. Go-live проверка ✅

- [ ] Перевести Stripe из Test в **Live**.
- [ ] Купить курс **реальной картой** на минимальной цене (напр. 1 €), проверить:
  - [ ] редирект на success;
  - [ ] `enrollments.payment_status = paid` (вебхук отработал);
  - [ ] доступ к урокам открылся;
  - [ ] письмо-квитанция Stripe пришло.
- [ ] Проверить **возврат (refund)** из дашборда.
- [ ] Проверить, что PayPal/Revolut Pay реально показываются в Checkout.
- [ ] Включить/проверить **Stripe Radar** (антифрод).

## Этап 9. Юридическое на сайте 🧾 (для ЕС/Германии)

- [ ] **Impressum** (обязателен в Германии).
- [ ] **Datenschutz (Privacy Policy)**, **AGB/Terms**, **Widerrufsrecht**
      (для цифровых товаров — оговорка о немедленном доступе и отказе от права
      возврата после начала использования).
- [ ] Чекбокс согласия с условиями при оплате.

---

## Разделение ответственности

- **Владелец + Steuerberater:** этапы 0–4, 9 (регистрация, налоги, банк,
  верификация, тумблеры методов, юр-страницы).
- **Технически:** этапы 5–8 (restricted key wiring, вебхук, env, редеплой,
  тест-прогон).

## Текущее состояние интеграции (на момент создания файла)

- Базовая валюта переведена на **EUR** (Checkout + отображение + ярлыки студии).
- Чекаут использует **динамические методы оплаты** (без `payment_method_types`),
  готов к PayPal / Revolut Pay / Apple / Google Pay по тумблеру в дашборде.
- Stripe пока в **тестовом режиме** (`sk_test_…`), вебхук на
  `…/api/stripe/webhook` слушает `checkout.session.completed`.
- Внутренние колонки БД называются `*_usd`, но хранят **EUR-центы** (исторически;
  на пользователей не влияет, при желании можно переименовать отдельно).

## Полезные ссылки

- Go-live checklist: https://docs.stripe.com/get-started/checklist/go-live
- PayPal через Stripe: https://docs.stripe.com/payments/paypal
- Revolut Pay: https://docs.stripe.com/payments/revolut-pay
- Restricted API keys: https://docs.stripe.com/keys/restricted-api-keys
- Stripe Tax: https://docs.stripe.com/tax
