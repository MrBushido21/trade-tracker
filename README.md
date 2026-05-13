# Trade Tracker

A web application for tracking goods: monitors purchases, sales, delivery costs, and expenses, and automatically calculates income and profit.

## Monorepo Structure

```
tables/                  ← backend (Node.js + Express + SQLite)
└── tables-client/       ← frontend (React + Vite)
```

## Stack

| Layer          | Technologies                                         |
|----------------|------------------------------------------------------|
| Backend        | Node.js, Express 5, TypeScript, SQLite (sqlite3)     |
| Auth           | JWT (access 15 min), bcryptjs, refresh tokens        |
| Frontend       | React 19, TypeScript, Vite 8, Axios                  |
| Deployment     | VPS (Hetzner), nginx (port 4000), PM2 (port 5001)    |

---

## Backend

### Running

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Environment Variables (.env)

```env
PORT=5001
JWT_ACCESS_SECRET=your_secret_here
```

### Database

SQLite file `db.db` in the project root. Tables are created automatically on startup (`src/db/tables/db.createTable.ts`).

#### Schema

```
tables
  id, name, created_at, updated_at

table_items
  id, table_id, item_name
  item_buy_price  INTEGER  (in kopecks)
  item_delivery   INTEGER  (in kopecks)
  item_sell_price INTEGER  (in kopecks)
  item_count, item_sel_count
  in_stock TEXT|INTEGER    ("Едет" / a number)
  created_at, updated_at

table_expense
  id, table_id
  vps, domen, advertisement, delivery  (in kopecks)
  created_at, updated_at

table_result
  id, table_id
  total_count, total_sell, total_in_stock
  income, profit, total_amount          (in kopecks)
  created_at, updated_at

users
  id, username, password_hash

refresh_tokens
  id, user_id, token, expires_at
```

> All monetary values are stored as **integers in kopecks**. The client divides by 100 for display.

### API Endpoints

#### Auth (no token required)

| Method | Path           | Body                          | Description                              |
|--------|----------------|-------------------------------|------------------------------------------|
| POST   | /auth/login    | `{username, password}`        | Returns `accessToken` and `refreshToken` |
| POST   | /auth/refresh  | `{refreshToken}`              | Issues a new access token                |
| POST   | /auth/logout   | `{refreshToken}`              | Deletes the refresh token from the DB    |

#### Tables (require `Authorization: Bearer <token>`)

| Method | Path             | Params / Body                               | Description                                     |
|--------|------------------|---------------------------------------------|-------------------------------------------------|
| GET    | /                | —                                           | List all tables                                 |
| GET    | /table           | `?id=<id>&sort=<sort>`                      | Full table with items, expenses, and totals     |
| POST   | /createmaintable | `{tableName}`                               | Create a new table                              |
| POST   | /createitems     | `{table_id, tableType}`                     | Add a row to items or expenses                  |
| PATCH  | /table/item      | `{type: "item"\|"expense", id, ...fields}`  | Update a row; recalculates totals               |
| DELETE | /table/item      | `{id, type: "item"\|"expense"}`             | Delete a row                                    |

#### Item Sort Parameter (`sort`)

| Value      | Behaviour                                              |
|------------|--------------------------------------------------------|
| `in_stock` | Descending by stock quantity                           |
| `sold`     | Descending by number of sales                          |
| `idle`     | Items in stock with zero sales first                   |
| `transit`  | Rows where `in_stock = 'Едет'` (in transit) first     |

### Totals Calculation (`src/utils/utils.ts`)

Called after every PATCH via `calculate(table_id)`:

```
income       = SUM(item_sell_price)
total_buy    = SUM(item_buy_price)
total_amount = total_buy + vps + domen + advertisement + delivery_expense + SUM(item_delivery)
profit       = income - total_amount
```

### Auth — Details

- **Access token**: JWT, 15-minute lifetime, stored in memory on the client
- **Refresh token**: random 40-byte hex string, 7-day lifetime, stored in `localStorage` and in the `refresh_tokens` table on the server
- **Middleware** (`src/middleware/auth.middleware.ts`): validates `Authorization: Bearer` on all routes except `/auth/*`

### Creating a User

Users are created manually via a script:

```bash
npx ts-node src/scripts/createUser.ts
```

---

## Frontend (`tables-client/`)

### Running

```bash
cd tables-client
npm run dev      # development (http://localhost:5173)
npm run build    # build to dist/
```

### API URL Configuration

The file `src/config.ts` is **not committed** (listed in `.gitignore`). Create it manually:

```ts
// src/config.ts
export const API_URL = 'http://localhost:5001'
```

On the server: `export const API_URL = 'http://<IP>:5001'`

Template: `src/config.example.ts`.

### Component Architecture

```
main.tsx
└── AuthProvider          ← authentication context
    └── App.tsx
        ├── LoginPage      ← login form (shown when not authenticated)
        ├── sidebar
        │   └── TablesList ← table list + create form
        └── content
            └── TableView  ← items table + expenses table
                ├── ItemRow    ← editable item row
                └── ExpenseRow ← editable expense row
```

### Authentication Flow

```
1. App starts → AuthProvider checks refreshToken in localStorage
2. Token found → POST /auth/refresh → receives accessToken → isAuthenticated = true
3. No token → shows LoginPage
4. Login form → POST /auth/login → stores both tokens
5. Every request → axios injects accessToken into Authorization header
6. 401 from API → automatic POST /auth/refresh → retries the original request
7. Refresh expired → clears localStorage → redirects to LoginPage
```

### Item Row Color Coding

| Color  | Condition                                           |
|--------|-----------------------------------------------------|
| Green  | Bought = Sold and stock is 0 (fully sold out)       |
| Red    | Stock > 0 but no sales yet                          |
| Yellow | Stock > 0 and at least one sale                     |
| Blue   | `in_stock = 'Едет'` (item is in transit)            |

---
