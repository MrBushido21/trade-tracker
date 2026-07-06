import { Router } from "express"
import { getAllMainTables, getFullMainTable } from "../services/mainTable.service"
import type { ItemSort } from "../types/types"

const VALID_SORTS: ItemSort[] = ['in_stock', 'sold', 'idle', 'transit', 'income']

const router = Router()
router.get('/table', async (req, res) => {
    if (!req.query.id) return res.status(400).json({ error: "Id's table undefined" })

    const id = Number(req.query.id)
    const sortParam = req.query.sort as string | undefined
    const sort = VALID_SORTS.includes(sortParam as ItemSort) ? sortParam as ItemSort : undefined

    const table = await getFullMainTable(id, sort)
    return res.status(200).json({ table })
})
router.get('/', async (req, res) => {
    try {
        const tables = await getAllMainTables()        
        return res.status(200).json({tables})
    } catch (error) {
        return res.status(500).json({error: 'Iternal server error'})
    }
})
export default router