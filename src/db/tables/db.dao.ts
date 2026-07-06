import { ExpenseI, ItemSort, ItemsI, TableExpeceI, TableItemsI, TotalResultI } from "../../types/types"
import { sqlAll, sqlGet, sqlRun } from "../dbconstructor"


export const createTable = async (tableName: string) => {
    const dateNow = new Date().toISOString();
    const id = await sqlRun(`
        INSERT INTO tables (name, created_at, updated_at) VALUES (?, ?, ?)
        `, [tableName, dateNow, dateNow])
    if (!id) {
        throw new Error('databse error')
    }

    await Promise.all([
        sqlRun(`
        INSERT INTO table_items (table_id, created_at, updated_at) VALUES (?, ?, ?)
        `, [id.lastID, dateNow, dateNow]),
        sqlRun(`
        INSERT INTO table_expense (table_id, created_at, updated_at) VALUES (?, ?, ?)
        `, [id.lastID, dateNow, dateNow]),
        sqlRun(`
        INSERT INTO table_result (table_id, created_at, updated_at) VALUES (?, ?, ?)
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

    const table = await sqlGet(`SELECT * FROM ${tableType} WHERE id = ?`, [id.lastID])
    
    return table
}


//GET

const sortOrderBy: Record<ItemSort, string> = {
    in_stock: `ORDER BY CAST(in_stock AS INTEGER) DESC`,
    sold:     `ORDER BY item_sel_count DESC`,
    idle:     `ORDER BY CASE WHEN CAST(in_stock AS INTEGER) > 0 AND (item_sel_count = 0 OR item_sel_count IS NULL) THEN 0 ELSE 1 END ASC`,
    transit:  `ORDER BY CASE WHEN in_stock = 'Едет' THEN 0 ELSE 1 END ASC`,
    income:   `ORDER BY item_income DESC`,
}

export const getMainTableFromId = async (id: number, sort?: ItemSort) => {
    const table = await sqlGet(`SELECT * FROM tables WHERE id = ?`, [id])
    if (!table) return null

    const orderBy = sort ? sortOrderBy[sort] : ''

    const [items, expenses, result] = await Promise.all([
        sqlAll(`SELECT *,
            (COALESCE(item_sell_price, 0) - (COALESCE(item_delivery, 0) + COALESCE(item_buy_price, 0))) AS item_income
            FROM table_items WHERE table_id = ? ${orderBy}`, [id]),
        sqlAll(`SELECT * FROM table_expense WHERE table_id = ?`, [id]),
        sqlGet(`SELECT * FROM table_result WHERE table_id = ?`, [id]),
    ])

    return { ...table, items, expenses, result }
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

export const getAllItems = async (table_id:number):Promise<ItemsI> => {
    return await sqlGet(`
        SELECT
            SUM(item_sell_price) AS income,
            SUM(item_buy_price)  AS total_buy,
            SUM(item_count)      AS total_count,
            SUM(in_stock)        AS total_in_stock,
            SUM(item_sel_count)  AS total_item_sel_count,
            SUM(item_delivery)   AS total_item_delivery
    FROM table_items
    WHERE table_id = ?
        `, [table_id])
}
export const getAllExpense = async (table_id:number):Promise<ExpenseI> => {
    return await sqlGet(`
        SELECT 
         SUM(vps) AS totalVps, 
         SUM(domen) AS totalDomen, 
         SUM(advertisement) AS totalAdvertisement, 
         SUM(delivery) AS  totalDelivery
        FROM table_expense
         WHERE table_id = ?
        `, [table_id])
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
            item_delivery = COALESCE(?, item_delivery)
            WHERE id = ?
        `, [
        data.item_name ?? null,
        data.item_buy_price ?? null,
        data.item_sell_price ?? null,
        data.item_count ?? null,
        data.item_sel_count ?? null,
        data.in_stock ?? null,
        data.item_delivery ?? null,
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
            delivery = COALESCE(?, delivery)
            WHERE id = ?
        `, [
        data.vps ?? null,
        data.domen ?? null,
        data.advertisement ?? null,
        data.delivery ?? null,
        data.id,
    ])
    
    const table = await sqlGet(`SELECT * FROM table_expense WHERE id = ?`, [data.id])
    
    return table
}

export const updateResult = async (data: TotalResultI) => {

    await sqlRun(`
        UPDATE table_result SET
            total_count = COALESCE(?, total_count),
            total_sell = COALESCE(?, total_sell),
            total_in_stock = COALESCE(?, total_in_stock),
            income = COALESCE(?, income),
            profit = COALESCE(?, profit),
            total_amount = COALESCE(?, total_amount)
            WHERE table_id = ?
        `, [
        data.total_count ?? null,
        data.total_sell ?? null,
        data.total_in_stock ?? null,
        data.income ?? null,
        data.profit ?? null,
        data.total_amount ?? null,
        data.table_id,
    ])

    const table = await sqlGet(`SELECT * FROM table_result WHERE table_id = ?`, [data.table_id])

    return table
}


export const deleteRow = async (id:number, type:"expense" | "item") => {
    const table = type === "item" ? "table_items" : "table_expense"
    await sqlRun(`DELETE FROM ${table} WHERE id = ?`, [id])
}

