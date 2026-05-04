import { error } from "node:console";
import { TableExpeceI, TableItemsI } from "../../types/types"
import { sqlAll, sqlGet, sqlRun } from "../dbconstructor"

// function deleteItems () {
//     sqlRun(`DELETE FROM table_items WHERE id = 2`)
// }
// deleteItems()

export const createTable = async (tableName: string) => {
    const dateNow = new Date().toISOString();
    const id = await sqlRun(`
        INSERT INTO tables (name, created_at, updated_at) VALUES (?, ?, ?)
        `, [tableName, dateNow, dateNow])
    if (!id) {
        throw new Error('databse error')
    }

    Promise.all([
        sqlRun(`
        INSERT INTO table_items (table_id, created_at, updated_at) VALUES (?, ?, ?)
        `, [id.lastID, dateNow, dateNow]),
        sqlRun(`
        INSERT INTO table_expense (table_id, created_at, updated_at) VALUES (?, ?, ?)
        `, [id.lastID, dateNow, dateNow])
    ])

    const [table, items, expenses] = await Promise.all([
        sqlGet(`SELECT * FROM tables WHERE id = ?`, [id.lastID]),
        sqlAll(`SELECT * FROM table_items WHERE table_id = ?`, [id.lastID]),
        sqlAll(`SELECT * FROM table_expense WHERE table_id = ?`, [id.lastID]),
    ])

    return { ...table, items, expenses }
}


export const createSecondaryTable = async (table_id: number, tableType:"table_items" | "table_expense") => {
    const dateNow = new Date().toISOString();
    const id = await sqlRun(`
        INSERT INTO ${tableType} (table_id, created_at, updated_at) VALUES (?, ?, ?)
        `, [table_id, dateNow, dateNow])
    if (!id) {
        throw new Error('databse error')
    }

    const table = sqlGet(`SELECT * FROM ${tableType} WHERE id = ?`, [id.lastID])
    
    return table
}


//GET

export const getMainTableFromId = async (id: number) => {
    const table = await sqlGet(`SELECT * FROM tables WHERE id = ?`, [id])
    if (!table) return null

    const [items, expenses] = await Promise.all([
        sqlAll(`SELECT * FROM table_items WHERE table_id = ?`, [id]),
        sqlAll(`SELECT * FROM table_expense WHERE table_id = ?`, [id]),
    ])

    return { ...table, items, expenses }
}

export const getTableItemsFromId = async (id: number) => {
    return await sqlGet(`
        SELECT * FROM table_items WHERE id = ? 
        `, [id])
}
export const getExpenceFromId = async (id: number) => {
    return await sqlGet(`
        SELECT * FROM table_expense WHERE id = ? 
        `, [id])
}

//GET ALL

export const getAllTables = async () => {
    return await sqlAll(`
        SELECT * FROM tables 
        `, [])
}
export const getAllItemSellPrice = async () => {
    return await sqlAll(`
        SELECT item_sell_price FROM table_items 
        `, [])
}
export const getAllBuyPrice = async () => {
    return await sqlAll(`
        SELECT item_buy_price FROM table_items 
        `, [])
}

//UPDATE

export const updateItems = async (data: TableItemsI) => { 
    await sqlRun(`
        UPDATE table_items SET
            item_name = COALESCE(?, item_name),
            item_buy_price = COALESCE(?, item_buy_price),
            item_sell_price = COALESCE(?, item_sell_price),
            item_count = COALESCE(?, item_count),
            item_sel_count = COALESCE(?, item_sel_count),
            in_stock = COALESCE(?, in_stock),
            total_count = total_count + ${data.item_count},
            total_sell = total_sell + ${data.item_sel_count},
            total_in_stock = total_in_stock + ${data.in_stock}
            WHERE id = ?
        `, [
        data.item_name ?? null,
        data.item_buy_price ?? null,
        data.item_sell_price ?? null,
        data.item_count ?? null,
        data.item_sel_count ?? null,
        data.in_stock ?? null,
        data.id
    ])

    const table = await sqlGet(`SELECT * FROM table_items WHERE id = ?`, [data.id])
    return table
}
export const updateExpense = async (data: TableExpeceI) => {
    
    await sqlRun(`
        UPDATE table_expense SET
            vps = COALESCE(?, vps),
            domen = COALESCE(?, domen),
            advertisement = COALESCE(?, advertisement),
            delivery = COALESCE(?, delivery),
            income = COALESCE(?, income),
            profit = COALESCE(?, profit),
            total_amount = COALESCE(?, total_amount) 
            WHERE id = ?
        `, [
        data.vps ?? null,
        data.domen ?? null,
        data.advertisement ?? null,
        data.delivery ?? null,
        data.income ?? null,
        data.profit ?? null,
        data.total_amount ?? null,
        data.id ?? null,
    ])

    const table = await sqlGet(`SELECT * FROM table_expense WHERE id = ?`, [data.id])
    
    return table
}

