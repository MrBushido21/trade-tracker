import { tableRepository } from "../db/tables/db.repository"
import type { ItemSort } from "../types/types"

export const createMainTable = async (tableName:string) => {
    try {
        const tables = await tableRepository.createTable(tableName)
        return tables
    } catch (error:any) {
        console.error(error);
        throw new Error(error)
    }
}


export const getFullMainTable = async (id:number, sort?: ItemSort) => {
    try {
       const table = await tableRepository.getMainTableFromId(id, sort)
       return table
    } catch (error:any) {
        console.error(error);
        throw new Error(error)
    }
}


export const getAllMainTables = async () => {
    try {
        return await tableRepository.getTables()
    } catch (error:any) {
        console.error(error);
        throw new Error(error)
    }
}