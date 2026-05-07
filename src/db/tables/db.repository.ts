import * as table from './db.dao'

export const tableRepository = {
    createTable: table.createTable,
    createSecondaryTable: table.createSecondaryTable,
    getMainTableFromId: (id: number, sort?: import('../../types/types').ItemSort) => table.getMainTableFromId(id, sort),
    getTableItemsFromId: table.getTableItemsFromId,
    getAllExpense: table.getAllExpense,
    getAllItems: table.getAllItems,
    getTables: table.getAllTables,
    updateItems: table.updateItems,
    updateExpense: table.updateExpense,
    updateResult: table.updateResult,
    deleteRow: table.deleteRow,
}