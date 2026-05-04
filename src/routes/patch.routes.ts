import { Request, Router } from "express"
import { TableExpeceI, TableItemsI } from "../types/types"
import { updateTable } from "../services/tables.service"

const router = Router()

router.patch('/table/item', async (req:Request<{}, {}, TableItemsI | TableExpeceI>, res) => {
    if (!req.body.type) return res.status(400).json({ error: 'type is required' })
    
    const table = await updateTable(req.body)
    return res.status(200).json({table})
})

export default router