import { sqlRun } from "../dbconstructor";


export const createTables = async (): Promise<void> => {
    // await sqlRun(`DROP TABLE tables`) 
    // await sqlRun(`DROP TABLE table_items`)
    // await sqlRun(`DROP TABLE table_expense`)
    // await sqlRun(`DROP TABLE table_result`)
    await sqlRun(`
        CREATE TABLE IF NOT EXISTS tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    `);
    await sqlRun(`
        CREATE TABLE IF NOT EXISTS table_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id INTEGER NOT NULL,
        item_name TEXT,
        item_buy_price INTEGER DEFAULT 0,
        item_sell_price INTEGER DEFAULT 0,
        item_count INTEGER DEFAULT 0,
        item_sel_count INTEGER DEFAULT 0,
        in_stock INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
    );
    `);
    await sqlRun(`
        CREATE TABLE IF NOT EXISTS table_expense (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id INTEGER NOT NULL,
        vps INTEGER DEFAULT 0,
        domen INTEGER DEFAULT 0,
        advertisement INTEGER DEFAULT 0,
        delivery INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
    );
    `);
    await sqlRun(`
        CREATE TABLE IF NOT EXISTS table_result (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id INTEGER NOT NULL,
        total_count INTEGER DEFAULT 0,
        total_sell INTEGER DEFAULT 0,
        total_in_stock INTEGER DEFAULT 0,
        income INTEGER DEFAULT 0,
        profit INTEGER DEFAULT 0,
        total_amount INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
    );
    `);
    await sqlRun(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    );
    `);
    await sqlRun(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `);
}
