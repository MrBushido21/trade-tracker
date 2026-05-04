import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './db/tables/db.createTable';
import postrouter from './routes/post.routes'
import getrouter from './routes/get.routes'
import patchrouter from './routes/patch.routes'

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;
async function runTables () {
    await createTables() 
}
runTables()
app.use(cors())
app.use(express.json());

[
    postrouter, 
    getrouter, 
    patchrouter,
].forEach(router => app.use(router)) 

app.listen(port, () => {
 console.log(`Server running at http://localhost:${port}`);
});