import { Router } from "express"
import { tableRepository } from "../db/tables/db.repository"
import { getAllMainTables, getFullMainTable } from "../services/mainTable.service"
import { error } from "node:console"

const router = Router()
router.get('/table', async (req, res) => {
    let id 
    if (req.query.id) {
        id = req.query.id
    } else {
        return res.status(400).json({error: "Id`s table undefined"})
    }
    const table = await getFullMainTable(Number(id))
    
    
    return res.status(200).json({table})
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