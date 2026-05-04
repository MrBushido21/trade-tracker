import { tableRepository } from "../db/tables/db.repository"
import { TableExpeceI, TableItemsI } from "../types/types";

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
        const itemsSell = await tableRepository.getAllItemSellPrice()
    const itemBuy = await tableRepository.getAllBuyPrice()
    const expense = await tableRepository.getExpenceFromId(1)
    
        let income = 0
        let totalBuy = 0
        
        for (const summ of itemsSell) {
            income += summ.item_sell_price
        }
        
        for (const summ of itemBuy) {
            totalBuy += summ.item_buy_price
        }
        const total_amount = totalBuy + (data.advertisement ?? 0) + (data.delivery ?? 0) + (data.domen ?? 0) + (data.vps ?? 0)
        const profit = income - expense.total_amount
        data.income = income 
        data.total_amount = total_amount 
        data.profit = profit 
        return tableRepository.updateExpense(data)
     }
    
    const table = await tableRepository.updateItems(data)

    if (!table) {
        return "Чтото пошло не так повтори попытку"
    }
    const itemsSell = await tableRepository.getAllItemSellPrice()
    const itemBuy = await tableRepository.getAllBuyPrice()
    const expense = await tableRepository.getExpenceFromId(1)
    
        let income = 0
        let totalBuy = 0
        
        for (const summ of itemsSell) {
            income += summ.item_sell_price
        }
        
        for (const summ of itemBuy) {
            totalBuy += summ.item_buy_price
        }
        
        let total_amount = totalBuy + expense.advertisement + expense.delivery + expense.domen + expense.vps

    const newData = {type: 'expense' as const, table_id: data.table_id, id: 1,
         total_amount,
         income,
         profit: income - total_amount
        }
    await tableRepository.updateExpense(newData)
   } catch (error:any) {
    console.error(error);
    throw new Error(error)
   }
}