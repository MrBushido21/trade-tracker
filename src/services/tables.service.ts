import { tableRepository } from "../db/tables/db.repository"
import { TableExpeceI, TableItemsI } from "../types/types";
import { calculate } from "../utils/utils";

export const createSecondaryTable = async (table_id: number, tableType: "table_items" | "table_expense") => {
    try {
        const table = await tableRepository.createSecondaryTable(table_id, tableType)
        return table
    } catch (error: any) {
        console.error(error);
        throw new Error(error)
    }
}

export const updateTable = async (data: TableItemsI | TableExpeceI) => {
   try {
    if (data.type !== 'item' && data.type !== 'expense') return "Неверный тип"
    
     if (data.type === 'expense') { 
        await expense(data)
     } else {
        await item(data)
     }
   } catch (error:any) {
    console.error(error);
    throw new Error(error)
   }
}


export const deleteRow = async (id:number, type: "expense" | "item") => {
    try {
        await tableRepository.deleteRow(id, type)
        return "Удалено"
    } catch (error) {
        console.error(error);
        throw new Error('Iternal server error')
    }
}
async function expense(data:TableExpeceI) {
       const expenceTable = await tableRepository.updateExpense(data)

       if (!expenceTable) throw new Error('Databse error')

        const utils = await calculate(data.table_id)
        const income = utils.income
        
        const total_amount = utils.total_amount

        const profit = income - total_amount
        
        const total = {table_id:data.table_id, income, profit, total_amount, total_count: utils.totalCount, total_in_stock: utils.total_in_stock, total_sell: utils.total_item_sel_count}

        const totalResTable = await tableRepository.updateResult(total)
        return {expenceTable, totalResTable}
}

async function item (data: TableItemsI) {
    const table = await tableRepository.updateItems(data)

    if (!table) throw new Error('Databse error')
        const utils = await calculate(data.table_id)
    
        const income = utils.income
        
        let total_amount = utils.total_amount
        const profit = income - total_amount
        
        const total = {table_id:data.table_id, income, profit, total_amount, 
            total_count: utils.totalCount, total_in_stock: utils.total_in_stock, total_sell: utils.total_item_sel_count}
        const totalResTable = await tableRepository.updateResult(total)
        return {table, totalResTable}
}