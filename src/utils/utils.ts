import { tableRepository } from "../db/tables/db.repository"

export const calculate = async (table_id: number) => {
    const [items, expenses] = await Promise.all([
        tableRepository.getAllItems(table_id),
        tableRepository.getAllExpense(table_id),
    ])

    let income = items.income ?? 0
    let totalBuy = items.total_buy ?? 0
    let totalCount = items.total_count ?? 0
    //Нужно считать тотальные показатели и из них делать расходы
    let totalVps = expenses.totalVps ?? 0
    let totalDomen = expenses.totalDomen ?? 0
    let totalAdvertisement = expenses.totalAdvertisement ?? 0
    let totalDelivery = expenses.totalDelivery ?? 0
    const total_in_stock =  items.total_in_stock
    const total_item_sel_count =  items.total_item_sel_count
    
    let total_amount = totalBuy + totalVps + totalDomen + totalAdvertisement + totalDelivery
    return { income, totalBuy, total_amount, totalCount, total_in_stock, total_item_sel_count }
} 