import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './db/tables/db.createTable';
import postrouter from './routes/post.routes'
import getrouter from './routes/get.routes'
import patchrouter from './routes/patch.routes'
import deleterouter from './routes/delete.routes'
import authrouter from './routes/auth.routes'
import { authMiddleware } from './middleware/auth.middleware'

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;

createTables()

app.use(cors())
app.use(express.json());

app.use(authrouter)

app.use(authMiddleware)

;[
    postrouter,
    getrouter,
    patchrouter,
    deleterouter,
].forEach(router => app.use(router))

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});