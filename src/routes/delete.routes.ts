import { Request, Router } from "express"
import { deleteRow} from "../services/tables.service"

const router = Router()

router.delete('/table/item', async (req:Request<{}, {}, {id:number, type: "expense" | "item"}>, res) => {
    if (!req.body.id) return res.status(400).json({ error: 'id is required' })
    
    const response = await deleteRow(req.body.id, req.body.type)
    return res.status(200).json({message: response})
})

export default router