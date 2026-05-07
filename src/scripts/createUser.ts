import bcrypt from 'bcryptjs'
import { db, sqlRun } from '../db/dbconstructor'
import { createTables } from '../db/tables/db.createTable'

const [,, username, password] = process.argv

async function main() {
    if (!username || !password) {
        console.error('Usage: npx ts-node src/scripts/createUser.ts <username> <password>')
        process.exit(1)
    }
    await createTables()
    const hash = await bcrypt.hash(password, 12)
    await sqlRun(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, [username, hash])
    console.log(`User "${username}" created`)
    db.close()
}

main().catch(e => { console.error(e); process.exit(1) })
