import { Request, Router } from "express";
import { createMainTable } from "../services/mainTable.service";
import { TableItemsI } from "../types/types";
import { createSecondaryTable } from "../services/tables.service";

const router = Router()

router.post('/createmaintable', async (req, res) => {
    const tableName = req.body.tableName

    try {
        const table = await createMainTable(tableName)
        return res.status(201).json({table}) 
    } catch (error) {
        return res.status(500).json({error: 'Iternal server error'})
    }
})

router.post('/createitems', async (req: Request<{}, {}, {table_id:number, tableType: "table_items" | "table_expense"}>, res) => {
    
    try {
        const table = await createSecondaryTable(req.body.table_id, req.body.tableType)
        return res.status(201).json({table}) 
    } catch (error) {
        return res.status(500).json({error: 'Iternal server error'})
    }
})

export default router