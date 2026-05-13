# Trade Tracker

Веб-приложение для учёта товаров: отслеживает покупки, продажи, доставку и расходы, автоматически считает доход и прибыль.

## Структура монорепо

```
tables/                  ← бэкенд (Node.js + Express + SQLite)
└── tables-client/       ← фронтенд (React + Vite)
```

## Стек

| Часть      | Технологии                                           |
|------------|------------------------------------------------------|
| Бэкенд     | Node.js, Express 5, TypeScript, SQLite (sqlite3)     |
| Аутентификация | JWT (access 15 мин), bcryptjs, refresh-токены    |
| Фронтенд   | React 19, TypeScript, Vite 8, Axios                  |
| Деплой     | VPS (Hetzner), nginx (порт 4000), PM2 (порт 5001)    |

---

## Бэкенд

### Запуск

```bash
# Разработка
npm run dev

# Продакшн
npm run build
npm start
```

### Переменные окружения (.env)

```env
PORT=5001
JWT_ACCESS_SECRET=your_secret_here
```

### База данных

SQLite файл `db.db` в корне проекта. Таблицы создаются автоматически при старте (`src/db/tables/db.createTable.ts`).

#### Схема

```
tables
  id, name, created_at, updated_at

table_items
  id, table_id, item_name
  item_buy_price INTEGER  (в копейках)
  item_delivery  INTEGER  (в копейках)
  item_sell_price INTEGER (в копейках)
  item_count, item_sel_count
  in_stock TEXT|INTEGER   ("Едет" или число)
  created_at, updated_at

table_expense
  id, table_id
  vps, domen, advertisement, delivery  (в копейках)
  created_at, updated_at

table_result
  id, table_id
  total_count, total_sell, total_in_stock
  income, profit, total_amount          (в копейках)
  created_at, updated_at

users
  id, username, password_hash

refresh_tokens
  id, user_id, token, expires_at
```

> Денежные значения хранятся в **копейках** (целое число). На клиенте делится на 100 для отображения.

### API эндпоинты

#### Аутентификация (не требуют токена)

| Метод | Путь            | Тело                          | Описание                        |
|-------|-----------------|-------------------------------|---------------------------------|
| POST  | /auth/login     | `{username, password}`        | Возвращает `accessToken`, `refreshToken` |
| POST  | /auth/refresh   | `{refreshToken}`              | Обновляет access-токен          |
| POST  | /auth/logout    | `{refreshToken}`              | Удаляет refresh-токен из БД     |

#### Таблицы (требуют `Authorization: Bearer <token>`)

| Метод  | Путь          | Параметры / Тело                              | Описание                                  |
|--------|---------------|-----------------------------------------------|-------------------------------------------|
| GET    | /             | —                                             | Список всех таблиц                        |
| GET    | /table        | `?id=<id>&sort=<sort>`                        | Полная таблица с товарами, расходами, итогами |
| POST   | /createmaintable | `{tableName}`                              | Создать новую таблицу                     |
| POST   | /createitems  | `{table_id, tableType}`                       | Добавить строку в товары или расходы      |
| PATCH  | /table/item   | `{type: "item"|"expense", id, ...поля}`       | Обновить строку; пересчитывает итоги      |
| DELETE | /table/item   | `{id, type: "item"|"expense"}`                | Удалить строку                            |

#### Параметр сортировки товаров (`sort`)

| Значение   | Поведение                                        |
|------------|--------------------------------------------------|
| `in_stock` | По убыванию остатка                              |
| `sold`     | По убыванию количества продаж                    |
| `idle`     | Сначала — в наличии, но ни разу не продавались  |
| `transit`  | Сначала строки с `in_stock = 'Едет'`            |

### Расчёт итогов (`src/utils/utils.ts`)

После каждого PATCH вызывается `calculate(table_id)`:

```
income       = SUM(item_sell_price)
total_buy    = SUM(item_buy_price)
total_amount = total_buy + vps + domen + advertisement + delivery_expense + SUM(item_delivery)
profit       = income - total_amount
```

### Аутентификация — детали

- **Access-токен**: JWT, живёт 15 минут, хранится в памяти на клиенте
- **Refresh-токен**: случайная hex-строка (40 байт), живёт 7 дней, хранится в `localStorage` клиента и в таблице `refresh_tokens` на сервере
- **Middleware** (`src/middleware/auth.middleware.ts`): проверяет `Authorization: Bearer` на всех маршрутах кроме `/auth/*`

### Создание пользователя

Пользователи создаются вручную скриптом:

```bash
npx ts-node src/scripts/createUser.ts
```

---

## Фронтенд (`tables-client/`)

### Запуск

```bash
cd tables-client
npm run dev      # разработка (http://localhost:5173)
npm run build    # сборка в dist/
```

### Конфигурация API URL

Файл `src/config.ts` **не коммитится** (в `.gitignore`). Создаётся вручную:

```ts
// src/config.ts
export const API_URL = 'http://localhost:5001'
```

На сервере: `export const API_URL = 'http://<IP>:5001'`

Шаблон: `src/config.example.ts`.

### Архитектура компонентов

```
main.tsx
└── AuthProvider          ← контекст аутентификации
    └── App.tsx
        ├── LoginPage      ← форма входа (если не авторизован)
        ├── sidebar
        │   └── TablesList ← список таблиц + форма создания
        └── content
            └── TableView  ← таблица товаров + таблица расходов
                ├── ItemRow    ← редактируемая строка товара
                └── ExpenseRow ← редактируемая строка расхода
```

### Поток аутентификации

```
1. Старт приложения → AuthProvider проверяет refreshToken в localStorage
2. Есть токен → POST /auth/refresh → получает accessToken → isAuthenticated = true
3. Нет токена → показывает LoginPage
4. Форма входа → POST /auth/login → сохраняет оба токена
5. На каждый запрос axios подставляет accessToken в заголовок
6. 401 от API → автоматический POST /auth/refresh → повтор запроса
7. Refresh истёк → очищает localStorage → редирект на LoginPage
```

### Цветовая маркировка строк товаров

| Цвет     | Условие                                          |
|----------|--------------------------------------------------|
| Зелёный  | Куплено = Продано и в наличии 0 (всё продано)    |
| Красный  | В наличии > 0, но продаж нет                     |
| Жёлтый   | В наличии > 0 и есть хотя бы одна продажа        |
| Синий    | `in_stock = 'Едет'` (товар в пути)               |

---
