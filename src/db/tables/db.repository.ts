import * as table from './db.dao'

export const tableRepository = {
    createTable: table.createTable,
    createSecondaryTable: table.createSecondaryTable,
    getMainTableFromId: table.getMainTableFromId,
    getTableItemsFromId: table.getTableItemsFromId,
    getExpenceFromId: table.getExpenceFromId,
    getTables: table.getAllTables,
    updateItems: table.updateItems,
    updateExpense: table.updateExpense,
    getAllItemSellPrice:table.getAllItemSellPrice,
    getAllBuyPrice:table.getAllBuyPrice
}