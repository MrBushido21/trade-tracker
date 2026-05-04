import { tableRepository } from "../db/tables/db.repository"

export const createMainTable = async (tableName:string) => {
    try {
        const tables = await tableRepository.createTable(tableName)
        return tables
    } catch (error:any) {
        console.error(error);
        throw new Error(error)
    }
}


export const getFullMainTable = async (id:number) => {
    try {
       const table = await tableRepository.getMainTableFromId(id)
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